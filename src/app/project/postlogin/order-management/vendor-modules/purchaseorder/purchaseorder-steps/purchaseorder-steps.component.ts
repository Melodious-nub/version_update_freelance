import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/service/api.service';
import { CommonService } from 'src/app/service/common.service';
import { UomService } from 'src/app/service/uom.service';
import { OrderFormsService } from '../../../service/order-forms.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { PurchaseOrderService } from 'src/app/project/postlogin/quick-checkout/services/purchase-order.service';
import { FormsService } from 'src/app/service/forms.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceManagementService } from '../../../customer-modules/invoice-management/invoice-management.service';
import { OrderManagementService } from '../../../service/order-management.service';
import { PaymentComponent } from './payment/payment.component';
import { CreateOrderComponent } from './create-order/create-order.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-purchaseorder-steps',
    templateUrl: './purchaseorder-steps.component.html',
    styleUrls: ['./purchaseorder-steps.component.scss'],
    standalone: true,
    imports: [
    DadyinButtonComponent,
    MatTooltip,
    FormsModule,
    ReactiveFormsModule,
    MatTabGroup,
    MatTab,
    CreateOrderComponent,
    PaymentComponent,
    DatePipe
],
})
export class PurchaseorderStepsComponent implements OnInit {
  // ************* Variable Declarations *************
  currentStepIndex = 0;
  purchaseOrderForm: UntypedFormGroup;
  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formsService.createPreferUomForm();
  private ngUnsubscribe: Subject<void> = new Subject();
  uomSetting = false;

  constructor(
    public uomService: UomService,
    public purchaseOrderService: PurchaseOrderService,
    public invoiceManagementService: InvoiceManagementService,
    public orderManagementService: OrderManagementService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    public toastr: ToastrService,
    public router: Router,
    public apiService: ApiService,
    public orderFormsService: OrderFormsService,
    public formsService: FormsService,
    public businessAccountService: BusinessAccountService,
    public dialog: MatDialog,
    public cdRef: ChangeDetectorRef
  ) {
    this.purchaseOrderForm =this.orderFormsService.createReceivedPurchaseOrderForm();
  }

  mainTab: Array<any> = [
    {
      id: 1,
      name: 'Received PO',
      index: 0,
    },
  ];

