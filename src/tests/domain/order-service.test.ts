import { getOrder, createOrderFromCheckout, generateOrderNumber, getOrderStatus, updateOrderStatus } from '../../domain/services/order-service';
import { Order } from '../../domain/interfaces/Order';
import { User } from '../../domain/interfaces/User';
import { Cart } from '../../domain/interfaces/Cart';
import { Product } from '../../domain/interfaces/Product';
import { Address } from '../../domain/interfaces/Adress'; 
import { sendEmail } from '../../infraestructure/emails/email.service'; 

import { OrderStatus } from '../../domain/config/dictionary.enum'; 


let GenerateOrderNumberSpy: jest.SpyInstance;

type OrderStatusType = OrderStatus; 

const OrderFindMock = {
    populate: jest.fn(),
};

const OrderFindByIdLeanMock = jest.fn();

const createMockOrderInstance = (initialStatus: OrderStatusType, items: any[] = [], userId: string = 'user123', orderNumber: string = 'ORD-TEST-001') => ({
    _id: 'ord999',
    userId,
    orderNumber,
    orderStatusId: initialStatus,
    items,
    save: jest.fn().mockResolvedValue(true), 
});


jest.mock('../../domain/interfaces/Order', () => {
    const mockConstructor = jest.fn().mockImplementation((data) => {
        return {
            ...data,
            orderStatusId: OrderStatus.PENDIENTE,
            save: jest.fn().mockResolvedValue(data),
        };
    });

    const OrderStaticMethodsMock = {
        find: jest.fn(() => OrderFindMock),
        findById: jest.fn(), 
    };

    return {
        __esModule: true,
        Order: mockConstructor,
        ...Object.assign(mockConstructor, OrderStaticMethodsMock),
    };
});


jest.mock('../../infraestructure/emails/email.service', () => ({
    __esModule: true,
    sendEmail: jest.fn(),
}));

jest.mock('../../domain/interfaces/Product', () => ({
    __esModule: true,
    Product: {
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
    },
}));

jest.mock('../../domain/interfaces/User', () => ({
    __esModule: true,
    User: {
        findById: jest.fn(),
    },
}));

jest.mock('../../domain/interfaces/Cart', () => ({
    __esModule: true,
    Cart: {
        findOne: jest.fn(),
        findByIdAndDelete: jest.fn(),
    },
}));

jest.mock('../../domain/interfaces/Adress', () => {
    return { 
        __esModule: true,
        Address: {
            findById: jest.fn(),
        },
    };
});

const OrderMockConstructor = Order as unknown as jest.Mock;

const UserFindByIdMock = (User as any).findById as jest.Mock;
const CartFindOneMock = (Cart as any).findOne as jest.Mock;
const CartFindByIdAndDeleteMock = (Cart as any).findByIdAndDelete as jest.Mock;
const ProductFindByIdMock = (Product as any).findById as jest.Mock;
const ProductFindByIdAndUpdateMock = (Product as any).findByIdAndUpdate as jest.Mock;
const AdressFindByIdMock = (Address as any).findById as jest.Mock; 

const SendEmailMock = sendEmail as jest.Mock;

const OrderFindStaticMock = (Order as any).find as jest.Mock;
const OrderFindByIdStaticMock = (Order as any).findById as jest.Mock;
const OrderPopulateMock = OrderFindMock.populate as jest.Mock;

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

beforeAll(() => {
    const OrderServiceModule = require('../../domain/services/order-service');
    GenerateOrderNumberSpy = jest.spyOn(OrderServiceModule, 'generateOrderNumber');
});

afterAll(() => {
    consoleErrorSpy.mockRestore();
    GenerateOrderNumberSpy.mockRestore(); 
});


const mockOrders = [
    {
        _id: 'ord1',
        userId: 'user123',
        items: [{ name: 'A' }],
        total: 100,
        shippingAddressId: { _id: 'addr1', street: 'Test Street' },
        status: 'completed',
    },
    {
        _id: 'ord2',
        userId: 'user456',
        items: [{ name: 'B' }],
        total: 200,
        shippingAddressId: { _id: 'addr2', street: 'Other Street' },
        status: 'pending',
    },
];

