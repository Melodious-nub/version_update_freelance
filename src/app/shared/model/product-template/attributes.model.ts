export interface AttributesResponse {
    count: number;
    next: string;
    previous: string;
    results: AttributesResult[];
}

export interface AttributesResult {
    id: number;
    description: string;
    systemUom: SystemUom;
    availableUoms: SystemUom[];
}

export interface SystemUom {
    id: number;
    description: string;
}