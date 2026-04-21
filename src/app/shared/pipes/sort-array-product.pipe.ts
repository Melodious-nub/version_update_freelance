import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'SortProductPipe'
})
export class SortProductPipe implements PipeTransform {
  private priorityProducts: any[] = [
    { productCode: 'JTB-14BN15-SMPL', priority: 1 },
    { productCode: 'CTB-15WT15', priority: 2 },
    { productCode: 'PBW-11BB6', priority: 3 },
    { productCode: 'T-6W5915', priority: 4 },
    { productCode: 'RB-19M605', priority: 5 },
    {productCode:'NWS-17M1442', priority: 6}
  ];

  transform(products: any[]): any[] {
    if (!Array.isArray(products)) {
      return products;
    }

    return products.sort((a, b) => {
      const priorityA = this.priorityProducts.find(p => p.productCode === a.productDetails?.productCode)?.priority;
      const priorityB = this.priorityProducts.find(p => p.productCode === b.productDetails?.productCode)?.priority;

      if (priorityA && priorityB) {
        if (priorityA === priorityB) {
          // If priorities are equal, sort by productTypeId
          return a.productDetails.productTypeId - b.productDetails.productTypeId;
        } else {
          return priorityA - priorityB;
        }
      } else if (priorityA) {
        return -1;
      } else if (priorityB) {
        return 1;
      } else {
        // If neither product has a priority, sort by productTypeId
        return a.productDetails?.productTypeId - b.productDetails?.productTypeId;
      }
    });
  }
}