describe('getOrder Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy.mockClear();
        
        OrderFindStaticMock.mockImplementation(() => OrderFindMock);
        OrderPopulateMock.mockResolvedValue(mockOrders); 
        
        OrderFindByIdStaticMock.mockImplementation(jest.fn());
    });

    test('debería devolver todas las órdenes con la dirección de envío populada', async () => {
        const result = await getOrder();

        expect(OrderFindStaticMock).toHaveBeenCalledTimes(1);
        expect(OrderPopulateMock).toHaveBeenCalledWith('shippingAddressId');

        expect(result).toEqual(mockOrders);
        expect(result).toHaveLength(2);
        const populatedAddress = (result[0].shippingAddressId as any);
        expect(populatedAddress.street).toBe('Test Street');
    });

    test('debería manejar errores y lanzar una excepción con un mensaje genérico', async () => {
        const mockError = new Error('Database connection failed');
        
        OrderFindStaticMock.mockImplementationOnce(() => ({
            populate: jest.fn().mockRejectedValueOnce(mockError)
        }));

        await expect(getOrder())
            .rejects
            .toThrow("Hubo un error obteniendo las ordenes");

        expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
});

describe('getOrderStatus Service', () => {
    const userId = 'user_abc';
    const orderId = 'order_xyz';
    const mockOrder = {
        _id: orderId,
        userId: userId,
        orderNumber: 'ORD-STATUS-100',
        orderStatusId: OrderStatus.PREPARANDO,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    
        OrderFindByIdStaticMock.mockImplementation(() => ({ lean: OrderFindByIdLeanMock }));
        OrderFindStaticMock.mockImplementation(jest.fn());
    });

    test('debería devolver el ID, número y estado de la orden si el usuario es el propietario', async () => {
        OrderFindByIdLeanMock.mockResolvedValue(mockOrder);

        const result = await getOrderStatus(userId, orderId);

        expect(OrderFindByIdStaticMock).toHaveBeenCalledWith(orderId);
        expect(OrderFindByIdLeanMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            orderId: mockOrder._id,
            orderNumber: mockOrder.orderNumber,
            status: mockOrder.orderStatusId,
        });
    });

    test('debería lanzar un error 404 si la orden no se encuentra', async () => {
        OrderFindByIdLeanMock.mockResolvedValue(null);

        await expect(getOrderStatus(userId, orderId)).rejects.toMatchObject({
            message: "Orden no encontrada",
            status: 404,
        });
    });

    test('debería lanzar un error 403 si el usuario no es el propietario de la orden', async () => {
        const foreignOrder = { ...mockOrder, userId: 'other_user' };
        OrderFindByIdLeanMock.mockResolvedValue(foreignOrder);

        await expect(getOrderStatus(userId, orderId)).rejects.toMatchObject({
            message: "Acceso denegado: no eres el propietario de la orden",
            status: 403,
        });
    });
});


