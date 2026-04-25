import { AttributeItem } from "./attribute-item.model"

export interface AttributeGroupItem {
    id: number;
    description: string;
    attributesGroupAttributes: AttributesGroupAttributeItem[];
    isSystemOnly: boolean;
  }

export interface AttributesGroupAttributeItem {
    attribute: AttributeItem;
    required: boolean;
    sortOrder: number;
  }