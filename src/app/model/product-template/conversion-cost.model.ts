export interface ConversionTypeResponse {
    count: number;
    next: string;
    previous: string;
    results: ConversionType[];
}

export interface ConversionType {
    id: number;
    description: string;
    amount: number;
    configurable: boolean;
}