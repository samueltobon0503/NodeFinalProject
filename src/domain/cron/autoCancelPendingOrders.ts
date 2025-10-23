import { sendEmail } from "../../infraestructure/emails/email.service";
import { OrderStatus } from "../config/dictionary.enum";
import { Order } from "../interfaces/Order";
import { Product } from "../interfaces/Product";
import { User } from "../interfaces/User";


export const autoCancelPendingOrders = async () => {
  const now = new Date();
  const hours48Ago = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const oldOrders = await Order.find({
    orderStatusId: { $in: [OrderStatus.PENDIENTE, OrderStatus.PREPARANDO] },
    createdAt: { $lte: hours48Ago }
  });

  for (const order of oldOrders) {
    order.orderStatusId = OrderStatus.CANCELADO;

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }

    await order.save();

    try {
      const user = await User.findById(order.userId);
      if (user && user.email) {
        const subject = `Pedido ${order.orderNumber} cancelado`;
        const html = `
          <h2>Pedido ${order.orderNumber} cancelado</h2>
          <p>Hola ${user.name} ${user.lastName},</p>
          <p>Tu pedido fue cancelado automáticamente porque pasaron más de 48 horas sin ser procesado.</p>
          <p>Si esto fue un error, contáctanos a <b>alietres@notevamosaayudar.com</b>.</p>
        `;
        await sendEmail(user.email, subject, html);
      }
    } catch (mailError) {
      console.error("Error enviando notificación automática:", mailError);
    }

    console.log(`Orden ${order.orderNumber} cancelada automáticamente.`);
  }
};
