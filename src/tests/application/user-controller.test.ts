import { createRequest, createResponse } from 'node-mocks-http';
import { saveUser } from '../../domain/services/user-service';
import { createUser } from '../../application/controllers/user-controller';

jest.mock('../../domain/services/user-service', () => ({
    saveUser: jest.fn(() => {
        return {
            _id: "68efcc7a143cf0ccfa6e4dca",
            name: "test",
            lastName: "test",
            email: "test@test.com",
            userName: "test",
            isAdmin: false,
            createdAt: "2025-10-15T16:31:54.697Z",
            active: true,
            __v: 0
        }
    })
}));

describe('user-controller tests', () => {
    describe('when createUser is called withim a new user', () => {

        beforeAll(() => {

        });

        test('should create a new user', async () => {

            const mockUser = { name: "test", lastName: "test", email: "test@test.com", userName: "test" }

            const request = createRequest({
                body: {
                    name: mockUser.name,
                    lastname: mockUser.lastName,
                    email: mockUser.email,
                    userName: mockUser.userName,
                }
            });

            const response = createResponse();

            await createUser(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toEqual({
                ok: true,
                staus: 'created',
                data: {
                    _id: "68efcc7a143cf0ccfa6e4dca",
                    name: "test",
                    lastName: "test",
                    email: "test@test.com",
                    userName: "test",
                    isAdmin: false,
                    createdAt: "2025-10-15T16:31:54.697Z",
                    active: true,
                    __v: 0
                }
            });
        });
    });
});