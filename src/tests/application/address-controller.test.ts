import { createRequest, createResponse } from 'node-mocks-http';
import { createAddress } from '../../application/controllers/address-controller';
import { count } from 'console';

jest.mock('../../domain/services/address-service', () => ({
    saveAddress: jest.fn(() => {
        return {
            _id: "68efcc7a143cf0ccfa6e4dca",
            userId: "test",
            street: "test",
            city: "test@test.com",
            state: "test",
            postalCode: "test",
            country: "test",
            createdAt: "2025-10-15T16:31:54.697Z",
            __v: 0
        }
    })
}));

describe('address-controller tests', () => {
    describe('when createAddress is called withim a new address', () => {

        beforeAll(() => {

        });

        test('should create a new address', async () => {

            const mockAddress = {
                userId: "test",
                street: "test",
                city: "test@test.com",
                state: "test",
                postalCode: "test",
                country: "test",
            }

            const request = createRequest({
                body: {
                    userId: mockAddress.userId,
                    street: mockAddress.street,
                    city: mockAddress.city,
                    state: mockAddress.state,
                    postalCode: mockAddress.postalCode,
                    country: mockAddress.country,
                }
            });

            const response = createResponse();

            await createAddress(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toEqual({
                ok: true,
                staus: 'created',
                data: {
                    _id: "68efcc7a143cf0ccfa6e4dca",
                    userId: "test",
                    street: "test",
                    city: "test@test.com",
                    state: "test",
                    postalCode: "test",
                    country: "test",
                    createdAt: "2025-10-15T16:31:54.697Z",
                    __v: 0
                }
            });
        });
    });
});