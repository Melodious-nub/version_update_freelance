import { SelectedAttribute } from "./attribute.model";
import { Process } from "./processes.model";

export interface ProdTemplateResponse {
    count: number;
    next: string;
    previous: string;
    results: ProdTemplate[]
}

export interface ProdTemplate {
    skuCost: string;
    skuMetricCost: AttributeDetail;
    businessAccount: string;
    description: string;
    id: number;
    isSystem: boolean;
    productTemplateAttributes: ProductTemplateAttribute[];
    processes?: Process[];
    isPackageEntity?: boolean;
    isReadOnly?: boolean;
}
export class AttributeDetail {
    attributeValue;
    userConversionUom;
}
export interface ProductTemplateAttribute {
    id: number;
    attribute: TemplateAttribute;
}

interface TemplateAttribute {
    id: number;
    description: string;
    systemUom: SelectedAttribute
}
