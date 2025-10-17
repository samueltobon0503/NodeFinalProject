import { createRequest, createResponse } from 'node-mocks-http';
import { createOrder, updateOrder, inactiveOrder, getAllOrder } from '../../application/controllers/order-controller';

jest.mock('../../domain/services/order-service', () => ({
    saveOrder: jest.fn(() => ({
        _id: "68f1af4359f42963b0ed4b5b",
        userId: "test",
        totalAmount: "test",
        orderStatusId: "test",
        shippingAddressId: "test",
        createdAt: "2025-10-17T02:51:47.226Z",
        active: true,
        __v: 0
    })),

    updateLOrder: jest.fn((id, data) => {
        if (id === "NOT_FOUND") return null;
        return {
            _id: id,
            ...data,
            createdAt: "2025-10-17T02:51:47.226Z",
            __v: 0
        };
    }),

    inactiveLOrder: jest.fn((id) => {
        if (id === "NOT_FOUND") throw new Error("Orden no encontrada");
        return {
            _id: id,
            active: false,
            updatedAt: "2025-10-17T03:10:00.000Z"
        };
    }),

    getOrder: jest.fn(() => ([
        {
            _id: "68f1af4359f42963b0ed4b5b",
            userId: "68f19abdbfbc4b108d49e961",
            totalAmount: "500000",
            orderStatusId: "ORD-ST-002",
            shippingAddressId: "66f1ab3d9f42963b0ed4a3f",
            createdAt: "2025-10-17T02:51:47.226Z",
            active: true,
            __v: 0
        },
        {
            _id: "68f1af4359f42963b0ed4b5c",
            userId: "68f19abdbfbc4b108d49e962",
            totalAmount: "250000",
            orderStatusId: "ORD-ST-001",
            shippingAddressId: "66f1ab3d9f42963b0ed4a40",
            createdAt: "2025-10-17T02:51:47.226Z",
            active: false,
            __v: 0
        }
    ]))
}));

describe('order-controller tests', () => {
    describe('createOrder', () => {
        test('should create a new order', async () => {
            const mockOrder = {
                userId: "test",
                totalAmount: "test",
                orderStatusId: "test",
                shippingAddressId: "test"
            };

            const request = createRequest({ body: mockOrder });
            const response = createResponse();

            await createOrder(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toEqual({
                ok: true,
                staus: 'created',
                data: {
                    _id: "68f1af4359f42963b0ed4b5b",
                    userId: "test",
                    totalAmount: "test",
                    orderStatusId: "test",
                    shippingAddressId: "test",
                    createdAt: "2025-10-17T02:51:47.226Z",
                    active: true,
                    __v: 0
                }
            });
        });
    });

    describe('updateOrder', () => {
        test('should update an existing order', async () => {
            const mockOrderId = "68f1af4359f42963b0ed4b5b";
            const mockOrderUpdate = {
                userId: "68f19abdbfbc4b108d49e961",
                totalAmount: "750000",
                orderStatusId: "ORD-ST-003",
                shippingAddressId: "66f1ab3d9f42963b0ed4a3f",
                active: true
            };

            const request = createRequest({
                params: { id: mockOrderId },
                body: mockOrderUpdate
            });

            const response = createResponse();

            await updateOrder(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toEqual({
                ok: true,
                data: {
                    _id: mockOrderId,
                    ...mockOrderUpdate,
                    createdAt: "2025-10-17T02:51:47.226Z",
                    __v: 0
                }
            });
        });

        test('should return 404 if order not found', async () => {
            const request = createRequest({
                params: { id: "NOT_FOUND" },
                body: {
                    userId: "68f19abdbfbc4b108d49e961",
                    totalAmount: "750000",
                    orderStatusId: "ORD-ST-003",
                    shippingAddressId: "66f1ab3d9f42963b0ed4a3f",
                    active: true
                }
            });

            const response = createResponse();

            await updateOrder(request, response);

            expect(response.statusCode).toBe(404);
            expect(response._getJSONData()).toEqual({
                ok: false,
                message: "orden con ID NOT_FOUND no encontrado."
            });
        });
    });

    describe('inactiveOrder', () => {
        test('should deactivate an order successfully', async () => {
            const mockOrderId = "68f1af4359f42963b0ed4b5b";
            const request = createRequest({ params: { id: mockOrderId } });
            const response = createResponse();

            await inactiveOrder(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toEqual({
                ok: true,
                data: {
                    _id: mockOrderId,
                    active: false,
                    updatedAt: "2025-10-17T03:10:00.000Z"
                }
            });
        });

        test('should return 404 if order not found', async () => {
            const request = createRequest({ params: { id: "NOT_FOUND" } });
            const response = createResponse();

            await inactiveOrder(request, response);

            expect(response.statusCode).toBe(404);
            expect(response._getJSONData()).toEqual(
                expect.objectContaining({
                    ok: false,
                    message: "Error al desactivar la orden",
                    error: "Orden no encontrada"
                })
            );
        });
    });

    describe('getAllOrder', () => {
        test('should return all orders successfully', async () => {
            const request = createRequest();
            const response = createResponse();

            await getAllOrder(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toEqual({
                ok: true,
                data: expect.arrayContaining([
                    expect.objectContaining({
                        _id: "68f1af4359f42963b0ed4b5b",
                        userId: "68f19abdbfbc4b108d49e961",
                        totalAmount: "500000"
                    }),
                    expect.objectContaining({
                        _id: "68f1af4359f42963b0ed4b5c",
                        userId: "68f19abdbfbc4b108d49e962",
                        totalAmount: "250000"
                    })
                ])
            });
        });

        test('should throw error if getOrder fails', async () => {
            const { getOrder } = require('../../domain/services/order-service');
            getOrder.mockImplementationOnce(() => {
                throw new Error("Database error");
            });

            const request = createRequest();
            const response = createResponse();

            await expect(getAllOrder(request, response)).rejects.toThrow("No se pudo obtener la orden");
        });
    });
});
