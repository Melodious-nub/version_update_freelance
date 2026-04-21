export interface AttributeResponse {
    count: number;
    next: string;
    previous: string;
    content: Attribute[]
}

export interface Attribute {
    availableValues?: AttributeAvailableValue[];
    availableUoms?: SelectedAttribute[];
    description: string;
    id?: number;
    systemUom: SelectedAttribute;
    isSystemOnly?: boolean;
}

export interface SelectedAttribute {
    id?: number;
    description: string
}

export interface AttributeAvailableValue {
    id?: number;
    description: string;
}
