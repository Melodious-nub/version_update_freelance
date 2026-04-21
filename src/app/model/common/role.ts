export interface RoleResponse {
    count: number;
    next: string;
    previous: string;
    results: Role[];
}

export interface Role {
    id?: number;
    name;
    description: string;
}
