import { Request, Response } from "express";
import {
    getAllOrder,
    getOrderStatusController,
    placeOrder,
    changeOrderStatusController,
    inactiveOrder,
} from "../../application/controllers/order-controller";

import * as orderService from "../../domain/services/order-service";
import { AuthRequest } from "../../infraestructure/auth/jwt-service";

jest.mock("../../domain/services/order-service", () => ({
    getOrder: jest.fn(),
    getOrderStatus: jest.fn(),
    createOrderFromCheckout: jest.fn(),
    updateOrderStatus: jest.fn(),
    inactiveLOrder: jest.fn(),
}));

const mockedService = orderService as jest.Mocked<typeof orderService>;

const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockRequest = (data: Partial<AuthRequest> = {}): AuthRequest =>
    (data as AuthRequest);

describe("order-controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getAllOrder", () => {
        it("retorna lista de órdenes exitosamente", async () => {
            const req = mockRequest();
            const res = mockResponse();
            const fakeOrders = [{ id: "1" }, { id: "2" }] as any;

            mockedService.getOrder.mockResolvedValueOnce(fakeOrders);

            await getAllOrder(req as any, res);

            expect(mockedService.getOrder).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                ok: true,
                data: fakeOrders,
            });
        });

        it("lanza error si getOrder falla", async () => {
            const req = mockRequest();
            const res = mockResponse();

            mockedService.getOrder.mockRejectedValueOnce(new Error("DB fail"));

            await expect(getAllOrder(req as any, res)).rejects.toThrow(
                "No se pudo obtener la orden"
            );
        });
    });

    describe("getOrderStatusController", () => {
        it("devuelve 200 con estado de orden", async () => {
            const req = mockRequest({
                user: { id: "user1", email: "test@test.com", role: "USER" },
                params: { orderId: "o1" },
            });
            const res = mockResponse();

            const fakeStatus = {
                orderId: "507f191e810c19729de860ea",
                orderNumber: "ORD12345",
                status: "EN_TRANSITO",
            } as any;

            mockedService.getOrderStatus.mockResolvedValueOnce(fakeStatus);

            await getOrderStatusController(req as any, res);

            expect(mockedService.getOrderStatus).toHaveBeenCalledWith("user1", "o1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                ok: true,
                data: fakeStatus,
            });
        });

        it("maneja error con status 400", async () => {
            const req = mockRequest({
                user: { id: "user1", email: "t@t.com", role: "USER" },
                params: { orderId: "o1" },
            });
            const res = mockResponse();

            mockedService.getOrderStatus.mockRejectedValueOnce(new Error("Order not found"));

            await getOrderStatusController(req as any, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    ok: false,
                    message: "Order not found",
                })
            );
        });
    });

    describe("placeOrder", () => {
        it("crea una orden exitosamente", async () => {
            const req = mockRequest({
                user: { id: "u1", email: "test@test.com", role: "USER" },
                body: { addressId: "addr123" },
            });
            const res = mockResponse();
            const fakeOrder = { id: "order123" } as any;

            mockedService.createOrderFromCheckout.mockResolvedValueOnce(fakeOrder);

            await placeOrder(req as any, res);

            expect(mockedService.createOrderFromCheckout).toHaveBeenCalledWith("u1", "addr123");
            expect(res.json).toHaveBeenCalledWith({
                ok: true,
                message: "Orden creada exitosamente",
                data: fakeOrder,
            });
        });

        it("retorna error 400 si el servicio lanza excepción", async () => {
            const req = mockRequest({
                user: { id: "u1", email: "t@t.com", role: "USER" },
                body: { addressId: "addr" },
            });
            const res = mockResponse();

            mockedService.createOrderFromCheckout.mockRejectedValueOnce(
                new Error("Error al crear la orden")
            );

            await placeOrder(req as any, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    ok: false,
                    message: "Error al crear la orden",
                })
            );
        });
    });

    describe("changeOrderStatusController", () => {
        it("retorna 400 si no se envía newStatus", async () => {
            const req = mockRequest({ params: { orderId: "o1" }, body: {} });
            const res = mockResponse();

            await changeOrderStatusController(req as any, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                ok: false,
                message: "newStatus es requerido en el body",
            });
        });

        it("actualiza el estado de la orden correctamente", async () => {
            const req = mockRequest({
                params: { orderId: "o1" },
                body: { newStatus: "ENTREGADO" },
            });
            const res = mockResponse();
            const updatedOrder = { id: "o1", status: "ENTREGADO" } as any;

            mockedService.updateOrderStatus.mockResolvedValueOnce(updatedOrder);

            await changeOrderStatusController(req as any, res);

            expect(mockedService.updateOrderStatus).toHaveBeenCalledWith("o1", "ENTREGADO");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                ok: true,
                message: "Estado actualizado a ENTREGADO",
                data: updatedOrder,
            });
        });

        it("maneja error en updateOrderStatus", async () => {
            const req = mockRequest({
                params: { orderId: "o1" },
                body: { newStatus: "CANCELADO" },
            });
            const res = mockResponse();

            mockedService.updateOrderStatus.mockRejectedValueOnce(new Error("No se pudo actualizar"));

            await changeOrderStatusController(req as any, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    ok: false,
                    message: "No se pudo actualizar",
                })
            );
        });
    });

    describe("inactiveOrder", () => {
        it("desactiva una orden exitosamente", async () => {
            const req = mockRequest({ params: { id: "o123" } });
            const res = mockResponse();
            const fakeOrder = { id: "o123", active: false } as any;

            mockedService.inactiveLOrder.mockResolvedValueOnce(fakeOrder);

            await inactiveOrder(req as any, res);

            expect(mockedService.inactiveLOrder).toHaveBeenCalledWith("o123");
            expect(res.json).toHaveBeenCalledWith({
                ok: true,
                data: fakeOrder,
            });
        });

        it("maneja error al desactivar la orden", async () => {
            const req = mockRequest({ params: { id: "o123" } });
            const res = mockResponse();

            mockedService.inactiveLOrder.mockRejectedValueOnce(new Error("Not found"));

            await inactiveOrder(req as any, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    ok: false,
                    message: "Error al desactivar la orden",
                    error: "Not found",
                })
            );
        });
    });
});
