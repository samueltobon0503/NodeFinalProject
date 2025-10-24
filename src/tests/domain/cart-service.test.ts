import { addToCart, updateCartItemQuantity, getCartByUserId, removeFromCart } from '../../domain/services/cart-service';
import { Cart } from '../../domain/interfaces/Cart';
import { Product } from '../../domain/interfaces/Product';

jest.mock('../../domain/interfaces/Product', () => ({
    __esModule: true,

    Product: {
        findById: jest.fn(),
    },
}));

const CartMockStatic = {
    findOne: jest.fn(),
    findByIdAndDelete: jest.fn(),
};

jest.mock('../../domain/interfaces/Cart', () => {

    const mockCartInstanceBase = {
        userId: 'user123',
        items: [],
        total: 0,
        expiresAt: new Date(),
    };

    const MockCartConstructor = jest.fn().mockImplementation((data) => {
        return {
            ...mockCartInstanceBase,
            ...data,
            save: jest.fn().mockResolvedValue({
                ...mockCartInstanceBase,
                ...data,
            }),
        };
    });

    return {
        __esModule: true,
        Cart: MockCartConstructor,
    };
});

(Cart.findOne as jest.Mock) = CartMockStatic.findOne;
(Cart.findByIdAndDelete as jest.Mock) = CartMockStatic.findByIdAndDelete;

const ProductFindByIdMock = (Product as any).findById as jest.Mock;

const EXPIRATION_TIME = 86400000;
const FIXED_CURRENT_TIME = new Date('2025-10-24T10:00:00.000Z').getTime();


describe('Cart Services (addToCart)', () => {
    const userId = 'user123';
    const productId = 'prod456';
    const quantity = 2;
    const baseProductData = {
        _id: productId,
        name: 'Test Product',
        active: true,
        stock: 10,
        price: 50.50,
    };


    beforeEach(() => {
        jest.clearAllMocks();
        CartMockStatic.findOne.mockResolvedValue(null);
        CartMockStatic.findByIdAndDelete.mockResolvedValue({ deletedCount: 1 });
        ProductFindByIdMock.mockResolvedValue(baseProductData);
    });


    test('debería crear un nuevo carrito y agregar el producto', async () => {
        const result = await addToCart(userId, productId, quantity);

        expect(ProductFindByIdMock).toHaveBeenCalledWith(productId);
        expect(CartMockStatic.findOne).toHaveBeenCalledWith({ userId });
        expect(Cart).toHaveBeenCalledTimes(1);

        expect(result.items).toHaveLength(1);
        expect(result.total).toBe(101.00);
        expect(result.save).toHaveBeenCalledTimes(1);
    });

    test('debería actualizar la cantidad y subtotal de un producto existente', async () => {
        const existingCartInstance = {
            userId: userId,
            items: [{
                productId: productId,
                name: baseProductData.name,
                quantity: 1,
                unitPrice: baseProductData.price,
                subtotal: 50.50,
            }],
            total: 50.50,
            save: jest.fn().mockImplementation(function () { return Promise.resolve(this); }),
        };

        CartMockStatic.findOne.mockResolvedValue(existingCartInstance);

        const newQuantityToAdd = 3;
        const result = await addToCart(userId, productId, newQuantityToAdd);

        const newSubtotal = 50.50 * 4;

        expect(result.items[0].quantity).toBe(4);
        expect(result.total).toBe(newSubtotal);
        expect(existingCartInstance.save).toHaveBeenCalledTimes(1);
    });


    test('debería lanzar error si la cantidad solicitada supera el stock', async () => {
        ProductFindByIdMock.mockResolvedValue({ ...baseProductData, stock: 1 });

        await expect(addToCart(userId, productId, 2))
            .rejects
            .toThrow("Cantidad solicitada supera el stock disponible");
    });

    test('debería lanzar error si el producto no está activo', async () => {
        ProductFindByIdMock.mockResolvedValue({ ...baseProductData, active: false });
        await expect(addToCart(userId, productId, quantity))
            .rejects
            .toThrow("Producto no disponible");
    });
});


