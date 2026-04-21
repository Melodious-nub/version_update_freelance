export interface ConversionCostResponse {
    results: ConversionCost[];
}

export interface ConversionCost {
    id: number;
    description: string;
    amount: number;
    configurable: boolean;
}