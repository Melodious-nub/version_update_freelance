import { Component, OnInit, Inject, Input } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { ApiService } from 'src/app/service/api.service';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  Subscription,
  switchMap,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { OrderFormsService } from 'src/app/project/postlogin/order-management/service/order-forms.service';

@Component({
  selector: 'app-pricecompare-dialog',
  templateUrl: './pricecompare-dialog.component.html',
  styleUrls: ['./pricecompare-dialog.component.scss'],
})
export class PricecompareDialogComponent implements OnInit {
  public imgUrl = environment.imgUrl;
  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public apiService: ApiService,
    public dialogRef: MatDialogRef<PricecompareDialogComponent>,
    public orderFormService: OrderFormsService
  ) {}

  close() {
    this.dialog.closeAll();
  }

  rearrangeProductAsPerCode(referenceArray: any[], dataArray: any[]): any[] {
    // Ensure we always access productcode from productDetails for both arrays
    const codeOrderMap = new Map(
      referenceArray.map((item, index) => [item.productCode, index])
    );
    return dataArray.sort((a, b) => {
      const aCode = a.productDetails?.productCode ?? a.productCode;
      const bCode = b.productDetails?.productCode ?? b.productCode;
      return (
        (codeOrderMap.get(aCode) ?? Infinity) -
        (codeOrderMap.get(bCode) ?? Infinity)
      );
    });
  }

  reArrangeReferenceArray(referenceArray: any[], dataArray: any[]): any[] {
    // Create a Set of productCodes from dataArray for quick lookup
    const dataCodes = new Set(
      dataArray.map(
        (item) => item.productDetails?.productCode ?? item.productCode
      )
    );

    // Filter referenceArray into two groups: found in dataArray and not found
    const found = referenceArray.filter((item) =>
      dataCodes.has(item.productCode)
    );
    const notFound = referenceArray.filter(
      (item) => !dataCodes.has(item.productCode)
    );

    // Return found first, then not found
    return [...found, ...notFound];
  }

  productsList: any[] = [];

  private searchSubject: Subject<string> = new Subject();
  private searchSubscription: Subscription;

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300), // wait for 300ms pause in events
        distinctUntilChanged(), // only emit if value is different from previous value
        switchMap((searchTerm: string) => {
          let filter: any;
          filter = "&filter=status!'DELETED'";
          return this.apiService.Get_Product_List_By_Search(
            0,
            '',
            '',
            '',
            searchTerm,
            filter
          );
        })
      )
      .subscribe((products: any) => {
        this.productsList = products?.content;
      });
    if (this.data.purchaseOrder?.productPackages) {
      this.data.orderPDFExtractedData = this.reArrangeReferenceArray(
        this.data.orderPDFExtractedData,
        this.data.purchaseOrder?.productPackages
      );
      this.data.purchaseOrder.productPackages = this.rearrangeProductAsPerCode(
        this.data.orderPDFExtractedData,
        this.data.purchaseOrder?.productPackages
      );
    }
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  getProductsList(event: any) {
    this.searchSubject.next(event.target.value);
  }

  onChange(value, inp, index) {
    const correctIndex =
      index + this.data.purchaseOrder?.productPackages?.length;
    const productPackage = this.orderFormService.productPackageForm();
    productPackage.patchValue(value, {
      emitEvent: false,
      onlySelf: true,
    });
    productPackage.get('productDetails').patchValue(value, {
      emitEvent: false,
      onlySelf: true,
    });
    productPackage
      .get('quantity')
      .patchValue(this.data.orderPDFExtractedData[correctIndex].quantity);
    productPackage
      .get('skuQuantities')
      .patchValue(this.data.orderPDFExtractedData[correctIndex].quantity);
    productPackage
      .get('totalCost')
      .patchValue(this.data.orderPDFExtractedData[correctIndex].totalCost);
    productPackage
      .get('cost')
      .patchValue(this.data.orderPDFExtractedData[correctIndex].costPerPackage);
    productPackage.get('id').patchValue(null);
    productPackage.get('productId').patchValue(value.id);
    productPackage.get('packageId').patchValue(value.skuPackageId);
    const productPackageObject = productPackage.getRawValue();
    this.data.purchaseOrder?.productPackages.push(productPackageObject);
    inp.value = null;
  }

  removeProductPackage(j) {
    this.data.purchaseOrder?.productPackages.splice(j, 1);
  }

  proceed() {
    this.dialogRef.close(this.data.purchaseOrder);
  }

  getNotFoundedLength() {
    const length =
      this.data.orderPDFExtractedData?.length -
      this.data.purchaseOrder?.productPackages?.length;
    return Array.from({ length }, (_, i) => i);
  }
}
