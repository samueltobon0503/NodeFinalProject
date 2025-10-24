
import { confirmCartBeforeCheckout, validateShippingInfo } from '../../domain/services/checkout-service'; 

import { Cart } from '../../domain/interfaces/Cart'; 
import { Product } from '../../domain/interfaces/Product'; 
import { Address } from '../../domain/interfaces/Adress'; 


jest.mock('../../domain/interfaces/Product', () => ({
    __esModule: true,
    Product: {
        findById: jest.fn(), 
    },
}));

const CartMockStatic = {
    findOne: jest.fn(),
};

jest.mock('../../domain/interfaces/Cart', () => {
    return {
        __esModule: true,
        Cart: {
            findOne: jest.fn(),
        },
    };
});

const AddressMockStatic = {
    findOne: jest.fn(),
};

jest.mock('../../domain/interfaces/Adress', () => ({
    __esModule: true,
    Address: {
        findOne: jest.fn(), 
    },
}));

(Cart.findOne as jest.Mock) = CartMockStatic.findOne; 
(Address.findOne as jest.Mock) = AddressMockStatic.findOne;

const ProductFindByIdMock = (Product as any).findById as jest.Mock;

describe('confirmCartBeforeCheckout Service', () => {
    const userId = 'user123';

    const productA_DB = { _id: 'A1', name: 'Product A', stock: 10, price: 100.00 };
    const productB_DB = { _id: 'B2', name: 'Product B', stock: 5, price: 20.00 };
    const productC_DB_LowStock = { _id: 'C3', name: 'Product C', stock: 1, price: 50.00 };

    const cartMock = {
        userId: userId,
        items: [
            { productId: 'A1', name: 'Old Name A', quantity: 2, unitPrice: 90.00, subtotal: 180.00 },
            { productId: 'B2', name: 'Old Name B', quantity: 4, unitPrice: 20.00, subtotal: 80.00 },
            { productId: 'C3', name: 'Product C', quantity: 5, unitPrice: 50.00, subtotal: 250.00 },
        ],
        total: 510.00,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        
        CartMockStatic.findOne.mockResolvedValue(cartMock);

        ProductFindByIdMock.mockImplementation((productId: string) => {
            if (productId === 'A1') return productA_DB;
            if (productId === 'B2') return productB_DB;
            if (productId === 'C3') return productC_DB_LowStock; 
            return null;
        });
    });

    test('debería confirmar el carrito, actualizar precios y recalcular el total', async () => {
        
        ProductFindByIdMock.mockImplementation((productId: string) => {
            if (productId === 'A1') return productA_DB;
            if (productId === 'B2') return productB_DB;
            if (productId === 'C3') return { ...productC_DB_LowStock, stock: 10 }; 
            return null;
        });

        const result = await confirmCartBeforeCheckout(userId);

        const expectedTotal = 200.00 + 80.00 + 250.00; 

        expect(result.items).toHaveLength(3);
        expect(result.total).toBe(expectedTotal);
    });

    test('debería lanzar error si el carrito no es encontrado', async () => {
        CartMockStatic.findOne.mockResolvedValue(null);

        await expect(confirmCartBeforeCheckout(userId))
            .rejects
            .toThrow("Carrito no encontrado");
    });

    test('debería lanzar error si un producto no existe en la base de datos', async () => {
        ProductFindByIdMock.mockImplementation((productId: string) => {
            if (productId === 'A1') return productA_DB;
            if (productId === 'B2') return null;
            return productC_DB_LowStock;
        });

        await expect(confirmCartBeforeCheckout(userId))
            .rejects
            .toThrow(`El producto Old Name B no existe`);
    });

    test('debería lanzar error si el stock de un producto es insuficiente', async () => {
        await expect(confirmCartBeforeCheckout(userId))
            .rejects
            .toThrow(`Stock insuficiente para ${productC_DB_LowStock.name}`);
    });
});

describe('validateShippingInfo Service', () => {
    
    const userId = 'user123';
    const addressId = 'addr456';
    
    const validAddressMock = {
        _id: addressId,
        userId: userId,
        street: '123 Main St',
        city: 'Metropolis',
        postalCode: '10001',
        country: 'USA',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        AddressMockStatic.findOne.mockResolvedValue(validAddressMock);
    });


    test('debería validar la dirección y el método de envío y devolver los datos', async () => {
        const shippingMethod = "standard";
        
        const result = await validateShippingInfo(userId, addressId, shippingMethod);

        expect(AddressMockStatic.findOne).toHaveBeenCalledWith({ _id: addressId });
        expect(result.address).toEqual(validAddressMock);
        expect(result.shippingMethod).toBe(shippingMethod);
    });
    
    test('debería aceptar el método de envío "express"', async () => {
        const shippingMethod = "express";
        
        const result = await validateShippingInfo(userId, addressId, shippingMethod);

        expect(result.shippingMethod).toBe(shippingMethod);
    });


    test('debería lanzar error si la dirección no se encuentra', async () => {
        AddressMockStatic.findOne.mockResolvedValue(null);

        await expect(validateShippingInfo(userId, addressId, "standard"))
            .rejects
            .toThrow("Dirección de envío no encontrada");
    });
    
    test('debería lanzar error si falta un campo requerido en la dirección (ej: street)', async () => {
        const incompleteAddress = { ...validAddressMock, street: undefined };
        AddressMockStatic.findOne.mockResolvedValue(incompleteAddress);

        await expect(validateShippingInfo(userId, addressId, "standard"))
            .rejects
            .toThrow("La dirección de envío está incompleta");
    });
    
    test('debería lanzar error si falta un campo requerido en la dirección (ej: city)', async () => {
        const incompleteAddress = { ...validAddressMock, city: '' }; 
        AddressMockStatic.findOne.mockResolvedValue(incompleteAddress);

        await expect(validateShippingInfo(userId, addressId, "standard"))
            .rejects
            .toThrow("La dirección de envío está incompleta");
    });

    test('debería lanzar error si el método de envío no es válido', async () => {
        const invalidMethod = "nextDay";

        await expect(validateShippingInfo(userId, addressId, invalidMethod))
            .rejects
            .toThrow("Método de envío no válido");
            
        expect(AddressMockStatic.findOne).toHaveBeenCalledWith({ _id: addressId });
    });
});