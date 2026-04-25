export interface CalculatorMetaItem {
    id: number;
    description: string;
    calculatorEntities: CalculatorEntityItem[];
}

export interface CalculatorEntityItem {
    id: number;
    entityType: string;
    calculatorAttributeValues: CalculatorAttributeValueItem[];
}

export interface CalculatorAttributeValueItem {
    id: number;
    attribute: number;
    attributeValueExpression: string;
    sortOrder: number;
}