describe('updateOrderStatus Service', () => {
    const orderId = 'order1';
    const userId = 'user1';
    const mockUser = { _id: userId, name: 'Test', lastName: 'User', email: 'test@user.com' };
    
    const mockItems = [
        { productId: 'P1', quantity: 3, unitPrice: 10 },
        { productId: 'P2', quantity: 1, unitPrice: 50 },
    ];

    let mockOrderInstance: ReturnType<typeof createMockOrderInstance>;
    
    beforeEach(() => {
        jest.clearAllMocks();

        mockOrderInstance = createMockOrderInstance(OrderStatus.PENDIENTE, mockItems, userId);
        OrderFindByIdStaticMock.mockResolvedValue(mockOrderInstance);
        
        UserFindByIdMock.mockResolvedValue(mockUser);
    });

    test('debería devolver la orden sin cambios si el nuevo estado es el mismo', async () => {
        mockOrderInstance.orderStatusId = OrderStatus.PREPARANDO;
        const result = await updateOrderStatus(orderId, OrderStatus.PREPARANDO);

        expect(OrderFindByIdStaticMock).toHaveBeenCalledWith(orderId);
        expect(mockOrderInstance.save).not.toHaveBeenCalled();
        expect(SendEmailMock).not.toHaveBeenCalled();
        expect(result.orderStatusId).toBe(OrderStatus.PREPARANDO);
    });

    test('debería actualizar el estado y enviar email de PENDIENTE a PREPARANDO (transición normal)', async () => {
        mockOrderInstance.orderStatusId = OrderStatus.PENDIENTE;
        const newStatus = OrderStatus.PREPARANDO;

        const result = await updateOrderStatus(orderId, newStatus);

        expect(mockOrderInstance.save).toHaveBeenCalledTimes(1);
        expect(SendEmailMock).toHaveBeenCalledTimes(1);
        expect(result.orderStatusId).toBe(newStatus);
        
        expect(SendEmailMock).toHaveBeenCalledWith(
            mockUser.email,
            expect.any(String),
            expect.stringContaining(`cambió: <b>${OrderStatus.PENDIENTE}</b> -> <b>${newStatus}</b>.`)
        );
        expect(ProductFindByIdAndUpdateMock).not.toHaveBeenCalled();
    });

    test('debería lanzar error si el nuevo estado es inválido', async () => {
        const newStatus = 'ESTADO_INVALIDO' as OrderStatusType;
        await expect(updateOrderStatus(orderId, newStatus)).rejects.toMatchObject({
            message: "Estado nuevo inválido",
            status: 400,
        });
    });

    test('debería lanzar error 404 si la orden no se encuentra', async () => {
        OrderFindByIdStaticMock.mockResolvedValue(null);

        await expect(updateOrderStatus(orderId, OrderStatus.PREPARANDO)).rejects.toMatchObject({
            message: "Orden no encontrada",
            status: 404, 
        });
        expect(OrderFindByIdStaticMock).toHaveBeenCalledWith(orderId);
    });

    test('debería lanzar error si se intenta cambiar una orden CANCELADA', async () => {
        mockOrderInstance.orderStatusId = OrderStatus.CANCELADO;
        
        await expect(updateOrderStatus(orderId, OrderStatus.ENTREGADO)).rejects.toMatchObject({
            message: "No se puede cambiar el estado de una orden cancelada",
            status: 400,
        });
        expect(mockOrderInstance.save).not.toHaveBeenCalled();
    });
    
    test('debería lanzar error si se intenta retroceder el estado (ej. de EN_ENTREGA a PREPARANDO)', async () => {
        mockOrderInstance.orderStatusId = OrderStatus.EN_ENTREGA; 
        const newStatus = OrderStatus.PREPARANDO;

        await expect(updateOrderStatus(orderId, newStatus)).rejects.toMatchObject({
            message: `No se permite retroceder en estados (actual: ${OrderStatus.EN_ENTREGA})`,
            status: 400,
        });
        expect(mockOrderInstance.save).not.toHaveBeenCalled();
    });

    test('debería actualizar el estado a CANCELADO y restaurar el stock', async () => {
        mockOrderInstance.orderStatusId = OrderStatus.PREPARANDO;
        const newStatus = OrderStatus.CANCELADO;

        await updateOrderStatus(orderId, newStatus);

        expect(ProductFindByIdAndUpdateMock).toHaveBeenCalledTimes(mockItems.length);
        expect(ProductFindByIdAndUpdateMock).toHaveBeenCalledWith(
            'P1', { $inc: { stock: mockItems[0].quantity } }
        );
        expect(ProductFindByIdAndUpdateMock).toHaveBeenCalledWith(
            'P2', { $inc: { stock: mockItems[1].quantity } }
        );
        expect(mockOrderInstance.save).toHaveBeenCalledTimes(1);
        expect(mockOrderInstance.orderStatusId).toBe(newStatus);
    });

    test('debería permitir la cancelación desde cualquier estado (retroceso permitido para CANCELADO)', async () => {
        mockOrderInstance.orderStatusId = OrderStatus.ENTREGADO;
        const newStatus = OrderStatus.CANCELADO;

        await expect(updateOrderStatus(orderId, newStatus)).resolves.toBeDefined();
        
        expect(mockOrderInstance.orderStatusId).toBe(newStatus);
        expect(ProductFindByIdAndUpdateMock).toHaveBeenCalledTimes(mockItems.length);
    });

    test('debería manejar el error de envío de email sin afectar la actualización de la orden', async () => {
        SendEmailMock.mockRejectedValue(new Error("SMTP Error"));

        const result = await updateOrderStatus(orderId, OrderStatus.PREPARANDO);

        expect(result.orderStatusId).toBe(OrderStatus.PREPARANDO);
        expect(mockOrderInstance.save).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Error enviando notificación de cambio de estado:",
            expect.any(Error)
        );
    });
});

