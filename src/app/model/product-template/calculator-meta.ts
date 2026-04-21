export interface CalculatorMetaResponse {
    count: number;
    next: string;
    previous: string;
    results: CalculatorMeta[];
}

export interface CalculatorMeta {
    id: number;
    description: string;
    calculatorEntities: CalculatorEntities[];
}

export interface CalculatorEntities {
    id: number;
    entityType: string;
    calculatorAttributeValues?: CalculatorAttributeValues[];
}

export interface CalculatorAttributeValues {
    id: number;
    attribute: number;
    attributeValueExpression: string;
    sortOrder?: number;
}
