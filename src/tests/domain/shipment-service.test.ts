import * as shipmentService from '../../domain/services/shipment-service';
import crypto from 'crypto';

jest.mock('../../domain/interfaces/Shipment', () => {
    const find = jest.fn();
    const findOne = jest.fn();
    const findById = jest.fn();
    const deleteOne = jest.fn();

    const ShipmentMock = jest.fn().mockImplementation((data) => ({
        ...data,
        save: jest.fn().mockResolvedValue(data),
    }));

    (ShipmentMock as any).find = find;
    (ShipmentMock as any).findOne = findOne;
    (ShipmentMock as any).findById = findById;
    (ShipmentMock as any).deleteOne = deleteOne;

    return {
        Shipment: ShipmentMock,
        __esModule: true,
    };
});

jest.mock('../../domain/interfaces/Order', () => {
    const findOne = jest.fn();

    const OrderMock: any = {};
    OrderMock.findOne = findOne;

    return {
        Order: OrderMock,
        __esModule: true,
    };
});

import { Shipment } from '../../domain/interfaces/Shipment';
import { Order } from '../../domain/interfaces/Order';

describe('shipment.service', () => {
    const ShipmentMock = Shipment as unknown as jest.Mock & {
        find: jest.Mock;
        findOne: jest.Mock;
        findById: jest.Mock;
        deleteOne: jest.Mock;
        mockImplementationOnce: jest.Mock;
    };

    const OrderMock = Order as unknown as {
        findOne: jest.Mock;
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('getShipment', () => {
        it('devuelve envíos cuando Shipment.find resuelve', async () => {
            const items = [{ orderId: 'o1' }];
            ShipmentMock.find.mockResolvedValueOnce(items);

            const res = await shipmentService.getShipment();

            expect(ShipmentMock.find).toHaveBeenCalled();
            expect(res).toBe(items);
        });

        it('lanza error con el mensaje correcto cuando find falla', async () => {
            ShipmentMock.find.mockRejectedValueOnce(new Error('db fail'));

            await expect(shipmentService.getShipment())
                .rejects
                .toThrow('Hubo un error obteniendo los envios');
        });
    });

    describe('assignShipment', () => {
        it('lanza error si la orden ya tiene envío asignado', async () => {
            ShipmentMock.findOne.mockImplementationOnce((query: any) => {
                if (query && query.orderId) return { orderId: query.orderId };
                return null;
            });

            await expect(shipmentService.assignShipment('order1', 'DHL'))
                .rejects
                .toThrow('La orden ya tiene un envío asignado');

            expect(ShipmentMock.findOne).toHaveBeenCalledWith({ orderId: 'order1' });
        });

        it('lanza error si la orden no existe', async () => {

            ShipmentMock.findOne.mockImplementationOnce((query: any) => {
                if (query && query.orderId) return null;
                return null;
            });
            OrderMock.findOne.mockResolvedValueOnce(null);

            await expect(shipmentService.assignShipment('orderX', 'FAST'))
                .rejects
                .toThrow('La orden no existe.');
        });

        it('genera un tracking único (reintento si hay duplicado) y crea el envío', async () => {

            const orderId = 'ord-123';
            const carrier = 'carr';
            let trackingChecks = 0;
            ShipmentMock.findOne.mockImplementation((query: any) => {
                if (query.orderId) return null; 
                if (query.trackingNumber) {
                    trackingChecks += 1;
                    return trackingChecks === 1 ? { trackingNumber: 'DUP' } : null;
                }
                return null;
            });

            OrderMock.findOne.mockResolvedValueOnce({ _id: orderId });

            jest.spyOn(crypto, 'randomBytes').mockImplementation((size: number) =>
                Buffer.from('aabbccdd', 'hex')
            );

            ShipmentMock.mockImplementationOnce((data: any) => ({
                ...data,
                save: jest.fn().mockResolvedValue(data),
            }));

            const created = await shipmentService.assignShipment(orderId, carrier);

            expect(OrderMock.findOne).toHaveBeenCalledWith({ _id: orderId });
            expect(created.trackingNumber).toMatch(new RegExp(`${carrier.toUpperCase()}-`));
            expect(created.orderId).toBe(orderId);
            expect(trackingChecks).toBeGreaterThanOrEqual(2);
        });

        it('propaga mensaje de error del save', async () => {
            const orderId = 'o-err';
            ShipmentMock.findOne.mockImplementation((query: any) => {
                if (query.orderId) return null;
                return null;
            });
            OrderMock.findOne.mockResolvedValueOnce({ _id: orderId });

            ShipmentMock.mockImplementationOnce(() => ({
                save: jest.fn().mockRejectedValue(new Error('save fail')),
            }));

            await expect(shipmentService.assignShipment(orderId, 'UPS'))
                .rejects
                .toThrow('save fail');
        });
    });

    describe('updateShipmentStatus', () => {
        it('lanza error si no encuentra el shipment', async () => {
            ShipmentMock.findById.mockResolvedValueOnce(null);

            await expect(shipmentService.updateShipmentStatus('s1', 'EN_TRANSITO', false))
                .rejects
                .toThrow('Shipment no encontrado');
        });

        it('lanza error si el estado es inválido', async () => {
            const shipment = { statusId: 'CREATED', save: jest.fn() };
            ShipmentMock.findById.mockResolvedValueOnce(shipment);

            await expect(shipmentService.updateShipmentStatus('s1', 'INVALID', false))
                .rejects
                .toThrow('Estado inválido');
        });

        it('lanza error si el cambio no es secuencial', async () => {
            const shipment = { statusId: 'CREATED', save: jest.fn() };
            ShipmentMock.findById.mockResolvedValueOnce(shipment);

            await expect(shipmentService.updateShipmentStatus('s1', 'ENTREGADO', true))
                .rejects
                .toThrow('Solo se puede avanzar al siguiente estado secuencial');
        });

        it('requiere proof para ENTREGADO', async () => {
            const shipment = {
                statusId: 'EN_ENTREGA',
                save: jest.fn().mockResolvedValue(true)
            };
            ShipmentMock.findById.mockResolvedValueOnce(shipment);

            await expect(shipmentService.updateShipmentStatus('s1', 'ENTREGADO', false))
                .rejects
                .toThrow('El estado ENTREGADO requiere confirmación del cliente');
        });

        it('avanza de CREATED a EN_TRANSITO correctamente', async () => {
            const fakeSave = jest.fn().mockResolvedValue(true);
            const shipment: any = {
                statusId: 'CREATED',
                save: fakeSave,
                updatedAt: undefined
            };
            ShipmentMock.findById.mockResolvedValueOnce(shipment);

            const res = await shipmentService.updateShipmentStatus('s1', 'EN_TRANSITO', false);

            expect(res.statusId).toBe('EN_TRANSITO');
            expect(shipment.save).toHaveBeenCalled();
            expect(res.updatedAt).toBeInstanceOf(Date);
        });

        it('marca ENTREGADO correctamente cuando proof es true', async () => {
            const fakeSave = jest.fn().mockResolvedValue(true);
            const shipment: any = {
                statusId: 'EN_ENTREGA',
                save: fakeSave,
                confirmedByCustomer: false,
                deliveryAt: undefined,
                updatedAt: undefined
            };
            ShipmentMock.findById.mockResolvedValueOnce(shipment);

            const res = await shipmentService.updateShipmentStatus('s1', 'ENTREGADO', true);

            expect(res.statusId).toBe('ENTREGADO');
            expect(res.confirmedByCustomer).toBe(true);
            expect(res.deliveryAt).toBeInstanceOf(Date);
            expect(shipment.save).toHaveBeenCalled();
        });
    });

    describe('deleteLShipment', () => {
        it('lanza error si no se eliminó nada', async () => {
            ShipmentMock.deleteOne.mockResolvedValueOnce({ deletedCount: 0 });

            await expect(shipmentService.deleteLShipment('not_found_id'))
                .rejects
                .toThrow('Hubo un error eliminando el envio');
        });

        it('retorna mensaje cuando se elimina correctamente', async () => {
            ShipmentMock.deleteOne.mockResolvedValueOnce({ deletedCount: 1 });

            const res = await shipmentService.deleteLShipment('found_id');

            expect(ShipmentMock.deleteOne).toHaveBeenCalledWith({ _id: 'found_id' });
            expect(res).toHaveProperty('message', 'Envio eliminado correctamente');
            expect(res.deleteLShipment).toBeDefined();
            expect(typeof res.deleteLShipment).toBe('function');
        });
    });
});
