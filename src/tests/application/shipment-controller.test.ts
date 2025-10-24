import { Request, Response } from 'express';
import * as shipmentController from '../../application/controllers/shipment-controller';
import * as shipmentService from '../../domain/services/shipment-service';

jest.mock('../../domain/services/shipment-service', () => ({
  getShipment: jest.fn(),
  assignShipment: jest.fn(),
  deleteLShipment: jest.fn(),
}));

const mockedService = shipmentService as unknown as jest.Mocked<typeof shipmentService>;

function mockRequest(body?: any, params?: any): Request {
  return {
    body: body ?? {},
    params: params ?? {},
  } as unknown as Request;
}

function mockResponse() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res as Response);
  res.json = jest.fn().mockReturnValue(res as Response);
  return res as Response;
}

describe('shipment-controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllShipment', () => {
    it('responde con los envíos cuando getShipment resuelve', async () => {
      const shipments = [{ orderId: 'o1' }] as any;
      mockedService.getShipment.mockResolvedValueOnce(shipments);

      const req = mockRequest();
      const res = mockResponse();

      await shipmentController.getAllShipment(req, res);

      expect(mockedService.getShipment).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: shipments,
      });
    });

    it('lanza error cuando getShipment falla (implementación del controlador lo re-lanza)', async () => {
      mockedService.getShipment.mockRejectedValueOnce(new Error('db fail'));

      const req = mockRequest();
      const res = mockResponse();

      await expect(shipmentController.getAllShipment(req, res)).rejects.toThrow('No se pudo obtener el envio');
    });
  });

  describe('assignShipmentController', () => {
    it('responde 400 si faltan orderId o carrier', async () => {
      const req = mockRequest({}, {});
      const res = mockResponse();

      await shipmentController.assignShipmentController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: 'orderId y carrier son requeridos',
      });
    });

    it('responde 201 y retorna el shipment cuando assignShipment tiene éxito', async () => {
      const payload = { orderId: 'ord-1', carrier: 'DHL' };
      const created = { ...payload, trackingNumber: 'DHL-ABC' };
      mockedService.assignShipment.mockResolvedValueOnce(created as any);

      const req = mockRequest(payload, {});
      const res = mockResponse();

      await shipmentController.assignShipmentController(req, res);

      expect(mockedService.assignShipment).toHaveBeenCalledWith(payload.orderId, payload.carrier);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: 'Transportadora y número de guía asignados correctamente',
        data: created,
      });
    });

    it('responde 500 y muestra el mensaje del error cuando assignShipment falla', async () => {
      mockedService.assignShipment.mockRejectedValueOnce(new Error('service fail'));

      const req = mockRequest({ orderId: 'o1', carrier: 'UPS' }, {});
      const res = mockResponse();

      await shipmentController.assignShipmentController(req, res);

      expect(mockedService.assignShipment).toHaveBeenCalledWith('o1', 'UPS');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: 'service fail',
      });
    });
  });

  describe('deleteShipment', () => {
    it('responde 400 si no viene id en params', async () => {
      const req = mockRequest({}, {});
      const res = mockResponse();

      await shipmentController.deleteShipment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: 'El id no es valido',
      });
    });

    it('responde ok con data cuando deleteLShipment tiene éxito', async () => {
      const deleteResult = { message: 'Envio eliminado correctamente' };
      mockedService.deleteLShipment.mockResolvedValueOnce(deleteResult as any);

      const req = mockRequest({}, { id: 'sh-1' });
      const res = mockResponse();

      await shipmentController.deleteShipment(req, res);

      expect(mockedService.deleteLShipment).toHaveBeenCalledWith('sh-1');
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data: deleteResult,
      });
    });

    it('responde 404 con mensaje cuando deleteLShipment lanza error', async () => {
      mockedService.deleteLShipment.mockRejectedValueOnce(new Error('delete fail'));

      const req = mockRequest({}, { id: 'sh-404' });
      const res = mockResponse();

      await shipmentController.deleteShipment(req, res);

      expect(mockedService.deleteLShipment).toHaveBeenCalledWith('sh-404');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: 'Error al eliminar el envio',
        error: 'delete fail',
      });
    });
  });
});
