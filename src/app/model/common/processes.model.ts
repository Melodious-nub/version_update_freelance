import { Products } from "./product-list.model";
import { SelectedAttribute } from "./attribute.model";

export interface ProcessResponse {
    count: number;
    next: string;
    previous: string;
    results: Process[];
}

export interface Process {
    businessAccount: string;
    calculatorMeta?: string;
    description: string;
    id?: number;
    isSystem: boolean;
    processCalculator?: ProcessCalculator;
    processConversionTypes: ProcessConversionTypes[];
    processNumber?: number;
    processProducts: ProcessProducts[];
    productOfProcess?: Products;
    isPackageEntity: boolean;
}

export interface ProcessCalculator {
    description: string;
    id: number;
    processCalculatorAttributeValues: ProcessProductAttributeValues[];
    processCalculatorConversionType: ProcessConversionTypes[];
    processCalculatorProduct: ProcessCalculatorProduct[];
}

export interface ProcessConversionTypes {
    conversionType: number;
    id?: number;
    processCalculatorConversionAttributeValues: ProcessCalculatorConversionAttributeValues[]
}

export interface ProcessConversionType {
    conversionType: number;
    id?: number;
    processConversionAttributeValues: ProcessCalculatorConversionAttributeValues[]
}

export interface ProcessProducts {
    id?: number;
    processProductAttributeValues: ProcessProductAttributeValues[]
    product: number;
}

export interface ProcessProductAttributeValues {
    attribute: Attribute;
    attributeValue: string;
    attributeValueExpression?: string;
    id?: number
    userConversionUom: string;
    sortOrder?: number;
}

export interface Attribute {
    id: number;
    description: string;
    systemUom: SelectedAttribute
}

export interface ProcessCalculatorConversionAttributeValues {
    attribute: Attribute;
    attributeValue: string;
    attributeValueExpression: string;
    id?: number;
    userConversionUom: string;
    sortOrder?: number;
}

export interface ProcessCalculatorProduct {
    id?: number;
    processCalculatorProductAttributeValues: ProcessCalculatorConversionAttributeValues[];
    product: number;
}