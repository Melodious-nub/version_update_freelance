export interface AttributeListResponse {
    count: number;
    next: string;
    previous: string;
    results: AttributeListResult[];
}

export interface AttributeListResult {
    id: number;
    description: string;
    systemUom: SystemUom;
    availableUoms: SystemUom[];
}

export interface SystemUom {
    id: number;
    description: string;
}