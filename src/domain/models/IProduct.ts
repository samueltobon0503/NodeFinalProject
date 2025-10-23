export interface IProduct {
    name: string,
    description: string,
    price: string,
    stock: number,
    sku: string,
    categoryId: string,
    imageUrl: string,
    createdAt: Date
    active: boolean
}