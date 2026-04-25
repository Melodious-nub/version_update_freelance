import { ProcessProductAttributeValues } from "./processes.model";
import { ProdTemplate } from "./product-template.model";

export interface ProductListResponse {
    count: number;
    next: string;
    previous: string;
    content: Products[]
}

export interface Products {
    businessAccount?: string;
    description: string;
    id?: number;
    isRawMaterial?: boolean;
    isPackagingMaterial: boolean;
    isProductOfProcess: boolean;
    isSku: boolean;
    isSystem: boolean;
    productAttributeValues: ProcessProductAttributeValues[];
    productTemplate?: any;
    productCalculator?: any;
    process?: any;
    productCode?: any;
    packageTemplate?: ProdTemplate;
    isPackageEntity?: boolean;
}