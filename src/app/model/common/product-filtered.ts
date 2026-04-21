export interface ProductFilteredResponse {
    count: number;
    next: string;
    previous: string;
    results: ProductFiltered[];
}

export interface ProductFiltered {
    [key: string]: any
}