describe('updateCartItemQuantity Service', () => {
    const userId = 'user123';
    const productId = 'prod789';
    const initialPrice = 30.00;
    const initialQuantity = 5;
    const newQuantity = 8;

    const mockProduct = {
        _id: productId,
        name: 'Update Product',
        active: true,
        stock: 15,
        price: initialPrice,
    };

    let existingCartWithItem: any;

    beforeEach(() => {
        jest.clearAllMocks();
        CartMockStatic.findByIdAndDelete.mockResolvedValue({ deletedCount: 1 });

        existingCartWithItem = {
            userId: userId,
            items: [{
                productId: productId,
                name: mockProduct.name,
                quantity: initialQuantity,
                unitPrice: initialPrice,
                subtotal: initialPrice * initialQuantity,
                priceLockedUntil: new Date(),
            }],
            total: initialPrice * initialQuantity,
            updatedAt: new Date(),
            expiresAt: new Date(),
            save: jest.fn().mockImplementation(function () { return Promise.resolve(this); }),
        };

        CartMockStatic.findOne.mockResolvedValue(existingCartWithItem);
        ProductFindByIdMock.mockResolvedValue(mockProduct);
    });


    test('debería actualizar la cantidad del ítem y el subtotal correctamente', async () => {
        const expectedSubtotal = parseFloat((initialPrice * newQuantity).toFixed(2));

        const result = await updateCartItemQuantity(userId, productId, newQuantity);

        expect(CartMockStatic.findOne).toHaveBeenCalledWith({ userId });
        expect(ProductFindByIdMock).toHaveBeenCalledWith(productId);

        const updatedItem = result.items.find((i: any) => i.productId === productId);
        expect(updatedItem.quantity).toBe(newQuantity); 
        expect(updatedItem.subtotal).toBe(expectedSubtotal);

        expect(result.save).toHaveBeenCalledTimes(1);
    });


    test('debería lanzar error si el carrito no es encontrado', async () => {
        CartMockStatic.findOne.mockResolvedValue(null);

        await expect(updateCartItemQuantity(userId, productId, newQuantity))
            .rejects
            .toThrow("Carrito no encontrado");

        expect(ProductFindByIdMock).not.toHaveBeenCalled();
    });

    test('debería lanzar error si el producto no está en el carrito', async () => {
        CartMockStatic.findOne.mockResolvedValue({
            ...existingCartWithItem,
            items: [{ productId: 'otherId', quantity: 1, unitPrice: 1, subtotal: 1 }],
            save: jest.fn(),
        });

        await expect(updateCartItemQuantity(userId, productId, newQuantity))
            .rejects
            .toThrow("Producto no encontrado en el carrito");

        expect(ProductFindByIdMock).not.toHaveBeenCalled();
    });

    test('debería lanzar error si el producto no se encuentra en la base de datos', async () => {
        ProductFindByIdMock.mockResolvedValue(null);

        await expect(updateCartItemQuantity(userId, productId, newQuantity))
            .rejects
            .toThrow("Producto no encontrado en la base de datos");

        expect(existingCartWithItem.save).not.toHaveBeenCalled();
    });

    test('debería lanzar error si la nueva cantidad supera el stock disponible', async () => {
        ProductFindByIdMock.mockResolvedValue({
            ...mockProduct,
            stock: 5,
        });

        await expect(updateCartItemQuantity(userId, productId, newQuantity))
            .rejects
            .toThrow("Stock insuficiente. Solo hay 5 unidades disponibles");

        expect(existingCartWithItem.save).not.toHaveBeenCalled();
        expect(existingCartWithItem.items[0].quantity).toBe(initialQuantity);
    });
});


