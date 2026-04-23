import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ContainerManagementService } from 'src/app/project/postlogin/container-management/service/container-management.service';
import { ProductService } from 'src/app/project/postlogin/product-management/product/service/product.service';
import { ApiService } from 'src/app/service/api.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { PrintService } from 'src/app/service/print.service';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceFormsService } from '../../invoice-forms.service';
import { InvoiceManagementService } from '../../invoice-management.service';
import { OrderManagementService } from '../../../../service/order-management.service';
import { PricecompareDialogComponent } from 'src/app/shared/component/pricecompare-dialog/pricecompare-dialog.component';
import { OrderTransactionPackagesComponent } from '../../../../../../../shared/component/order-transaction-packages/order-transaction-packages.component';
import { DadyinInputComponent } from '../../../../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { DadyinSelectComponent } from '../../../../../../../shared/widgets/dadyin-select/dadyin-select.component';
import { NgIf, NgFor } from '@angular/common';
import { DadyinButtonComponent } from '../../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { DadyinSearchableSelectComponent } from '../../../../../../../shared/widgets/dadyin-searchable-select/dadyin-searchable-select.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, MatExpansionPanelContent } from '@angular/material/expansion';

@Component({
    selector: 'app-create-invoice',
    templateUrl: './create-invoice.component.html',
    styleUrls: ['./create-invoice.component.scss'],
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelDescription,
        MatExpansionPanelContent,
        DadyinSearchableSelectComponent,
        DadyinButtonComponent,
        NgIf,
        DadyinSelectComponent,
        DadyinInputComponent,
        NgFor,
        OrderTransactionPackagesComponent,
    ],
})
export class CreateInvoiceComponent implements OnInit {
  currentBusinessAccount: any;
  htmlContent: any;
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.map1 = false;
  }

  map1 = false;
  @Input() componentUoms: any;
  productsList: any;
  quotationsList: any;
  @Input() invoiceForm: UntypedFormGroup;
  @Output() calculate = new EventEmitter();
  @Output() patchEditData = new EventEmitter();
  private ngUnsubscribe: Subject<void> = new Subject();
  public buyingTypeList: any[] = [
    { name: 'SKU', value: 'SKU' },
    { name: 'Truck Load', value: 'TRUCK' },
    { name: 'Pallet', value: 'PALLET' },
    { name: 'Container (20ft)', value: 'CONTAINER_20_FT' },
    { name: 'Container (40ft)', value: 'CONTAINER_40_FT' },
    { name: 'Container (40ft) HQ', value: 'CONTAINER_40_FT_HQ' },
  ];
  uomSetting = false;
  minRequiredDate: any = new Date().toISOString().split('T')[0];
  productAttributeSets: any;
  productAttributeSetControl = this.fb.group({
    descriptionId: [null],
  });

  invoiceFile = null;

  constructor(
    public fb: UntypedFormBuilder,
    public invoiceManagementService: InvoiceManagementService,
    public orderManagementService: OrderManagementService,
    public invoiceFormsService: InvoiceFormsService,
    public formsService: FormsService,
    public route: ActivatedRoute,
    public toastr: ToastrService,
    public uomService: UomService,
    public containerService: ContainerManagementService,
    public businessAccountService: BusinessAccountService,
    public apiService: ApiService,
    public router: Router,
    public productService: ProductService,
    public ref: ChangeDetectorRef,
    public printService: PrintService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.businessAccountService.Get_All_Notes();
    this.businessAccountService.Get_All_Vendors();
    this.businessAccountService.Get_All_Exporter_Vendors();
    this.containerService.Get_All_IncoTerms();
    this.containerService.Get_All_ports();
    this.containerService.Get_All_paymentTerms();
    this.containerService.Get_All_employees();
    this.containerService.Get_All_Container_List(0, 100, 'asc', null);
    this.setDatas();

    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.currentBusinessAccount = res;
    });

    if (this.route.snapshot.queryParams?.customerId) {
      this.customerId.patchValue(
        Number(this.route.snapshot.queryParams?.customerId)
      );
    }
  }

  get customerId() {
    return this.invoiceForm.get('requestFrom').get('id');
  }

  setDatas() {
    const currentDate = new Date();
    const expectedByDate = new Date(
      currentDate.getTime() + 45 * 24 * 60 * 60 * 1000
    );
    const editTillDate = new Date(
      currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    this.invoiceForm
      .get('date')
      .setValue(currentDate.toISOString().split('T')[0]);
    this.invoiceForm
      .get('expectedByDate')
      .setValue(expectedByDate.toISOString().split('T')[0]);
    this.invoiceForm
      .get('editTillDate')
      .setValue(editTillDate.toISOString().split('T')[0]);
    this.invoiceForm.get('loadingTypeId').setValue('FLOOR');
  }

  get productPackages() {
    return this.invoiceForm.get('productPackages') as UntypedFormArray;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  expandPanel(matExpansionPanel, event): void {
    event.stopPropagation(); // Preventing event bubbling

    if (!this._isExpansionIndicator(event.target)) {
      matExpansionPanel.open(); // Here's the magic
    }
  }

  private _isExpansionIndicator(target: EventTarget): boolean {
    const expansionIndicatorClass = 'mat-expansion-indicator';
    return (
      target['classList'] &&
      target['classList'].contains(expansionIndicatorClass)
    );
  }

  openMap(type: any) {
    if (type == 1) {
      this.map1 = !this.map1;
    }
  }

  get requestFromAddress() {
    const item = this.businessAccountService.customerList.find(
      (item) => item.relationAccountId == this.customerId.value
    );
    return item
      ? item?.address?.addressLine +
          ',' +
          item?.address?.addressCity +
          ',' +
          item?.address?.addressState +
          ',' +
          item?.address?.addressZipCode +
          ',' +
          item?.address?.addressCountry
      : '';
  }

  getProductsList = (() => {
    const subject = new Subject<any>();
    subject
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((event: any) => {
        let productSearchRequest: any = {};

        const uomQuery = this.getUomQuery();
        productSearchRequest.searchString = event.target.value;
        productSearchRequest.uomQuery = uomQuery;
        productSearchRequest.published = true;
        productSearchRequest.businessAccountId = this.customerId.value;
        productSearchRequest.loggedInAccountId =
          this.businessAccountService.currentBusinessAccountId;
        this.orderManagementService
          .Get_ALL_Products_List_For_ReceivedPurchaseOrder(productSearchRequest)
          .subscribe((res) => {
            this.productsList = res?.content;
          });
      });
    return (event: any) => subject.next(event);
  })();

  isSelfProduct(productDetails: any) {
    const loggedInAccountId =
      this.businessAccountService.currentBusinessAccountId;
    return productDetails?.audit?.businessAccountId == loggedInAccountId
      ? true
      : false;
  }

  checkIfAnyProductIsSelfProduct() {
    const productPackages = this.productPackages.get(
      'productPackages'
    ) as UntypedFormArray;
    const loggedInAccountId =
      this.businessAccountService.currentBusinessAccountId;
    const ind = productPackages?.value.findIndex(
      (productPackage) =>
        productPackage.productDetails?.audit?.businessAccountId ==
        loggedInAccountId
    );
    return ind == -1 ? false : true;
  }

  calculateValues() {
    this.calculate.emit(null);
  }

  toggleType(value: any) {
    if (!this.isEditable) {
      return;
    }
    this.invoiceForm.get('importLocalType').setValue(value);
  }
  get importLocalType() {
    return this.invoiceForm.get('importLocalType');
  }

  get status() {
    return this.invoiceForm.get('status');
  }

  get isEditable() {
    return (
      this.status.value != 'CONFIRMED' &&
      this.status.value != 'REJECTED' &&
      !this.invoiceForm.get('isQuickCheckout').value
    );
  }

  get incoTermId() {
    return this.invoiceForm.get('incoTermId');
  }
  get departurePortId() {
    return this.invoiceForm.get('departurePortId');
  }
  get buyingType() {
    return this.invoiceForm.get('buyingType');
  }

  onChangeCustomer() {
    const customer = this.businessAccountService.customerList.find(
      (customer) => customer.relationAccountId == this.customerId.value
    );
    this.productsList = [];
  }

  get noteId() {
    return this.invoiceForm.get('noteTemplate').get('id');
  }

  get media_url_ids() {
    return this.invoiceForm.get('media_url_ids');
  }

  get media_urls() {
    return this.invoiceForm.get('media_urls');
  }

  getNoteTitle() {
    const item = this.businessAccountService.notesList.find(
      (item) => item.id == this.noteId.value
    );
    return item?.description ?? '';
  }

  getUomQuery() {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    return uomQuery;
  }

  async generateInvoiceFromPdf(file: any) {
    if (this.status.value == 'CONFIRMED') {
      this.toastr.error("You can't upload Invoice in Confirmed Status");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('orderQuotation', file);
      const data = await this.orderManagementService
        .generatePoFromPdf(formData, null)
        .toPromise();
      if (data.status == 'FAILED') {
        this.toastr.warning(data?.error);
      }
      this.invoiceFile = file;
      this.openCompareDialog(data);
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.errorMessage ?? 'Some Error Occurred');
    }
  }

  openCompareDialog(data) {
    let dialogRef = this.dialog.open(PricecompareDialogComponent, {
      width: '90%',
      data: data
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result)
        this.patchEditData.emit(result);
      }
    });
  }



}
