import { Request, Response } from "express";
import { IProduct } from "../../domain/models/IProduct";
import { getProduct,deleteLProduct, saveProduct, updateLProduct } from "../../domain/services/product-service";



export const getAllProduct = async (request : Request, response: Response ) => {

        try {
        const product = await getProduct();
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
        const { name, description, price, stock, categoryId, imageUrl} = request.body;
        const newProduct: IProduct= {
            name: name,
            description: description,
            price: price,
            stock: stock,
            categoryId: categoryId,
            imageUrl: imageUrl,
            createdAt: new Date()
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

export const updateProduct= async (request: Request, response: Response) => {

    try {

        const productId = request.params.id;
        const { name, description, price, stock, categoryId, imageUrl } = request.body;
        const updateProduct: IProduct= {
            name: name,
            description: description,
            price: price,
            stock: stock,
            categoryId: categoryId,
            imageUrl: imageUrl,
            createdAt: new Date()
        }

        const product = await updateLProduct(productId, updateProduct);
        if (!product) {
            return response.status(404).json({
                ok: false,
                message: `producto con ID ${productId} no encontrado.`
            });
        }
        response.json({
            ok: true,
            data: product
        })
    } catch (error) {
        response.status(500).json({
            ok: false,
            message: "Error al actualizar el producto",
            error: error.message || error
        });
    }

};

export const deleteProduct = async (request: Request, response: Response) => {

    try {
        const productId = request.params.id;

        if(!productId) {
            return response.status(400).json({
                ok:false,
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