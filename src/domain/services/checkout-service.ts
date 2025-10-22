import { Address } from "../interfaces/Adress";
import { Cart } from "../interfaces/Cart";
import { Product } from "../interfaces/Product";

export const confirmCartBeforeCheckout = async (userId: string) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error("Carrito no encontrado");

    const updatedItems = [];

    for (const item of cart.items) {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`El producto ${item.name} no existe`);
        if (product.stock < item.quantity)
            throw new Error(`Stock insuficiente para ${product.name}`);

        const currentPrice = product.price;
        const subtotal = Number(currentPrice) * item.quantity;

        updatedItems.push({
            productId: product._id,
            name: product.name,
            quantity: item.quantity,
            unitPrice: currentPrice,
            subtotal
        });
    }

    const total = updatedItems.reduce((sum, i) => sum + i.subtotal, 0);

    return { items: updatedItems, total };
};

export const validateShippingInfo = async (
    userId: string,
    addressId: string,
    shippingMethod: string
) => {
    const address = await Address.findOne({ _id: addressId });
    if (!address) {
        throw new Error("Dirección de envío no encontrada");
    }

    if (!address.street || !address.city || !address.postalCode || !address.country) {
        throw new Error("La dirección de envío está incompleta");
    }

    const validMethods = ["standard", "express"];
    if (!validMethods.includes(shippingMethod)) {
        throw new Error("Método de envío no válido");
    }

    return {
        address,
        shippingMethod,
    };
};