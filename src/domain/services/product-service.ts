import { Product } from "../interfaces/Product";
import { IProduct } from "../models/IProduct";


export const getProduct = async () => {
    try {
        return await Product.find();
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error obteniendo los productos");
    }
}

export const saveProduct = async (product: IProduct) => {
    try {
        const newProduct = new Product(product);
        await newProduct.save();
        return newProduct;
    } catch (error) {
        console.error("Error al guardar el sale en MongoDB:", error);
        throw new Error(error.message || "Fallo la creación de un producto");
    }
}

export const updateLProduct = async (productId: string, updateData: IProduct) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
            { new: true }
        );
        return updatedProduct;
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error actualizando el producto");
    }
}

export const deleteLProduct = async (productId: string) => {
    try {
        const deleteProduct = await Product.deleteOne({_id :productId});

        if(deleteProduct.deletedCount === 0){
            throw new Error(`No se encontro ningun envio con el id ${productId} para eliminar el producto`); 
        }
        return {message: "Producto fue eliminado correctamente", deleteLProduct};
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error eliminando el producto");
    }
}