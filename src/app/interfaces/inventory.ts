export interface Inventory {
    productID: number,
    productName: string,
    productImage: string,
    productSummary: string,
    productDescription: string,
    price: number,
    isLive: boolean,
    availability: number,
    warranty: string,
    categoryID: number,
    dayOfWeek?: string[] // Optional property
}
