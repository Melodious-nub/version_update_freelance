export interface AttributeGroupResponse {
    count: number;
    next: string;
    previous: string;
    results: AttributeGroupResult[];
}

export interface AttributeGroupResult {
    id: number;
    description: string;
    attributesGroupAttributes: AttributeGroupAttributes[];
}

export interface AttributeGroupAttributes {
    attribute: Attribute;
    required: boolean;
}

export interface Attribute {
    id: number;
    description: string;
    systemUom: SystemUom;
}

export interface SystemUom {
    id: number;
    description: string;
}