describe('getCartByUserId Service', () => {

    const userId = 'user123';
    const cartId = 'cart999';

    const baseCart = {
        _id: cartId,
        userId: userId,
        items: [],
        total: 0,
        updatedAt: new Date(),
        expiresAt: new Date(),
        save: jest.fn(),
    };

    beforeAll(() => {
        jest.spyOn(Date, 'now').mockReturnValue(FIXED_CURRENT_TIME);
    });

    afterAll(() => {
        (Date.now as jest.Mock).mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        CartMockStatic.findOne.mockResolvedValue(null);
        CartMockStatic.findByIdAndDelete.mockResolvedValue({ deletedCount: 1 });
    });


    test('debería devolver NULL si el carrito no se encuentra', async () => {
        const result = await getCartByUserId(userId);
        expect(result).toBeNull();
        expect(CartMockStatic.findOne).toHaveBeenCalledWith({ userId });
        expect(CartMockStatic.findByIdAndDelete).not.toHaveBeenCalled();
    });

    test('debería devolver el carrito si no ha expirado', async () => {
        const activeCart = {
            ...baseCart,
            updatedAt: new Date(FIXED_CURRENT_TIME - (1000 * 60 * 60)), 
        };

        CartMockStatic.findOne.mockResolvedValue(activeCart);

        const result = await getCartByUserId(userId);

        expect(result).toEqual(activeCart);
        expect(CartMockStatic.findOne).toHaveBeenCalledWith({ userId });
        expect(CartMockStatic.findByIdAndDelete).not.toHaveBeenCalled();
    });

    test('debería eliminar el carrito y devolver NULL si ha expirado', async () => {
        const expiredCart = {
            ...baseCart,
            updatedAt: new Date(FIXED_CURRENT_TIME - EXPIRATION_TIME - (1000 * 60 * 60)),
            _id: cartId,
        };

        CartMockStatic.findOne.mockResolvedValue(expiredCart);

        const result = await getCartByUserId(userId);

        expect(CartMockStatic.findByIdAndDelete).toHaveBeenCalledWith(cartId);

        expect(result).toBeNull();
    });
});

describe('removeFromCart Service', () => {
    
    const userId = 'user123';
    const productIdToRemove = 'prod_remove';
    const productIdToKeep = 'prod_keep';

    const itemToRemove = {
        productId: productIdToRemove,
        name: 'Item to Remove',
        quantity: 2,
        unitPrice: 10.00,
        subtotal: 20.00,
    };

    const itemToKeep = {
        productId: productIdToKeep,
        name: 'Item to Keep',
        quantity: 3,
        unitPrice: 50.00,
        subtotal: 150.00,
    };

    let existingCart: any;

    beforeEach(() => {
        jest.clearAllMocks();
        
        (Product as any).findById.mockClear(); 

        existingCart = {
            userId: userId,
            items: [itemToRemove, itemToKeep],
            total: 170.00, // 20.00 + 150.00
            updatedAt: new Date(),
            expiresAt: new Date(),
            save: jest.fn().mockImplementation(function() { return Promise.resolve(this); }),
        };

        CartMockStatic.findOne.mockResolvedValue(existingCart);
    });

    test('debería eliminar el producto del carrito y recalcular el total', async () => {
        const result = await removeFromCart(userId, productIdToRemove);

        expect(CartMockStatic.findOne).toHaveBeenCalledWith({ userId });
    
        expect(result.items).toHaveLength(1);
        expect(result.items[0].productId).toBe(productIdToKeep);
        expect(result.total).toBe(itemToKeep.subtotal);
        expect(result.save).toHaveBeenCalledTimes(1);
        expect(result.updatedAt).toBeInstanceOf(Date);
    });


    test('debería lanzar error si el carrito no es encontrado', async () => {
        CartMockStatic.findOne.mockResolvedValue(null);

        await expect(removeFromCart(userId, productIdToRemove))
            .rejects
            .toThrow("Carrito no encontrado");
        
        expect(existingCart.save).not.toHaveBeenCalled();
    });

    test('debería lanzar error si el producto a eliminar no se encuentra en el carrito', async () => {
        const nonExistentProductId = 'non_existent_id';
                
        await expect(removeFromCart(userId, nonExistentProductId))
            .rejects
            .toThrow("Producto no encontrado en el carrito");
            
        expect(existingCart.items).toHaveLength(2);
        expect(existingCart.total).toBe(170.00); 
        expect(existingCart.save).not.toHaveBeenCalled();
    });
});