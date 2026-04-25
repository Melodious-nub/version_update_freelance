import { AttributeItem } from "./attribute-item.model";
import { ProcessItem } from "./process-item.model";

export interface ProductTemplateItem {
    id?: number;
    description: string;
    templateCode: string;
    inDraftMode: boolean;
    longDescription?: string;
    isPackageEntity?: boolean;
    productTemplateAttributes: ProductTemplateAttributeItem[];
    attributeGroup?: number;
    processes?: ProcessItem[];
}

export interface ProductTemplateAttributeItem {
    id?: number;
    attribute: AttributeItem;
    sortOrder: number;
}