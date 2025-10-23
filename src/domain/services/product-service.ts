import { Product } from "../interfaces/Product";
import { IProduct } from "../models/IProduct";
import { formatPrice } from "../utils/service.utils";


export const getProduct = async (filters: any = {}) => {
    try {
        const query: any = { active: true, stock: { $gt: 0 } };

        if (filters.name) {
            query.name = { $regex: filters.name, $options: "i" };
        }

        if (filters.categoryId) {
            query.categoryId = filters.categoryId;
        }

        if (filters.minPrice || filters.maxPrice) {
            query.price = {};
            if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
            if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
        }

        const products = await Product.find(query);
        return products;

    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error obteniendo los productos");
    }
}

export const getProductAdmin = async () => {
    try {
        return await Product.find();
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error obteniendo los productos");
    }
}

export const saveProduct = async (product: IProduct) => {
    try {
        const { price, stock, sku, imageUrl } = product;
        const formattedPrice = formatPrice(price);

        if (!Number.isInteger(stock) || stock <= 0 || stock > 9999) {
            throw new Error("El stock debe ser un número entero entre 1 y 9999.");
        }

        if (!sku || !/^[A-Za-z0-9]{8,20}$/.test(sku)) {
            throw new Error("El SKU debe ser alfanumérico y tener entre 8 y 20 caracteres.");
        }

        const existingSKU = await Product.findOne({ sku });
        if (existingSKU) {
            throw new Error("El SKU ya está registrado en otro producto.");
        }

        if (!imageUrl || !/\.(jpg|jpeg|png)$/i.test(imageUrl)) {
            throw new Error("La imagen debe tener formato JPG o PNG.");
        }

        product.price = formattedPrice;
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
        const deleteProduct = await Product.deleteOne({ _id: productId });

        if (deleteProduct.deletedCount === 0) {
            throw new Error(`No se encontro ningun envio con el id ${productId} para eliminar el producto`);
        }
        return { message: "Producto fue eliminado correctamente", deleteLProduct };
    } catch (error) {
        console.error(error);
        throw new Error("Hubo un error eliminando el producto");
    }
}