describe('createOrderFromCheckout Service', () => {
    const userId = 'user999';
    const addressId = 'addr999';
    const cartId = 'cart999';

    const mockUser = { userId, name: 'Test User', email: 'test@user.com' };
    const mockAddress = { _id: addressId, street: '123 Main St' };

    const itemA = { productId: 'A1', name: 'Product A', quantity: 2, unitPrice: 100.00, subtotal: 200.00 };
    const itemB = { productId: 'B2', name: 'Product B', quantity: 1, unitPrice: 50.00, subtotal: 50.00 };
    const mockCart = {
        _id: cartId,
        userId,
        items: [itemA, itemB],
        total: 250.00,
    };

    const productA_DB = { _id: 'A1', name: 'Product A', stock: 10, price: 100.00 };
    const productB_DB = { _id: 'B2', name: 'Product B', stock: 5, price: 50.00 };

    beforeEach(() => {
        jest.clearAllMocks();
        
        OrderFindByIdStaticMock.mockImplementation(jest.fn());

        GenerateOrderNumberSpy.mockReturnValue('ORD-2025-1001');
        SendEmailMock.mockResolvedValue(true); 

        CartFindOneMock.mockResolvedValue(mockCart);
        UserFindByIdMock.mockResolvedValue(mockUser);
        AdressFindByIdMock.mockResolvedValue(mockAddress); 

        ProductFindByIdMock.mockImplementation((productId: string) => {
            if (productId === 'A1') return productA_DB;
            if (productId === 'B2') return productB_DB;
            return null;
        });

        ProductFindByIdAndUpdateMock.mockResolvedValue(true);
        CartFindByIdAndDeleteMock.mockResolvedValue(mockCart);
    });

    test('debería crear una orden, actualizar el stock, eliminar el carrito y enviar un email', async () => {
        const result = await createOrderFromCheckout(userId, addressId);

        expect(CartFindOneMock).toHaveBeenCalledWith({ userId });
        expect(UserFindByIdMock).toHaveBeenCalledWith(userId);
        expect(AdressFindByIdMock).toHaveBeenCalledWith(addressId); 

        expect(GenerateOrderNumberSpy).toHaveBeenCalledTimes(1);
        expect(OrderMockConstructor).toHaveBeenCalledTimes(1); 

        const orderInstance = OrderMockConstructor.mock.results[0].value;
        expect(orderInstance.save).toHaveBeenCalledTimes(1);

        expect(ProductFindByIdAndUpdateMock).toHaveBeenCalledTimes(mockCart.items.length);
        expect(ProductFindByIdAndUpdateMock).toHaveBeenCalledWith('A1', { $inc: { stock: -itemA.quantity } });
        expect(ProductFindByIdAndUpdateMock).toHaveBeenCalledWith('B2', { $inc: { stock: -itemB.quantity } });

        expect(CartFindByIdAndDeleteMock).toHaveBeenCalledWith(cartId);

        expect(SendEmailMock).toHaveBeenCalledTimes(1);
        expect(SendEmailMock).toHaveBeenCalledWith(
            mockUser.email,
            expect.any(String),
            expect.stringContaining(`Tu pedido <b>ORD-2025-1001</b> ha sido creado exitosamente.`)
        );

        expect(result.orderNumber).toBe('ORD-2025-1001');
        expect(result.totalAmount).toBe(250.00);
    });

    test('debería lanzar error si el carrito no se encuentra', async () => {
        CartFindOneMock.mockResolvedValue(null);

        await expect(createOrderFromCheckout(userId, addressId))
            .rejects
            .toThrow("No se encontró el carrito del usuario.");
    });

    test('debería lanzar error si el usuario no se encuentra', async () => {
        UserFindByIdMock.mockResolvedValue(null);

        await expect(createOrderFromCheckout(userId, addressId))
            .rejects
            .toThrow("Usuario no encontrado.");
    });

    test('debería lanzar error si la dirección no se encuentra', async () => {
        AdressFindByIdMock.mockResolvedValue(null); 

        await expect(createOrderFromCheckout(userId, addressId))
            .rejects
            .toThrow("Dirección no encontrada.");
    });

    test('debería lanzar error si el carrito está vacío', async () => {
        CartFindOneMock.mockResolvedValue({ ...mockCart, items: [] });

        await expect(createOrderFromCheckout(userId, addressId))
            .rejects
            .toThrow("El carrito está vacío.");
    });

    test('debería lanzar error si un producto en el carrito no existe en la base de datos', async () => {
        ProductFindByIdMock.mockImplementation((productId: string) => {
            if (productId === 'A1') return productA_DB;
            if (productId === 'B2') return null;
            return null;
        });

        await expect(createOrderFromCheckout(userId, addressId))
            .rejects
            .toThrow(`El producto ${itemB.name} no existe.`);

        expect(ProductFindByIdAndUpdateMock).not.toHaveBeenCalled();
    });

    test('debería lanzar error si el stock es insuficiente para un producto', async () => {
        ProductFindByIdMock.mockImplementation((productId: string) => {
            if (productId === 'A1') return { ...productA_DB, stock: 1 };
            if (productId === 'B2') return productB_DB;
            return null;
        });

        await expect(createOrderFromCheckout(userId, addressId))
            .rejects
            .toThrow(`Stock insuficiente para el producto ${itemA.name}.`);

        expect(ProductFindByIdAndUpdateMock).not.toHaveBeenCalled();
    });
});
