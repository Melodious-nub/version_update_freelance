import { AttributeItem } from "./attribute-item.model";
import { ProcessCalculatorItem } from "./process-calculator-item.model";
import { ProductItem } from "./product-item.model";

export interface ProcessItem {
    id?: number;
    description: string;
    processProducts: ProcessProductItem[];
    processConversionTypes: ProcessConversionTypeItem[];
    productOfProcess: ProductItem;
    processCalculator?: ProcessCalculatorItem;
    calculatorMeta?: number;
    processNumber: number;
    businessAccount?: number,
    isSystem?: boolean,
    isPackageEntity?: boolean
}

export interface ProcessProductItem {
    id?: number;
    product: number;
    processProductAttributeValues: ProcessAttributeValueItem[];
    productType?: number;
}

export interface ProcessConversionTypeItem {
    id?: number;
    conversionType: number;
    processConversionAttributeValues: ProcessAttributeValueItem[];
}

export interface ProcessAttributeValueItem {
    id?: number;
    attribute: AttributeItem;
    attributeValue: string | number;
    attributeValueExpression: string | number;
    userConversionUom: string;
}