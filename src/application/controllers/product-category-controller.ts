import { IProductCategory } from "../../domain/models/IProductCategory";
import { getProductCategories, saveProductCategory } from "../../domain/services/product-category-service";
import { Request, Response } from "express";

export const getAllProductCategories = async (request: Request, response: Response) => {

    try {
        const categories = await getProductCategories();
        response.json({
            ok: true,
            data: categories
        });

    } catch (error) {
        console.error(error);
        throw new Error("No se pudo obtener el producto");
    }
}

export const createProductCategory = async (request: Request, response: Response) => {
    try {
        const { name } = request.body;

        const newProduct: IProductCategory = {
            name: name
        }
        const result = await saveProductCategory(newProduct);
        response.json({
            ok: true,
            staus: 'created',
            data: result
        })
    } catch (error) {
        console.error(error);
        response.status(500).json({
            ok: false,
            message: "Error al crear la categoria",
            error: error.message || error
        });
    }

};