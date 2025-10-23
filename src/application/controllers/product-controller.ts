import { Request, Response } from "express";
import { IProduct } from "../../domain/models/IProduct";
import { getProduct, deleteLProduct, saveProduct, updateLProduct, getProductAdmin } from "../../domain/services/product-service";
import { formatPrice } from "../../domain/utils/service.utils";
import { Product } from "../../domain/interfaces/Product";



export const getAllProduct = async (request: Request, response: Response) => {

    try {
        const products = await getProduct(request.query);
        response.json({
            ok: true,
            data: products
        })
    } catch (error) {
        console.error(error);
        throw new Error("No se pudo obtener el producto");
    }
}

export const getAllProductAdmin = async (request: Request, response: Response) => {

    try {
        const product = await getProductAdmin();
        response.json({
            ok: true,
            data: product
        })
    } catch (error) {
        console.error(error);
        throw new Error("No se pudo obtener el producto");
    }
}

export const createProduct = async (request: Request, response: Response) => {
    try {
        const { name, description, price, stock, categoryId, imageUrl, sku } = request.body;

        const newProduct: IProduct = {
            name: name,
            description: description,
            price: price,
            stock: stock,
            categoryId: categoryId,
            sku: sku,
            imageUrl: imageUrl,
            createdAt: new Date(),
            active: true
        }
        const result = await saveProduct(newProduct);
        response.json({
            ok: true,
            staus: 'created',
            data: result
        })
    } catch (error) {
        console.error(error);
        response.status(500).json({
            ok: false,
            message: "Error al crear el producto",
            error: error.message || error
        });
    }

};

export const deleteProduct = async (request: Request, response: Response) => {

    try {
        const productId = request.params.id;

        if (!productId) {
            return response.status(400).json({
                ok: false,
                message: "El id no es valido"
            });
        }

        const product = await deleteLProduct(productId);
        return response.json({
            ok: true,
            data: product
        })
    } catch (error) {
        response.status(404).json({
            ok: false,
            message: "El producto no se encontro para ser eliminado",
            error: error.message || error
        });
    }

};
