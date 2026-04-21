export interface ProductTypeItem {
    id?: number;
    description: string;
    exportDescription: string;
    productSubtypes: ProductSubTypeItem[]
}

export interface ProductSubTypeItem {
    id?: number;
    description: string;
    exportDescription: string;
}