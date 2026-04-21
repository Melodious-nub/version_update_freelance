import { Injectable } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';
import { HttpService } from '../../../../service/http.service';
import {
  order,
  orderConfigModule,
  productTemplate,
  productType,
} from '../../../../shared/constant';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BusinessAccountService } from '../../business-account/business-account.service';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  daysFreightMap = { 20: 'Air', 90: 'Ground' };
  loadPurchaseOrder = new Subject();
  constructor(
    private httpService: HttpService,
    private httpClient: HttpClient,
    private businessAccountService: BusinessAccountService
  ) {}

  // Get Product list for checkout
  Get_Product_List(
    pageNumber: any,
    pageS: any,
    sort: any,
    searchString: any
  ): Observable<any> {
    return this.httpService
      .get(
        order.getSaleableProductList +
          `?searchString=${searchString}&page=${pageNumber}&size=${pageS}&sort=${sort}`
      )
      .pipe(
        map((res: any) => {
          return res as any;
        })
      );
  }

  convertProductRequest(url, productSearchRequest: any) {
    if (productSearchRequest?.searchString) {
      url = url + '&searchString=' + productSearchRequest?.searchString;
    }
    if (productSearchRequest?.isFavourite) {
      url = url + '&filter=isFavourite:true';
    }
    if (productSearchRequest?.isCustomizable) {
      url = url + '&filter=isCustomizable:true';
    }
    if (productSearchRequest?.preferredCustomerId) {
      url =
        url +
        `&filter=preferredCustomerId:${productSearchRequest?.preferredCustomerId} or preferredCustomerId is null`;
    }

    if (productSearchRequest?.uomQuery) {
      url = url + productSearchRequest?.uomQuery;
    }
    if (
      productSearchRequest?.productTypeIds &&
      productSearchRequest?.productTypeIds?.length > 0 &&
      productSearchRequest?.productTypeIds != 'null'
    ) {
      url =
        url +
        '&filter=productTypeId in (' +
        productSearchRequest?.productTypeIds.join(',') +
        ')';
    }
    productSearchRequest.productCategoryId =
      productSearchRequest?.productCategoryId?.toString();
    if (
      productSearchRequest?.productCategoryId &&
      productSearchRequest?.productCategoryId != 'null' &&
      !productSearchRequest?.productCategoryId?.includes(',')
    ) {
      url =
        url +
        "&filter=productCategoryIdList~'*%23" +
        productSearchRequest?.productCategoryId +
        "%23*'";
    }

    if (productSearchRequest?.productCategoryId?.includes(',')) {
      productSearchRequest.productCategoryId =
        productSearchRequest.productCategoryId.toString();
      const categoryIds = productSearchRequest.productCategoryId.split(',');
      const categoryFilter = categoryIds
        .map((id: string) => `productCategoryIdList~'*%23${id}%23*'`)
        .join(' or ');
      url = url + `&filter=${categoryFilter}`;
    }

    if (
      productSearchRequest?.specificVendor &&
      productSearchRequest?.specificVendor != 'null'
    ) {
      url = url + '&specificVendor=' + productSearchRequest?.specificVendor;
    }
    if (productSearchRequest.buyingCapacityType) {
      url =
        url + '&buyingCapacityType=' + productSearchRequest?.buyingCapacityType;
    }
    if (productSearchRequest?.ownershipFilter) {
      url = url + productSearchRequest?.ownershipFilter;
    }

    return url;
  }

  // Get All Products for checkout
  Get_ALL_Product_List(productSearchRequest: any): Observable<any> {
    let url: any =
      order.getAllProduct +
      '?' +
      `page=${productSearchRequest.pageIndex}&size=${productSearchRequest.pageS}&sort=${productSearchRequest.sortQuery}`;

    url = this.convertProductRequest(url, productSearchRequest);
    return this.httpService.get(url).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  // Get All Products for checkout
  downloadProductsPdf(productSearchRequest: any): Observable<any> {
    let url: any =
      environment.apiUrl +
      order.downloadProducts +
      '?' +
      `page=${productSearchRequest.pageIndex}&size=${productSearchRequest.pageS}&sort=${productSearchRequest.sortQuery}`;

    url = this.convertProductRequest(url, productSearchRequest);

    return this.httpClient.get(url, { responseType: 'text' }).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  // Get Order for checkout
  Get_Order(purchaseorderId: any): Observable<any> {
    return this.httpService.get(order.purchaseOrder + purchaseorderId).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  // Get Order for checkout
  Get_PaymentOverview(purchaseorderId: any): Observable<any> {
    return this.httpService.get(order.paymentOverview + purchaseorderId).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  // Get Order for checkout
  Get_All_Order(
    searchText: any,
    pageS: any,
    pageIndex: any,
    sortQuery: any,
    uomQuery?: any,
    filter?: any
  ): Observable<any> {
    let apiUrl =
      order.purchaseOrder +
      `?page=${pageIndex}&size=${pageS}&sort=${sortQuery}`;
    if (searchText) {
      apiUrl += `&searchString=${searchText}`;
    }
    if (filter) {
      apiUrl += `&${filter}`;
    }
    if (uomQuery) {
      apiUrl += `&${uomQuery}`;
    }
    apiUrl += `&filter=requestFrom.id:${this.businessAccountService.currentBusinessAccountId}`;
    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }
  // Refresh Order for checkout
  Refresh_Order(purchaseorder: any): Observable<any> {
    let url = order.refreshpurchaseOrder;
    if (purchaseorder?.isMobileSignup) {
      url = url + '?isMobileSignup=true';
      delete purchaseorder.isMobileSignup;
    }
    return this.httpService.post(url, purchaseorder).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  // Post Order for checkout
  Post_Order(purchaseorder: any): Observable<any> {
    let url = order.savepurchaseOrder;
    if (purchaseorder?.isMobileSignup) {
      url = url + '?isMobileSignup=true';
      delete purchaseorder.isMobileSignup;
    }
    return this.httpService.post(url, purchaseorder).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  // delete Order
  Delete_Order(orderId: number): Observable<void> {
    return this.httpService
      .delete(order.purchaseOrder + orderId)
      .pipe(map((res: any) => {}));
  }

  //calculate Order
  Calculate_Order_Values(purchaseorder: any, uomQuery: any): Observable<any> {
    return this.httpService
      .post(order.calculatepurchaseOrder + '?' + uomQuery, purchaseorder)
      .pipe(
        map((res: any) => {
          return res as any;
        })
      );
  }

  Calculate_Purchase_Order_Values(purchaseorder: any, uomQuery: any) {
    return this.httpService
      .post(order.calculatepurchaseOrder + '?' + uomQuery, purchaseorder)
      .toPromise();
  }

  // Get categories
  Get_Product_Categories(filter: any) {
    return this.httpService
      .get(productType.productCategory + '?noncache=true' + filter)
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  Get_Product_Categories_Mapped(vendorId: any) {
    return this.httpService
      .get(productType.getProductCategories + '?vendorId=' + vendorId)
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  rate_product(data: any): Observable<any> {
    return this.httpService.post(productTemplate.rateProduct, data).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }
  getProductsTierPricingDetailByVendor(productIds: any) {
    let apiUrl: any = `${order.getTierPricingList}?productIds=${productIds}`;
    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  getProductDetail(productId: any) {
    let apiUrl: any = `${orderConfigModule.productDetail}?productId=${productId}`;
    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  getProductTypesByVendor(vendorId: any) {
    let apiUrl: any = `${order.getProductTypesForVendor}?filter=audit.businessAccount.id : 1 or audit.businessAccount.id : ${vendorId}`;
    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }
}
