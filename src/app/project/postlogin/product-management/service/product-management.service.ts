import { Injectable } from '@angular/core';

import { catchError, map, Observable, retryWhen, throwError } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { apiModules, productTemplate, productType } from 'src/app/shared/constant';
import { environment } from 'src/environments/environment';


@Injectable({
    providedIn: 'root'
})
export class ProductManagementService {

    url = environment.apiUrl;
    products: any[] = [];
    productSubTypes:any[]=[]
    additionalCostValues:any[]=[]
    constructor(private httpService: HttpService) { }

  getProcutDetailsList(
    pageNumber: any,
    pageS: any,
    sort: any) {
    return this.httpService.get<any>(`${productType.getProductTypeList + `?page=${pageNumber}&size=${pageS}&sort=${sort}`}`).pipe(
      map(data => data.content),
      catchError(err => {
        return throwError(() => new Error(err));
      }));
  }

    getProductTypeBySearch(
        pageNumber: any,
        pageS: any,
        sort: any,
        searchString: String = "") {
        let apiUrl = `${productType.getProductTypeList + `?page=${pageNumber}&size=${pageS}&sort=${sort}`}`;
        if (searchString != '') {
            apiUrl += `&searchString=${searchString}`;
        }
        return this.httpService.get<any>(apiUrl).pipe(
            map(data => data),
            catchError(err => {
                return throwError(() => new Error(err));
            }));
    }

    getProductSubTypeBySearch(
        pageNumber: any,
        pageS: any,
        sort: any,
        productTypeId:any,
        searchString: String = "") {
        let apiUrl = `${productType.getProductSubTypeList + `?page=${pageNumber}&size=${pageS}&sort=${sort}`}`;
        if (searchString != '') {
            apiUrl += `&searchString=${searchString}`;
        }
        if(productTypeId) {
            apiUrl += `&filter=productTypeId:${productTypeId}`;
        }
        return this.httpService.get<any>(apiUrl).pipe(
            map(data => data),
            catchError(err => {
                return throwError(() => new Error(err));
            }));
    }

    getProcutDetails() {
        return this.httpService.get<any>(`${productTemplate.getProductType}`).pipe(
            map(data => data),
            catchError(err => {
                return throwError(() => new Error(err));
            }));
    }

    getProductType() {
        return this.httpService.get<any>(`${productType.getAllProductType}`).pipe(
            map(data => data),
            catchError(err => {
                return throwError(() => new Error(err));
            })
        )
    }

    getUserConversionUom() {
        return this.httpService.get<any>(`${productTemplate.getAllAttributesTypes}`).pipe(
            map(data => data),
            catchError(err => {
                return throwError(() => new Error(err));
            })
        )
    }

    getHsnIND(): Observable<any> {
      return this.httpService.get<any>(`${productTemplate.getAllHsnIndia}`).pipe(
        map(data => data),
        catchError(err => {
            return throwError(() => new Error(err));
        }));
    }

    getHsnUSA(): Observable<any> {
      return this.httpService.get<any>(`${productTemplate.getAllHsnUsa}`).pipe(
        map(data => data),
        catchError(err => {
            return throwError(() => new Error(err));
        }));
    }

    getCustomerCategory(searchText?: string): Observable<any> {
      return this.httpService.get<any>(`${productType.productCategory}`, {searchString : searchText}).pipe(
          map(data => data),
          catchError(err => {
              return throwError(() => new Error(err));
          }));
  }
    getProductTypeBindingData(id: any) {
        return this.httpService.get(productType.getProductTypeList + id).pipe(
            map((res) => {
                return res as any;
            })
        );
    }
    getProductSubTypeBindingData(id: any) {
        return this.httpService.get(productType.getProductSubTypeList + id).pipe(
            map((res) => {
                return res as any;
            })
        );
    }



  getProductSubTypeList(
    pageNumber: any,
    pageS: any,
    sort: any): Observable<any> {
    return this.httpService.get<any>(`${productType.getProductSubTypeList + `?page=${pageNumber}&size=${pageS}&sort=${sort}`}`).pipe(
      map(data => data.content),
      catchError(err => {
        return throwError(() => new Error(err));
      })

        )
    }

    getProductSubTypes(searchText?: string): Observable<any> {
        return this.httpService.get<any>(`${productType.getAllProductSubType}`, {searchString : searchText}).pipe(
            map(data => data),
            catchError(err => {
                return throwError(() => new Error(err));
            })
        )
    }


    getPublishedProductTemplates(): Observable<any> {
        return this.httpService.get<any>(`${productTemplate.getAllProductTemplate}?filter=status:'PUBLISHED'`).pipe(
            map(data => data),
            catchError(err => {
                return throwError(() => new Error(err));
            }));
    }


    getAdditionalCostValue(): Observable<any> {
        return this.httpService.get<any>(`${productType.getAdditionalCost}`).pipe(
            map(data => data),
            catchError(err => {
                return throwError(() => new Error(err));
            }));
    }

    getTemplatesDescription(): Observable<any> {
        return this.httpService.get<any>(`${productTemplate.getSingleProductTemplate}`).pipe(
            map(data => data),
            catchError(err => {
                return throwError(() => new Error(err));
            }));
    }

    saveProductType(request: any) {
        return this.httpService
        .post(`${productType.saveProductType}`, request)
        .toPromise();
    }

    deleteProductType(id: any) {
        return this.httpService.delete<any>(`${productType.saveProductType}${id}`).pipe(
            map(data => data),
            catchError(err => {
               
                return throwError(() => new Error(err?.error?.userMessage));
            }));
    }

    saveProductSubType(request: any) {
            return this.httpService
            .post(`${productType.saveProductSubType}`, request)
            .toPromise();
    }

    deleteProductSubType(id: any) {
        return this.httpService.delete<any>(`${productType.saveProductSubType}${id}`).pipe(
            map(data => data),
            catchError(err => {
                return throwError(() => new Error(err?.error?.userMessage));
            }));
    }
}
