export interface AttributeGroupResponse {
    count: number;
    next: string;
    previous: string;
    results: AttributeGroup[];
}

export interface AttributeGroup {
    id: number;
    description: string;
    attributesGroupAttributes: AttributeGroupAttributes[];
    isSystemOnly?: boolean;
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