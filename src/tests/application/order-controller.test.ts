import { createRequest, createResponse } from 'node-mocks-http';
import { createOrder } from '../../application/controllers/order-controller';

jest.mock('../../domain/services/order-service', () => ({
    saveOrder: jest.fn(() => {
        return {
            _id: "68f1af4359f42963b0ed4b5b",
            userId: "test",
            totalAmount: "test",
            orderStatusId: "test",
            shippingAddressId: "test",
            createdAt: "2025-10-17T02:51:47.226Z",
            active: true,
            __v: 0
        }
    })
}));
describe('order-controller tests', () => {
    describe('when createOrder is called withim a new order', () => {

        beforeAll(() => {

        });

        test('should create a new order', async () => {

            const mockOrder = { userId: "test", totalAmount: "test", orderStatusId: "test", shippingAddressId: "test" }

            const request = createRequest({
                body: {
                    userId: mockOrder.userId,
                    totalAmount: mockOrder.totalAmount,
                    orderStatusId: mockOrder.orderStatusId,
                    shippingAddressId: mockOrder.shippingAddressId,
                }
            });

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
});