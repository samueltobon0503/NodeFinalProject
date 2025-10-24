import * as cartService from '../../domain/services/cart-service';
import { addProductToCart, getCart } from '../../application/controllers/cart-controller';
import { Response } from 'express';

jest.mock('../../domain/services/cart-service');

const mockJson = jest.fn();
const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
const makeRes = (): Response => ({
  status: mockStatus as any,
  json: mockJson as any,
} as unknown as Response);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Cart Controller - getCart', () => {
  it('devuelve mensaje cuando no hay carrito', async () => {
    (cartService.getCartByUserId as jest.Mock).mockResolvedValue(null);
    const req: any = { user: { id: 'user1' } };
    const res = makeRes();

    await getCart(req, res);

    expect(cartService.getCartByUserId).toHaveBeenCalledWith('user1');
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({ ok: true, message: "Carrito vacío o expirado", data: [] });
  });

  it('devuelve carrito cuando existe', async () => {
    const cart = { items: [{ productId: 'p1' }], total: 10 };
    (cartService.getCartByUserId as jest.Mock).mockResolvedValue(cart);
    const req: any = { user: { id: 'user1' } };
    const res = { json: jest.fn() } as unknown as Response;

    await getCart(req, res);

    expect(cartService.getCartByUserId).toHaveBeenCalledWith('user1');
    expect((res as any).json).toHaveBeenCalledWith({ ok: true, data: cart });
  });

  it('maneja excepcion y responde 500', async () => {
    (cartService.getCartByUserId as jest.Mock).mockRejectedValue(new Error('boom'));
    const req: any = { user: { id: 'user1' } };
    const res = makeRes();

    await getCart(req, res);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({ ok: false, message: "Error obteniendo el carrito" });
  });
});

describe('Cart Controller - addProductToCart', () => {
  it('401 si usuario no autenticado', async () => {
    const req: any = { user: undefined, body: {} };
    const res = makeRes();

    await addProductToCart(req, res);

    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockJson).toHaveBeenCalledWith({ ok: false, message: "Usuario no autenticado" });
  });

  it('agrega producto correctamente', async () => {
    const fakeCart = { items: [], total: 10 };
    (cartService.addToCart as jest.Mock).mockResolvedValue(fakeCart);

    const req: any = { user: { id: 'u1' }, body: { productId: 'p1', quantity: 2 } };
    const res = { json: jest.fn() } as unknown as Response;

    await addProductToCart(req, res);

    expect(cartService.addToCart).toHaveBeenCalledWith('u1', 'p1', 2);
    expect((res as any).json).toHaveBeenCalledWith({ ok: true, message: "Producto agregado al carrito", data: fakeCart });
  });

  it('error del servicio -> responde 400 con mensaje', async () => {
    (cartService.addToCart as jest.Mock).mockRejectedValue(new Error('Producto no disponible'));
    const req: any = { user: { id: 'u1' }, body: { productId: 'p1', quantity: 2 } };
    const res = makeRes();

    await addProductToCart(req, res);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({ ok: false, message: 'Producto no disponible' });
  });
});
