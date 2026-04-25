export interface HSNCodeResponse {
    count: number;
    next: string;
    previous: string;
    results: HSNCode[];
}

export interface HSNCode {
    id: number;
    description: string;
    code: string;
}