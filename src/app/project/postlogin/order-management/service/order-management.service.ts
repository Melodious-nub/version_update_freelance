import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpService } from 'src/app/service/http.service';
import { order, orderConfigModule } from 'src/app/shared/constant';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderManagementService {
  productIndexList = [];
  receivedPOsList: any[] = [];
  currentRouteId: any = null;
  productsList: any;
  constructor(
    private httpService: HttpService,
    private httpClient: HttpClient
  ) {}

  Get_All_ReceivedPOs(
    pageNumber: any,
    pageS: any,
    sort: any,
    uomQuery: any,
    filter?: any
  ): Observable<any> {
    return this.httpService
      .get(
        order.getAllreceivedPurchaseOrders +
          `?page=${pageNumber}&size=${pageS}&sort=${sort}&uomQuery=${uomQuery}&${filter}`
      )
      .pipe(
        map((res: any) => {
          this.receivedPOsList = res.content;
          return res as any;
        })
      );
  }

  getReceivedPOwithProductReplacementById(id: any, indexList: any) {
    indexList = indexList.join(',');
    return this.httpService
      .get(
        `${order.getreceivedPOById}${id}?indexToChangeWithNewProduct=${indexList}`
      )
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }
  getReceivedPOById(id: any) {
    return this.httpService.get(`${order.getreceivedPOById}${id}`).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  updatePo(data: any, uomQuery: any) {
    return this.httpService
      .post(`${order.savepurchaseOrder}` + '?' + uomQuery, data)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  getRfqById(id: any) {
    return this.httpService.get(`${order.getRfqById}${id}`).pipe(
      map((res) => {
        return res as any;
      })
    );
  }
  getQuotationById(id: any) {
    return this.httpService.get(`${order.getAllQuotationsById}${id}`).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  // Refresh Order for checkout
  Refresh_Order(purchaseorder: any): Observable<any> {
    let url = order.refreshpurchaseOrder;

    return this.httpService.post(url, purchaseorder).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  updateRfq(data: any, uomQuery: any) {
    return this.httpService
      .post(`${order.getRfqById}` + '?' + uomQuery, data)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  updateQuotation(data: any, uomQuery: any) {
    return this.httpService
      .post(`${order.getAllQuotationsById}save` + '?' + uomQuery, data)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  Get_All_Rfqs(
    pageNumber?: any,
    pageS?: any,
    sort?: any,
    uomQuery?: any,
    filter?: any
  ): Observable<any> {
    return this.httpService
      .get(
        order.getAllrfQs +
          `?${uomQuery ?? ''}&page=${pageNumber ?? 0}&size=${
            pageS ?? 200
          }&sort=${sort ?? 'desc'}&${filter ?? ''}`
      )
      .pipe(
        map((res: any) => {
          return res as any;
        })
      );
  }

  Get_All_Quotations(
    pageNumber?: any,
    pageS?: any,
    sort?: any,
    uomQuery?: any,
    filter?: any
  ): Observable<any> {
    return this.httpService
      .get(
        order.getAllQuotations +
          `?&page=${pageNumber ?? 0}&size=${pageS ?? 100}&sort=${
            sort ?? 'desc'
          }&${uomQuery ?? ''}&${filter ?? ''}`
      )
      .pipe(
        map((res: any) => {
          return res as any;
        })
      );
  }

  Get_All_QuotationsList(filter?: any): Observable<any> {
    return this.httpService
      .get(order.getAllQuotations + `all?${filter ?? ''}`)
      .pipe(
        map((res: any) => {
          return res as any;
        })
      );
  }

  Get_All_RecQuotations(
    pageNumber?: any,
    pageS?: any,
    sort?: any,
    uomQuery?: any,
    filter?: any
  ): Observable<any> {
    return this.httpService
      .get(
        order.getAllReceivedQuotations +
          `?&page=${pageNumber ?? 0}&size=${pageS ?? 100}&sort=${
            sort ?? 'desc'
          }&${uomQuery ?? ''}&${filter ?? ''}`
      )
      .pipe(
        map((res: any) => {
          return res as any;
        })
      );
  }

  Get_All_RecEnquiries(
  pageNumber?: any,
    pageS?: any,
    sort?: any,
    uomQuery?: any,
    filter?: any
  ): Observable<any> {
    return this.httpService
      .get(
        order.getAllRecEnquiries +
          `?${uomQuery}&page=${pageNumber ?? 0}&size=${pageS ?? 100}&sort=${
            sort ?? 'desc'
          }&${filter ?? ''}`
      )
      .pipe(
        map((res: any) => {
          return res as any;
        })
      );
  }

  // copyProductForCustomization(productId: any, purchaseOrderId: any,data:any) {
  //   let apiUrl: any = `${order.copyProductForCustomization}` + '?productId=' + productId + '&purchaseOrderId=' + purchaseOrderId
  //   return this.httpService.post(apiUrl,data).pipe(map((res: any) => { return res as any; }))
  // }

  copyProductForAccount(
    packageId: any,
    productId: any,
    purchaseOrderId: any,
    cloneForCustomisation
  ) {
    let apiUrl: any =
      `${order.copyProductForAccount}` +
      '?productId=' +
      productId +
      '&packageId=' +
      packageId;
    if (cloneForCustomisation) {
      apiUrl =
        `${order.copyProductForAccount}` +
        '?productId=' +
        productId +
        '&packageId=' +
        packageId +
        '&isCustomizedProduct=true' +
        '&purchaseOrderId=' +
        purchaseOrderId;
    } else {
      apiUrl =
        `${order.copyProductForAccount}` +
        '?productId=' +
        productId +
        '&packageId=' +
        packageId +
        '&isCustomizedProduct=false' +
        '&purchaseOrderId=' +
        purchaseOrderId;
    }
    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  Get_ALL_Products_List(productSearchRequest: any): Observable<any> {
    let url: any = order.getAllProduct + '?';

    if (productSearchRequest?.searchString) {
      url = url + '&searchString=' + productSearchRequest?.searchString;
    }
    if (productSearchRequest?.uomQuery) {
      url = url + productSearchRequest?.uomQuery;
    }
    if (productSearchRequest?.businessAccountId) {
      url =
        url +
        '&filter=audit.businessAccount.id:' +
        productSearchRequest?.businessAccountId +
        ' or audit.businessAccount.id:' +
        productSearchRequest?.loggedInAccountId +
        ' or audit.businessAccount.id:1';
    } else {
      url = url + '&filter=audit.businessAccount.id:1';
    }

    if (productSearchRequest?.published) {
      url = url + '&filter=status:' + "'PUBLISHED'";
    }

    if (
      productSearchRequest?.productCategoryId &&
      productSearchRequest?.productCategoryId?.length > 0
    ) {
      let query =
        "&filter=productCategoryIdList~'*%23" +
        productSearchRequest?.productCategoryId[0] +
        "%23*'";
      for (
        let index = 1;
        index < productSearchRequest?.productCategoryId.length;
        index++
      ) {
        query =
          query +
          ' or ' +
          "productCategoryIdList~'*%23" +
          productSearchRequest?.productCategoryId[index] +
          "%23*'";
      }
      url = url + query;
    }

    return this.httpService.get(url).pipe(
      map((res: any) => {
        this.productsList = res;
        return res as any;
      })
    );
  }

  Get_ALL_Products_List_For_PurchaseOrder(
    productSearchRequest: any
  ): Observable<any> {
    let url: any = order.getAllProductPurchaseOrder + '?';
    if (productSearchRequest?.specificVendorId) {
      url = url + '&specificVendor=' + productSearchRequest?.specificVendorId;
    }
    if (productSearchRequest?.searchString) {
      url = url + '&searchString=' + productSearchRequest?.searchString;
    }
    if (productSearchRequest?.uomQuery) {
      url = url + productSearchRequest?.uomQuery;
    }
    if (productSearchRequest?.businessAccountId) {
      url =
        url +
        '&filter=audit.businessAccount.id:' +
        productSearchRequest?.businessAccountId +
        ' or audit.businessAccount.id:' +
        productSearchRequest?.loggedInAccountId +
        ' or audit.businessAccount.id:1';
    } else {
      url = url + '&filter=audit.businessAccount.id:1';
    }
    if (productSearchRequest?.published) {
      url = url + '&filter=status:' + "'PUBLISHED'";
    }

    if (
      productSearchRequest?.productCategoryId &&
      productSearchRequest?.productCategoryId?.length > 0
    ) {
      let query =
        "&filter=productCategoryIdList~'*%23" +
        productSearchRequest?.productCategoryId[0] +
        "%23*'";
      for (
        let index = 1;
        index < productSearchRequest?.productCategoryId.length;
        index++
      ) {
        query =
          query +
          ' or ' +
          "productCategoryIdList~'*%23" +
          productSearchRequest?.productCategoryId[index] +
          "%23*'";
      }
      url = url + query;
    }

    if (productSearchRequest?.isFavourite) {
      url = url + '&filter=isFavourite:true';
    }

    return this.httpService.get(url).pipe(
      map((res: any) => {
        this.productsList = res;
        return res as any;
      })
    );
  }

  Get_ALL_Products_List_For_ReceivedPurchaseOrder(
    productSearchRequest: any
  ): Observable<any> {
    let url: any = order.getAllProductReceivedPurchaseOrder + '?';

    if (productSearchRequest?.businessAccountId) {
      url =
        url + '&specificCustomerId=' + productSearchRequest?.businessAccountId;
    }
    if (productSearchRequest?.searchString) {
      url = url + '&searchString=' + productSearchRequest?.searchString;
    }
    if (productSearchRequest?.uomQuery) {
      url = url + productSearchRequest?.uomQuery;
    }
    if (productSearchRequest?.businessAccountId) {
      url =
        url +
        '&filter=audit.businessAccount.id:' +
        productSearchRequest?.businessAccountId +
        ' or audit.businessAccount.id:' +
        productSearchRequest?.loggedInAccountId +
        ' or audit.businessAccount.id:1';
    } else {
      url =
        url +
        '&filter=audit.businessAccount.id:' +
        productSearchRequest?.loggedInAccountId +
        ' or audit.businessAccount.id:1';
    }
    if (productSearchRequest?.published) {
      url = url + '&filter=status:' + "'PUBLISHED'";
    }

    if (
      productSearchRequest?.productCategoryId &&
      productSearchRequest?.productCategoryId?.length > 0
    ) {
      let query =
        "&filter=productCategoryIdList~'*%23" +
        productSearchRequest?.productCategoryId[0] +
        "%23*'";
      for (
        let index = 1;
        index < productSearchRequest?.productCategoryId.length;
        index++
      ) {
        query =
          query +
          ' or ' +
          "productCategoryIdList~'*%23" +
          productSearchRequest?.productCategoryId[index] +
          "%23*'";
      }

      url = url + query;
    }

    if (productSearchRequest?.filter) {
      url = url + productSearchRequest?.filter;
    }

    return this.httpService.get(url).pipe(
      map((res: any) => {
        this.productsList = res;
        return res as any;
      })
    );
  }

  Calculate_Rfq_Values(rfq: any, uomQuery) {
    return this.httpService
      .post(order.calculaterfq + '?' + uomQuery, rfq)
      .toPromise();
  }

  Calculate_Purchase_Order_Values(purchaseorder: any) {
    return this.httpService
      .post(order.calculatepurchaseOrder, purchaseorder)
      .toPromise();
  }

  Calculate_Received_Purchase_Order_Values(purchaseorder: any, uomQuery) {
    return this.httpService
      .post(order.calculatepurchaseOrder + '?' + uomQuery, purchaseorder)
      .toPromise();
  }

  Calculate_Quotation_Values(quotation: any, uomQuery) {
    return this.httpService
      .post(order.calculateQuotation + '?' + uomQuery, quotation)
      .toPromise();
  }

  deleteRfq(id: any): Observable<any> {
    return this.httpService.delete<any>(`${order.getRfqById}${id}`);
  }


  deleteRecvQuotation(id: any): Observable<any> {
    return this.httpService.delete<any>(`${order.getAllQuotationsById}${id}`);
  }

  deleteReceivedPo(id: any): Observable<any> {
    return this.httpService.delete<any>(
      `${order.deleteReceivedPurchaseOrder}${id}`
    );
  }

  updateReceivedPo(data: any, uomQuery: any) {
    return this.httpService
      .post(`${order.getAllreceivedPurchaseOrders}` + '?' + uomQuery, data)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  generatePdf(id: any, vendorId: any, buyingCapacity: any, uomQuery: any) {
    let apiUrl: any =
      environment.apiUrl +
      `${order.generatePdf}?purchaseOrderId=${id}&buyingCapacityType=${buyingCapacity}&specificVendor=${vendorId}&uomQuery=${uomQuery}`;
    return this.httpClient.get(apiUrl, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  generateQuotationPdf(
    quotationId: any,
    customerId: any,
    buyingCapacity: any,
    isQCStylePDF?: boolean,
    uomQuery?: any
  ) {
    let apiUrl: any = `${environment.apiUrl}${order.generateQuotationPdf}?quotationId=${quotationId}&buyingCapacityType=${buyingCapacity}&specificCustomer=${customerId}&isQCStylePDF=${isQCStylePDF}&uomQuery=${uomQuery}`;
    return this.httpClient.get(apiUrl, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  generateRFQPdf(
    quotationId: any,
    buyingCapacity: any,
    isQCStylePDF?: boolean,
    uomQuery?: any
  ) {
    let apiUrl: any = `${environment.apiUrl}${order.generateRFQPdf}?quotationId=${quotationId}&buyingCapacityType=${buyingCapacity}&isQCStylePDF=${isQCStylePDF}&uomQuery=${uomQuery}`;
    return this.httpClient.get(apiUrl, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  getProductAttributeSetByCategory(category: any) {
    let apiUrl: any = `${orderConfigModule.getAllproductAttributeSetByCategory}${category}`;
    return this.httpService.get(apiUrl).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  markAsRead(id: any, type: any) {
    //QUOTATION, PURCHASE_ORDER, SALE_ORDER
    return this.httpService
      .post(`${order.markAsRead}?orderType=${type}&id=${id}`)
      .pipe(
        map((res) => {
          return res as any;
        })
      );
  }

  generatePoFromPdf(data: any, vendorId: any) {
    let url = `${order.generatePoFromPdf}`;
    if (vendorId) {
      url = url + `?specificVendor=${vendorId}`;
    }
    return this.httpService.post(url, data).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  recordManualPayment(data: any, orderId: any) {
    let url = `${order.recordManualPayments}`;
    if (orderId) {
      url = url + `?orderId=${orderId}`;
    }
    return this.httpService.post(url, data).pipe(
      map((res) => {
        return res as any;
      })
    );
  }

  Get_PaymentOverview(purchaseorderId: any): Observable<any> {
    return this.httpService.get(order.paymentOverview + purchaseorderId).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }

  Get_ALL_Product_List(productSearchRequest: any): Observable<any> {
    let url: any =
      order.getAllProduct +
      `?page=${productSearchRequest.pageIndex}&size=${productSearchRequest.pageS}&sort=${productSearchRequest.sortQuery}`;

    if (productSearchRequest?.searchString) {
      url = url + '&searchString=' + productSearchRequest?.searchString;
    }
   if (productSearchRequest?.filter) {
      url = url + '&filter=' + productSearchRequest?.filter;
    }
    return this.httpService.get(url).pipe(
      map((res: any) => {
        return res as any;
      })
    );
  }
}
