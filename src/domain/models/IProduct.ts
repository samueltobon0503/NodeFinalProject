export interface IProduct {
    name: string,
    description: string,
    price: string,
    stock: number,
    categoryId: string,
    imageUrl: string,
    createdAt: Date
    active: boolean
}