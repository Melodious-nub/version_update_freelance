import { AttributeItem } from "./attribute-item.model";

export interface SelectedAttributeItem {
    id?: number;
    attribute: AttributeItem;
    attributeValue: string | number;
    userConversionUom: string;
    sortOrder?: number;
    isUserInput?: boolean;
}