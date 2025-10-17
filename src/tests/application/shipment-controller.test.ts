import { createRequest, createResponse } from 'node-mocks-http';
import { createShipment, deleteShipment, getAllShipment, updateShipment } from '../../application/controllers/shipment-controller';

jest.mock('../../domain/services/shipment-service', () => ({
    saveShipment: jest.fn(() => ({
        _id: "68f1af4359f42963b0ed4b5b",
        name: "test",
        description: "test",
        price: "test",
        stock: "test",
        categoryId: "test",
        imageUrl: "test",
        createdAt: "2025-10-17T02:51:47.226Z",
        __v: 0
    })),

    updateLShipment: jest.fn((id, data) => {
        if (id === "NOT_FOUND") return null;
        return {
            _id: id,
            ...data,
            createdAt: "2025-10-17T02:51:47.226Z",
            __v: 0
        };
    }),

        DeleteLShipment: jest.fn((id) => {
            if (id === "NOT_FOUND") throw new Error("Envio no encontrada");
            return {
                _id: id,
                active: false,
                updatedAt: "2025-10-17T03:10:00.000Z"
            };
        }), 

    getShipment: jest.fn(() => ([
        {
            _id: "68f1af4359f42963b0ed4b5b",
            orderId: "test",
            trackingNumber: "test",
            carrier: "test",
            statusId: "test",
            shipmentAt: "test",
            deliveryAt: "test",
            createdAt: "2025-10-17T02:51:47.226Z",
            __v: 0
        },
        {
            _id: "68f1af4359f42963b0ed4b5b",
            orderId: "test",
            trackingNumber: "test",
            carrier: "test",
            statusId: "test",
            shipmentAt: "test",
            deliveryAt: "test",
            createdAt: "2025-10-17T02:51:47.226Z",
        }
    ]))
}));

describe('shipment-controller tests', () => {
    describe('createShipment', () => {
        test('should create a new shipment', async () => {
            const mockShipment = {
                orderId: "test",
                trackingNumber: "test",
                carrier: "test",
                statusId: "test",
                shipmentAt: "test",
            };

            const request = createRequest({ body: mockShipment });
            const response = createResponse();

            await createShipment(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toEqual({
                ok: true,
                staus: 'created',
                data: {
                    _id: "68f1af4359f42963b0ed4b5b",
                    orderId: "test",
                    trackingNumber: "test",
                    carrier: "test",
                    statusId: "test",
                    shipmentAt: "test",
                    deliveryAt: "test",
                    createdAt: "2025-10-17T02:51:47.226Z",
                    __v: 0
                }
            });
        });
    });

    describe('updateShipment', () => {
        test('should update an existing shipment', async () => {
            const mockShipmentId = "68f1af4359f42963b0ed4b5b";
            const mockShipmentUpdate = {
                _id: "68f1af4359f42963b0ed4b5b",
                orderId: "test",
                trackingNumber: "test",
                carrier: "test",
                statusId: "test",
                shipmentAt: "test",
                deliveryAt: "test",
                createdAt: "2025-10-17T02:51:47.226Z",
                active: true,
                __v: 0
            };

            const request = createRequest({
                params: { id: mockShipmentId },
                body: mockShipmentUpdate
            });

            const response = createResponse();

            await updateShipment(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toEqual({
                ok: true,
                data: {
                    orderId: "test",
                    trackingNumber: "test",
                    carrier: "test",
                    statusId: "test",
                    shipmentAt: "test",
                    deliveryAt: "test",
                }
            });
        });

        test('should return 404 if shipment not found', async () => {
            const request = createRequest({
                params: { id: "NOT_FOUND" },
                body: {
                    _id: "68f1af4359f42963b0ed4b5b",
                    orderId: "test",
                    trackingNumber: "test",
                    carrier: "test",
                    statusId: "test",
                    shipmentAt: "test",
                    deliveryAt: "test",
                    createdAt: "2025-10-17T02:51:47.226Z",
                }
            });

            const response = createResponse();

            await updateShipment(request, response);

            expect(response.statusCode).toBe(404);
            expect(response._getJSONData()).toEqual({
                ok: false,
                message: "shipment con ID NOT_FOUND no encontrado."
            });
        });
    });

        describe('deleteShipment', () => {
            test('should delete an shipment successfully', async () => {
                const mockShipmentId = "68f1af4359f42963b0ed4b5b";
                const request = createRequest({ params: { id: mockShipmentId } });
                const response = createResponse();
    
                await deleteShipment(request, response);
    
                expect(response.statusCode).toBe(200);
                expect(response._getJSONData()).toEqual({
                    ok: true,
                    data: {
                        _id: mockShipmentId,
                        active: false,
                        updatedAt: "2025-10-17T03:10:00.000Z"
                    }
                });
            });
    
            test('should return 404 if shipment not found', async () => {
                const request = createRequest({ params: { id: "NOT_FOUND" } });
                const response = createResponse();
    
                await deleteShipment(request, response);
    
                expect(response.statusCode).toBe(404);
                expect(response._getJSONData()).toEqual(
                    expect.objectContaining({
                        ok: false,
                        message: "Error al eliminar el envio",
                        error: "envio no encontrado"
                    })
                );
            });
        }); 

    describe('getAllShipment', () => {
        test('should return all products successfully', async () => {
            const request = createRequest();
            const response = createResponse();

            await getAllShipment(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toEqual({
                ok: true,
                data: expect.arrayContaining([
                    expect.objectContaining({
                        orderId: "test",
                        trackingNumber: "test",
                        carrier: "test",
                        statusId: "test",
                        shipmentAt: "test",
                        deliveryAt: "test"
                    }),
                    expect.objectContaining({
                        orderId: "test",
                        trackingNumber: "test",
                        carrier: "test",
                        statusId: "test",
                        shipmentAt: "test",
                        deliveryAt: "test"
                    })
                ])
            });
        });

        test('should throw error if getShipment fails', async () => {
            const { getShipment } = require('../../domain/services/shipment-service');
            getShipment.mockImplementationOnce(() => {
                throw new Error("Database error");
            });

            const request = createRequest();
            const response = createResponse();

            await expect(getAllShipment(request, response)).rejects.toThrow("No se pudo obtener el envio");
        });
    });
});