  async ngOnInit() {
    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.purchaseOrderForm.get('requestFrom').get('id').patchValue(res?.id);
    });

    if (this.route.snapshot.queryParams.quotationId) {
      this.orderManagementService
        .getQuotationById(this.route.snapshot.queryParams.quotationId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(async (quotation: any) => {
          this.purchaseOrderForm
            .get('referenceOrder')
            .get('quotationId')
            .patchValue(quotation?.id);
          this.purchaseOrderForm
            .get('requestFrom')
            .patchValue(quotation?.requestTo);
          this.purchaseOrderForm
            .get('requestTo')
            .patchValue(quotation?.requestFrom);
          delete quotation.id;
          delete quotation.status;
          delete quotation.transactionId;
          delete quotation?.requestFrom
          delete quotation?.requestTo
          quotation.productPackages.forEach((product) => {
            product.id = null;
          });
          this.patchEditData(quotation, true);
        });
    } else if (this.route.snapshot.params.id) {
      this.getOrderById(this.route.snapshot.params.id);
    } else {
      const productPackages = this.purchaseOrderForm.get(
        'productPackages'
      ) as UntypedFormArray;
      productPackages.push(this.orderFormsService.productPackageForm());
    }
    // this.status.valueChanges.subscribe((res) => {
    //   if (res == 'CONFIRMED' || res == 'REJECTED') {
    //     this.purchaseOrderForm.disable({ onlySelf: true, emitEvent: false });
    //   }
    // });
  }

  getOrderById(id: any) {
    this.purchaseOrderService
      .Get_Order(this.route.snapshot.params.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        async (res: any) => {
          this.patchEditData(res);
        },
        (err) => {
          if (err?.status === 404) {
            this.toastr.warning('Transaction Not Found');
            this.navigate('/home/order-management/vendor?currentStepIndex=2');
          } else {
            this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
          }
        }
      );
  }

  get status() {
    return this.purchaseOrderForm.get('status');
  }

  get requestToName() {
    const requestToId = this.purchaseOrderForm.get('requestTo').value.id;
    const item = this.businessAccountService.vendorList.find(
      (vendor) => vendor.relationAccountId == Number(requestToId)
    );
    return item?.relationAccountName ?? '';
  }

  confirmDelete() {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.deletePo();
        }
      });
  }

  async deletePo() {
    try {
      const id: any = this.route.snapshot.params.id;
      const data = await this.purchaseOrderService.Delete_Order(id).toPromise();
      this.toastr.success('Successfully Deleted');
      this.navigate('/home/order-management/vendor?currentStepIndex=1');
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  async calculateValues() {
    if (this.purchaseOrderForm.invalid) {
      this.purchaseOrderForm.markAllAsTouched();
      console.log(this.purchaseOrderForm);
      this.toastr.error('Please fill all the required fields');
      return;
    }
    try {
      const uomQuery = this.getUomQuery();
      let data: any = this.purchaseOrderForm.getRawValue();
      data.isReceiving = false;
      if (data.noteTemplate.id == null) {
        data.noteTemplate = null;
      }

      const res: any =
        await this.purchaseOrderService.Calculate_Purchase_Order_Values(
          data,
          uomQuery
        );
      this.patchEditData(res);
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  savePo(status: any, Refresh: any = false, print: any = false) {
    if (this.purchaseOrderForm.invalid) {
      this.purchaseOrderForm.markAllAsTouched();
      this.toastr.error('Please fill all the required fields');
      return;
    }
    let data: any = this.purchaseOrderForm.getRawValue();
    data.isReceiving = false;
    if (data.noteTemplate.id == null) {
      data.noteTemplate = null;
    }
    if (data?.isQuickCheckout && !Refresh) {
      this.toastr.error("Quick checkout Purchase order can't be changed");
      return;
    }

    if (data?.referenceContainerId == 'NEW') {
      data.referenceContainerId = null;
      data.isCreateNewContainer = true;
    }
    data.status = status;

    // this.purchaseOrderForm.markAllAsTouched()
    if (Refresh) {
      this.purchaseOrderService
        .Refresh_Order(data)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (res: any) => {
            this.patchEditData(res);
            this.toastr.success('Refresh Successfully');
          },
          (err) => {
            console.log(err);
            this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
          }
        );
    } else {
      this.purchaseOrderService
        .Post_Order(data)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (res: any) => {
            this.patchEditData(res);
            if(print) {
              this.generatePdf()
            }
            else{ 
              this.toastr.success('Saved Successfully');
              this.navigate('/home/order-management/vendor?currentStepIndex=2');
            }
           
          },
          (err) => {
            console.log(err);
            this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
          }
        );
    }
  }

  async patchEditData(editData: any, calculate?: any) {
    if (editData) {
      editData.editTillDate = editData?.editTillDate?.slice(0, 10) ?? null;
      editData.expectedByDate = editData?.expectedByDate?.slice(0, 10) ?? null;
      editData.requiredByDate = editData?.requiredByDate?.slice(0, 10) ?? null;
      editData.date = editData?.date?.slice(0, 10) ?? null;

      const productPackages = this.purchaseOrderForm.get(
        'productPackages'
      ) as UntypedFormArray;
      productPackages.clear();
      editData.media_url_ids = [];
      editData?.media_urls?.forEach((res) => {
        editData.media_url_ids.push(res?.id);
      });
      editData?.productPackages.forEach((element) => {
        const productPackage = this.orderFormsService.productPackageForm();
        productPackage.patchValue(element);
        if (element.productId) {
          productPackage
            .get('productDetails')
            .get('description')
            .disable({ onlySelf: true, emitEvent: false });
        }
        productPackages.push(productPackage);
      });
      this.purchaseOrderForm.patchValue(editData);
      if (
        editData?.isQuickCheckout ||
        editData?.status == 'CONFIRMED' ||
        editData?.status == 'REJECTED'
      ) {
        this.purchaseOrderForm.disable({ onlySelf: true, emitEvent: false });
        this.purchaseOrderForm.updateValueAndValidity({
          onlySelf: true,
          emitEvent: false,
        });
        this.cdRef.detectChanges(); // ensure view updates before disabling
      }
      this.purchaseOrderForm.markAsUntouched();
      if (calculate) {
        this.calculateValues();
      }
    }
  }

  navigate(link: any) {
    if (this.purchaseOrderForm.touched) {
      this.dialog
        .open(ConfirmDialogComponent, {
          width: '25%',
        })
        .afterClosed()
        .subscribe(async (res) => {
          if (res) {
            this.router.navigateByUrl(link);
          }
        });
    } else {
      this.router.navigateByUrl(link);
    }
  }

  getPreference() {
    this.apiService.getPreferredUoms().subscribe((preference: any) => {
      this.preferredUoms = preference;
      const preferenceForPurchaseorder = this.preferredUoms.find(
        (item) => item.componentType == 'ORDER'
      );
      preferenceForPurchaseorder?.componentUoms?.forEach((ele) => {
        const componentUomForm = this.formsService.createComponentUomForm();
        this.componentUoms.push(componentUomForm);
      });
      this.preferForm.patchValue(preferenceForPurchaseorder);
    });
  }

  convertPoToInvoice() {
    this.invoiceManagementService
      .convertPoToInvoice(this.route.snapshot.params.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.toastr.success('Converted Successfully');
          this.navigate('/home/order-management/vendor/bill/edit/' + res.id);
        },
        (err) => {
          console.log(err);
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
        }
      );
  }


  get buyingType() {
    return this.purchaseOrderForm.get('buyingType');
  }
  get vendorId() {
    return this.purchaseOrderForm.get('requestTo').get('id');
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

  generatePdf() {
    if (!this.purchaseOrderForm.getRawValue().id) {
      this.savePo('DRAFT', false, true);
      return;
    }
    const uomQuery = this.getUomQuery();
    this.orderManagementService
      .generatePdf(
        this.purchaseOrderForm.getRawValue().id,
        this.vendorId.value,
        this.buyingType.value,
        uomQuery
      )
      .subscribe(
        (response) => {
          const blob = new Blob([response.body!], { type: 'application/pdf' });
          const contentDisposition = response.headers.get(
            'Content-Disposition'
          );
          const filenameMatch = contentDisposition.split('=');
          const filename = filenameMatch[1];
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename ?? 'purchase_order.pdf';
          link.click();
          URL.revokeObjectURL(link.href);
        },
        (err) => {
          this.toastr.error(err?.error.userMessage ?? 'Some error Occured');
        }
      );
  }

  get componentUoms() {
    return this.preferForm.get('componentUoms') as UntypedFormArray;
  }
}
