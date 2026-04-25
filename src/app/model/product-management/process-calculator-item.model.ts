import { AttributeItem } from "./attribute-item.model"

export interface ProcessCalculatorItem {
    id?: number;
    description: string;
    processCalculatorAttributeValues: ProcessCalculatorAttributeValueItem[];
    processCalculatorProduct: ProcessCalculatorProductItem[];
    processCalculatorConversionType: ProcessCalculatorConversionTypeItem[];
}

export interface ProcessCalculatorAttributeValueItem {
    id?: number,
    attribute: AttributeItem,
    attributeValue: string | number,
    attributeValueExpression: string | number,
    userConversionUom: string,
    sortOrder: number
}

export interface ProcessCalculatorProductItem {
    id?: number;
    product: number;
    processCalculatorProductAttributeValues: ProcessCalculatorAttributeValueItem[];
}

export interface ProcessCalculatorConversionTypeItem {
    id?: number;
    conversionType: number;
    processCalculatorConversionAttributeValues: ProcessCalculatorAttributeValueItem[];
}