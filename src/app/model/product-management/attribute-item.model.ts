export interface AttributeItem {
    id: number;
    description: string;
    systemUom: UomItem;
    availableUoms?: UomItem[];
    availableValues?: AvailableValueItem[];
    isSystemOnly?: boolean;
}

export interface UomItem {
    id: number;
    description: string;
}

export interface AvailableValueItem {
    value: string | number;
    name: string;
}