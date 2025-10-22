import { Cart } from "../interfaces/Cart";
import { Product } from "../interfaces/Product";

const EXPIRATION_TIME = 24 * 60 * 60 * 1000;

export const getCartByUserId = async (userId: string) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) return null;

    const inactiveTime = Date.now() - cart.updatedAt.getTime();
    if (inactiveTime > EXPIRATION_TIME) {
        await Cart.findByIdAndDelete(cart._id);
        return null;
    }

    return cart;
};
export const addToCart = async (userId: string, productId: string, quantity: number) => {
    const product = await Product.findById(productId);
    if (!product || !product.active) {
        throw new Error("Producto no disponible");
    }

    if (quantity > product.stock) {
        throw new Error("Cantidad solicitada supera el stock disponible");
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
        cart = new Cart({
            userId,
            items: [],
            total: 0,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
    }

    const existingItem = cart.items.find(i => i.productId === productId);
    const price = Number(product.price);
    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
            throw new Error("Cantidad supera el stock disponible");
        }
        existingItem.quantity = newQuantity;
        existingItem.subtotal = existingItem.unitPrice * existingItem.quantity;
    } else {

        cart.items.push({
            productId,
            name: product.name,
            quantity,
            unitPrice: parseFloat(price.toFixed(2)),
            subtotal: parseFloat((price * quantity).toFixed(2)),
            priceLockedUntil: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
        });

    }

    cart.total = cart.items.reduce((acc, item) => acc + item.subtotal, 0);
    cart.updatedAt = new Date();
    cart.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await cart.save();
    return cart;
};

export const updateCartItemQuantity = async (
    userId: string,
    productId: string,
    newQuantity: number
) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Carrito no encontrado");

    const item = cart.items.find((i) => i.productId.toString() === productId);
    if (!item) throw new Error("Producto no encontrado en el carrito");

    const product = await Product.findById(productId);
    if (!product) throw new Error("Producto no encontrado en la base de datos");

    if (product.stock < newQuantity) {
        throw new Error(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles`);
    }

    item.quantity = newQuantity;
    item.subtotal = parseFloat((Number(product.price) * newQuantity).toFixed(2));
    cart.updatedAt = new Date();

    await cart.save();
    return cart;
};


export const removeFromCart = async (userId: string, productId: string) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Carrito no encontrado");

    const before = cart.items.length;

    cart.items = cart.items.filter(i => {
        const pid = (i.productId as any).toString ? (i.productId as any).toString() : i.productId;
        return pid !== productId;
    });

    if (cart.items.length === before) {
        throw new Error("Producto no encontrado en el carrito");
    }

    cart.total = cart.items.reduce((acc, item) => acc + item.subtotal, 0);
    cart.updatedAt = new Date();

    await cart.save();
    return cart;
};