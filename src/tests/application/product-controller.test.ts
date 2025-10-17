import { createRequest, createResponse } from 'node-mocks-http';
import { createProduct, deleteProduct, getAllProduct, updateProduct } from '../../application/controllers/product-controller';

jest.mock('../../domain/services/product-service', () => ({
    saveProduct: jest.fn(() => ({
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

    updateLProduct: jest.fn((id, data) => {
        if (id === "NOT_FOUND") return null;
        return {
            _id: id,
            ...data,
            createdAt: "2025-10-17T02:51:47.226Z",
            __v: 0
        };
    }),

    DeleteLProduct: jest.fn((id) => {
        if (id === "NOT_FOUND") throw new Error("Producto no encontrada");
        return {
            _id: id,
            updatedAt: "2025-10-17T03:10:00.000Z"
        };
    }), 

    getProduct: jest.fn(() => ([
        {
            _id: "68f1af4359f42963b0ed4b5b",
            name: "test",
            description: "test description",
            price: "test",
            stock: "test",
            categoryId: "test",
            imageUrl: "test",
            createdAt: "2025-10-17T02:51:47.226Z",
            __v: 0
        },
        {
            _id: "68f1af4359f42963b0ed4b5b",
            name: "test",
            description: "test",
            price: "test",
            stock: "test",
            categoryId: "test",
            imageUrl: "test",
            createdAt: "2025-10-17T02:51:47.226Z",
            __v: 0
        }
    ]))
}));

describe('product-controller tests', () => {
    describe('createProduct', () => {
        test('should create a new product', async () => {
            const mockProduct = {
                name: "test",
                description: "test",
                price: "test",
                stock: "test",
                categoryId: "test",
                imageUrl: "test"
            };

            const request = createRequest({ body: mockProduct });
            const response = createResponse();

            await createProduct(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toEqual({
                ok: true,
                staus: 'created',
                data: {
                    _id: "68f1af4359f42963b0ed4b5b",
                    name: "test",
                    description: "test",
                    price: "test",
                    stock: "test",
                    categoryId: "test",
                    imageUrl: "test",
                    createdAt: "2025-10-17T02:51:47.226Z",
                    __v: 0
                }
            });
        });
    });

    describe('updateProduct', () => {
        test('should update an existing product', async () => {
            const mockProductId = "68f1af4359f42963b0ed4b5b";
            const mockProductUpdate = {
                _id: "68f1af4359f42963b0ed4b5b",
                name: "test",
                description: "test",
                price: "test",
                stock: "test",
                categoryId: "test",
                imageUrl: "test",
                createdAt: "2025-10-17T02:51:47.226Z",
                __v: 0
            };

            const request = createRequest({
                params: { id: mockProductId },
                body: mockProductUpdate
            });

            const response = createResponse();

            await updateProduct(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toEqual({
                ok: true,
                data: {
                    name: "test",
                    description: "test",
                    price: "test",
                    stock: "test",
                    categoryId: "test",
                    imageUrl: "test"
                }
            });
        });

        test('should return 404 if product not found', async () => {
            const request = createRequest({
                params: { id: "NOT_FOUND" },
                body: {
                    name: "test",
                    description: "test",
                    price: "test",
                    stock: "test",
                    categoryId: "test",
                    imageUrl: "test"
                }
            });

            const response = createResponse();

            await updateProduct(request, response);

            expect(response.statusCode).toBe(404);
            expect(response._getJSONData()).toEqual({
                ok: false,
                message: "product con ID NOT_FOUND no encontrado."
            });
        });
    });

    describe('deleteProduct', () => {
        test('should delete an product successfully', async () => {
            const mockProductId = "68f1af4359f42963b0ed4b5b";
            const request = createRequest({ params: { id: mockProductId } });
            const response = createResponse();

            await deleteProduct(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toEqual({
                ok: true,
                data: {
                    _id: mockProductId,
                    active: false,
                    updatedAt: "2025-10-17T03:10:00.000Z"
                }
            });
        });

        test('should return 404 if product not found', async () => {
            const request = createRequest({ params: { id: "NOT_FOUND" } });
            const response = createResponse();

            await deleteProduct(request, response);

            expect(response.statusCode).toBe(404);
            expect(response._getJSONData()).toEqual(
                expect.objectContaining({
                    ok: false,
                    message: "Error al eliminar la orden",
                    error: "Producto no encontrada"
                })
            );
        });
    }); 

    describe('getAllProduct', () => {
        test('should return all products successfully', async () => {
            const request = createRequest();
            const response = createResponse();

            await getAllProduct(request, response);

            expect(response.statusCode).toBe(200);
            expect(response._getJSONData()).toEqual({
                ok: true,
                data: expect.arrayContaining([
                    expect.objectContaining({
                    name: "test",
                    description: "test",
                    price: "test",
                    stock: "test",
                    categoryId: "test",
                    imageUrl: "test"
                    }),
                    expect.objectContaining({
                    name: "test",
                    description: "test",
                    price: "test",
                    stock: "test",
                    categoryId: "test",
                    imageUrl: "test"
                    })
                ])
            });
        });

        test('should throw error if getProduct fails', async () => {
            const { getProduct } = require('../../domain/services/product-service');
            getProduct.mockImplementationOnce(() => {
                throw new Error("Database error");
            });

            const request = createRequest();
            const response = createResponse();

            await expect(getAllProduct(request, response)).rejects.toThrow("No se pudo obtener el producto");
        });
    });
});
