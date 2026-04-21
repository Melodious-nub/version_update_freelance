import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { productType } from 'src/app/shared/constant';

@Injectable({
  providedIn: 'root',
})
export class CategoryManagementService {
  constructor(public httpService: HttpService) {}

  saveProductCategory(data: any) {
    return this.httpService.post(productType.saveProductCategory, data).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  getAllproductcategories(pageIndex = 0, pageS = 50, sortQuery = null) {
    return this.httpService
      .get(
        productType.productCategory +
          `?noncache=true&page=${pageIndex}&size=${pageS}&sort=${sortQuery}`
      )
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  getCategoryDetailById(id: any) {
    const url: any = productType.saveProductCategory + id + '?noncache=true';
    return this.httpService.get(url).pipe(
      map((res) => {
        return res as any;
      })
    );
  }
}
