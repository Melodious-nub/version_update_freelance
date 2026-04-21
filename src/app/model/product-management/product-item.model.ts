import { SelectedAttributeItem } from "./selected-attribute-Item.model";
import { ProcessItem } from "./process-item.model";
import { ProductTemplateItem } from "./product-template-item.model";

export interface ProductItem {
    id?: number;
    description: string;
    productAttributeValues: SelectedAttributeItem[];
    hsnCode?: number;
    productType?: number;
    productTemplate?: ProductTemplateItem;
    packageTemplate?: ProductTemplateItem;
    process?: ProcessItem;
    isProductOfProcess?: boolean;
    isRawMaterial?: boolean;
    isPackagingMaterial?: boolean;
    isPackageEntity?: boolean;
    isSku?: boolean;
    businessAccount?: number;
    isSystem?: boolean;
}