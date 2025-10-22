import { Request, Response } from "express";
import { AuthRequest } from "../../infraestructure/auth/jwt-service";
import { addToCart, getCartByUserId, removeFromCart, updateCartItemQuantity } from "../../domain/services/cart-service";

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const cart = await getCartByUserId(userId);
    if (!cart) {
      return res.status(200).json({ ok: true, message: "Carrito vacío o expirado", data: [] });
    }

    res.json({ ok: true, data: cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Error obteniendo el carrito" });
  }
};

export const addProductToCart = async (req: AuthRequest, res: Response) => {
  try {
        const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Usuario no autenticado" });
    }
    const { productId, quantity } = req.body;

    const cart = await addToCart(userId, productId, quantity);
    res.json({ ok: true, message: "Producto agregado al carrito", data: cart });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ ok: false, message: error.message || "Error al agregar producto al carrito" });
  }
};

export const updateCartQuantity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    const cart = await updateCartItemQuantity(userId, productId, quantity);
    res.json({ ok: true, message: "Cantidad actualizada", data: cart });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ ok: false, message: error.message || "Error al actualizar la cantidad" });
  }
};

export const removeProductFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ ok: false, message: "Usuario no autenticado" });

    const productId = req.params.productId;
    if (!productId) return res.status(400).json({ ok: false, message: "productId es requerido" });

    const cart = await removeFromCart(userId, productId);
    res.json({ ok: true, message: "Producto eliminado del carrito", data: cart });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ ok: false, message: error.message || "Error al eliminar el producto del carrito" });
  }
};