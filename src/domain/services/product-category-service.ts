import { Product } from "../interfaces/Product";
import { ProductCategory } from "../interfaces/ProductCategory";
import { IProductCategory } from "../models/IProductCategory";

export const getProductCategories = async () => {
    try {
        return await ProductCategory.find();
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error obteniendo las categorias de los productos");
    }
}

export const saveProductCategory = async (product: IProductCategory) => {
    try {
        const newProduct = new ProductCategory(product);
        await newProduct.save();
        return newProduct;
    } catch (error) {
        console.error("Error al guardar la categoria:", error);
        throw new Error(error.message || "Fallo la creación de una categoria de producto");
    }
}

export const inactiveLCategory = async (categoryId: string) => {
    try {
        const inactiveCategory = await ProductCategory.findByIdAndUpdate(
            categoryId,
            { active: false},
            { new: true }
        );
        return inactiveCategory;
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error inactivando el usuario");
    }
}
