import { Role } from "./role";

export interface UserAccountResponse {
    count: number;
    next: string;
    previous: string;
    results: UserAccount[];
}

export interface UserAccount {
    username?: string;
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    userRole: UserRole[];
    employeeRole: string;
    inviteId: number;
    roleId: string;
    roleName: string;
    branchId: string;
    branchName: string;
    externalRefId: string;
    isEdit: boolean;
    employeeId:boolean;
}

export interface UserRole {
    id?: number,
    businessAccount?: UserRoleBusinessAccount,
    roleInBusiness?: RoleInBusiness[]
}

export interface UserRoleBusinessAccount {
    id?: number,
    name: string
}

export interface RoleInBusiness {
    role: Role
}

export class UserInfo {
    businessAccountRole: BusinessRole;
    displayName;
    email;
    userId;
    userName;
    inviteId;
    employeeId;
}

export class BusinessRole {
    accountId;
    accountName;
    userRoles: string[];
}
