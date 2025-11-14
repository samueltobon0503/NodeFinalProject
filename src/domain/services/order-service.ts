import { notifyUser } from "../../app";
import { sendEmail } from "../../infraestructure/emails/email.service";
import { OrderStatus } from "../config/dictionary.enum";
import { Address } from "../interfaces/Adress";
import { Cart } from "../interfaces/Cart";
import { Order } from "../interfaces/Order";
import { Product } from "../interfaces/Product";
import { User } from "../interfaces/User";
import { IOrder } from "../models/IOrder";
import crypto from "crypto";

export const getOrder = async () => {
    try {
        return await Order.find().populate("shippingAddressId");
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error obteniendo las ordenes");
    }
}

export const createOrderFromCheckout = async (userId: string, addressId: string) => {
    const cart = await Cart.findOne({ userId });
    const user = await User.findById(userId);
    const adress = await Address.findById(addressId)

    if (!cart) throw new Error("No se encontró el carrito del usuario.");
    if (!user) throw new Error("Usuario no encontrado.");
    if (!adress) throw new Error("Dirección no encontrada.");
    if (cart.items.length === 0) throw new Error("El carrito está vacío.");

    for (const item of cart.items) {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`El producto ${item.name} no existe.`);
        if (product.stock < item.quantity) {
            throw new Error(`Stock insuficiente para el producto ${item.name}.`);
        }
    }

    const orderNumber = generateOrderNumber();
    const totalAmount = cart.items.reduce((sum, i) => sum + i.subtotal, 0);

    const newOrder = new Order({
        userId,
        orderNumber,
        items: cart.items,
        shippingAddressId: addressId,
        totalAmount,
        status: OrderStatus.PENDIENTE,
        createdAt: new Date(),
    });

    await newOrder.save();

    for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
        });
    }

    await Cart.findByIdAndDelete(cart._id);

    const subject = `Confirmación de tu pedido ${newOrder.orderNumber}`;
    const html = `
        <h2>Gracias por tu compra, ${user.name}!</h2>
        <p>Tu pedido <b>${newOrder.orderNumber}</b> ha sido creado exitosamente.</p>
        <p>Estado actual: <b>${newOrder.orderStatusId}</b></p>
        <p>Total: <b>$${newOrder.totalAmount.toLocaleString('es-CO')}</b></p>
        <p>Te notificaremos cuando tu pedido esté en camino 🚚</p>
    `;

    await sendEmail(user.email, subject, html);
    return newOrder;
};

export const generateOrderNumber = (): string => {
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    // Note: Assuming 'crypto' is imported or available globally
    const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase(); 
    return `ORD-${dateStr}-${randomStr}`;
};

export const getOrderStatus = async (userId: string, orderId: string) => {

  const order = await Order.findById(orderId).lean();
  if (!order) {
    const err: any = new Error("Orden no encontrada");
    err.status = 404;
    throw err;
  }

  if (order.userId.toString() !== userId.toString()) {
    const err: any = new Error("Acceso denegado: no eres el propietario de la orden");
    err.status = 403;
    throw err;
  }

  return {
   order
  };
};

export const getOrdersByUser = async (userId: string) => {
  const orders = await Order.find({ userId }).lean();

  if (!orders || orders.length === 0) {
    const err: any = new Error("No se encontraron órdenes para este usuario");
    err.status = 404;
    throw err;
  }

  return { orders };
};

export const updateOrderStatus = async (orderId: string, newStatusRaw: string) => {
  const ORDER_STATES = Object.values(OrderStatus) as OrderStatus[];
  const newStatus = newStatusRaw as OrderStatus;
  const newIndex = ORDER_STATES.indexOf(newStatus);

  if (newIndex === -1) {
    const err: any = new Error("Estado nuevo inválido");
    err.status = 400;
    throw err;
  }

  const order = await Order.findById(orderId);
  if (!order) {
    const err: any = new Error("Orden no encontrada");
    err.status = 404;
    throw err;
  }

  if (order.orderStatusId === OrderStatus.CANCELADO) {
    const err: any = new Error("No se puede cambiar el estado de una orden cancelada");
    err.status = 400;
    throw err;
  }

  const currentIndex = ORDER_STATES.indexOf(order.orderStatusId as OrderStatus);

  if (order.orderStatusId === newStatus) {
    return order;
  }

  if (newStatus !== OrderStatus.CANCELADO && newIndex < currentIndex) {
    const err: any = new Error(`No se permite retroceder en estados (actual: ${order.orderStatusId})`);
    err.status = 400;
    throw err;
  }

  const prevStatus = order.orderStatusId;
  order.orderStatusId = newStatus;

  if (newStatus === OrderStatus.CANCELADO) {
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
  }

  await order.save();

    notifyUser(order.userId.toString(), {
      orderId: order.orderNumber,
      newStatus: order.orderStatusId,
      message: `Tu orden ${order.orderNumber} ahora está en estado "${order.orderStatusId}".`
    });

  try {
    const user = await User.findById(order.userId);
    if (user && user.email) {
      const subject = `Actualización de estado de tu pedido ${order.orderNumber}`;
      const html = `
        <h2>Actualización del pedido ${order.orderNumber}</h2>
        <p>Hola ${user.name} ${user.lastName},</p>
        <p>El estado de tu pedido cambió: <b>${prevStatus}</b> -> <b>${newStatus}</b>.</p>
        <p>Si tienes dudas, por favor contactate a aliesstres@notevamosaayudar.com.</p>
      `;
      await sendEmail(user.email, subject, html);
    }
  } catch (mailError) {
    console.error("Error enviando notificación de cambio de estado:", mailError);
  }

  return order;
};

export const inactiveLOrder = async (orderId: string) => {
    try {
        const inactiveOrder = await Order.findByIdAndUpdate(
            orderId,
            { active: false },
            { new: true }
        );
        return inactiveOrder;
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error inactivando la orden");
    }
}