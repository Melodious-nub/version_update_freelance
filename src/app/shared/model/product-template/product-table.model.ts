export interface ProductTableResponse {
    count: number;
    next: string;
    previous: string;
    results: ProductTableResult[];
}

export interface ProductTableResult {
    id: number;
    description: string;
    businessAccount: number;
    productTemplate: string;
    process: string;
    productAttributeValues: ProductTableData[];
}

export interface ProductTableData {
    id: number;
    productName: string;
    density: number;
    usd: number;
    avgDensity: number;
    used: number;
    waste: number;
    costAddOn: number;
    attribute: Attribute;
    attributeValue: string;
    userConversionUom: string;
}

export interface Attribute {
    id: number;
    description: string;
    systemUom: SystemUom;
}

export interface SystemUom {
    id: number;
    description: string;
}