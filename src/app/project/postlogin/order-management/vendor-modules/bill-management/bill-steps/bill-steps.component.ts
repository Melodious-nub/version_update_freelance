import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { CommonService } from 'src/app/service/common.service';
import { UomService } from 'src/app/service/uom.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { FormsService } from 'src/app/service/forms.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
import { PaymentDialogComponent } from 'src/app/shared/dialogs/payment/payment-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { BillFormsService } from '../bill-forms.service';
import { BillManagementService } from '../bill-management.service';
import { Subject, takeUntil } from 'rxjs';
import { CreateBillComponent } from './create-bill/create-bill.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { MatTooltip } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-bill-steps',
    templateUrl: './bill-steps.component.html',
    styleUrls: ['./bill-steps.component.scss'],
    imports: [
        DadyinButtonComponent,
        MatTooltip,
        CdkDrag,
        FormsModule,
        ReactiveFormsModule,
        MatTabGroup,
        MatTab,
        CreateBillComponent,
        DatePipe
    ]
})
export class BillStepsComponent implements OnInit {
  // ************* Variable Declarations *************
  currentStepIndex = 0;
  billForm: UntypedFormGroup;
  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formsService.createPreferUomForm();
  uomSetting = false;
  ngUnsubscribe: any = new Subject<void>();

  constructor(
    public uomService: UomService,
    public billManagementService: BillManagementService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    public toastr: ToastrService,
    public router: Router,
    public apiService: ApiService,
    public billFormsService: BillFormsService,
    public formsService: FormsService,
    public businessAccountService: BusinessAccountService,
    public dialog: MatDialog
  ) {
    this.billForm = this.billFormsService.createBillForm();
  }

  mainTab: Array<any> = [
    {
      id: 1,
      name: 'Bill',
      index: 0,
    },
  ];

  async ngOnInit() {
    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.billForm.get('requestFrom').get('id').patchValue(res?.id);
    });
    if (this.route.snapshot.params.id) {
      let uomQuery = ``;
      this.componentUoms.controls.forEach((element) => {
        element.get('columnMappings').value.forEach((col) => {
          uomQuery =
            uomQuery +
            `&uomMap[${col}]=${element.get('userConversionUom').value}`;
        });
      });
      uomQuery = encodeURI(uomQuery);
      this.billManagementService
        .getBillById(this.route.snapshot.params.id, uomQuery)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          async (res: any) => {
            this.patchEditData(res);
          },
          (err) => {
            if (err?.status === 404) {
              this.toastr.warning('Transaction Not Found');
              this.navigate('/home/order-management/vendor?currentStepIndex=3');
            } else {
              this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
            }
          }
        );
    } else {
      const productPackages = this.billForm.get('productPackages') as UntypedFormArray;
      productPackages.push(this.billFormsService.createProductPackageGroup());
    }
    this.getPreference();

    this.billForm.get('status').valueChanges.subscribe((res) => {
      if (res == 'CONFIRMED' || res == 'REJECTED') {
        this.billForm.disable({ onlySelf: true, emitEvent: false });
      }
    });
  }

  get requestToName() {
    const id = this.billForm.get('requestTo').value.id;
    const item = this.businessAccountService.vendorList.find(
      (vendor) => vendor.relationAccountId == Number(id)
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
          this.deleteBill();
        }
      });
  }

  async deleteBill() {
    try {
      const id: any = this.route.snapshot.params.id;
      const data = await this.billManagementService.deleteBill(id).toPromise();
      this.toastr.success('Successfully Deleted');
      this.navigate('/home/order-management/vendor?currentStepIndex=3');
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  async calculateValues() {
    if (this.billForm.invalid) {
      this.billForm.markAllAsTouched();
      this.toastr.error('Please fill all the required fields');
      return;
    }
    try {
      let uomQuery = ``;
      this.componentUoms.controls.forEach((element) => {
        element.get('columnMappings').value.forEach((col) => {
          uomQuery =
            uomQuery +
            `&uomMap[${col}]=${element.get('userConversionUom').value}`;
        });
      });
      uomQuery = encodeURI(uomQuery);
      let data: any = this.billForm.getRawValue();
      data.isReceiving = false;
      if (data.noteTemplate.id == null) {
        data.noteTemplate = null;
      }
      const res: any = await this.billManagementService.calculateBillValues(
        data,
        uomQuery
      );
      this.patchEditData(res);
    } catch (err: any) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  saveBill(isDraft: any) {
    if (this.billForm.invalid) {
      this.billForm.markAllAsTouched();
      this.toastr.error('Please fill all the required fields');
      return;
    }
    let data: any = this.billForm.getRawValue();
    data.isReceiving = false;
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    if (data?.referenceContainerId == 'NEW') {
      data.referenceContainerId = null;
      data.isCreateNewContainer = true;
    }
    if (isDraft) {
      data.status = 'DRAFT';
    } else {
      data.status = 'CONFIRMED';
    }
    this.billForm.markAllAsTouched();
    this.billManagementService
      .saveBill(data, uomQuery)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.patchEditData(res);
          this.toastr.success('Saved Successfully');
          this.navigate('/home/order-management/vendor?currentStepIndex=3');
        },
        (err) => {
          console.log(err);
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
        }
      );
  }

  async patchEditData(editData: any, calculate?: any) {
    if (editData) {
      editData.editTillDate = editData?.editTillDate?.slice(0, 10) ?? null;
      editData.expectedByDate = editData?.expectedByDate?.slice(0, 10) ?? null;
      editData.requiredByDate = editData?.requiredByDate?.slice(0, 10) ?? null;
      editData.date = editData?.date?.slice(0, 10) ?? null;
      editData.media_url_ids = [];
      editData?.media_urls?.forEach((res) => {
        editData.media_url_ids.push(res?.id);
      });
      const productPackages = this.billForm.get('productPackages') as UntypedFormArray;
      productPackages.clear();

      editData?.productPackages.forEach((element) => {
        const productPackage =
          this.billFormsService.createProductPackageGroup();
        productPackage.patchValue(element);
        if (element.productId) {
          productPackage.get('productDetails').get('description').disable();
        }
        productPackages.push(productPackage);
      });
      this.billForm.patchValue(editData);
      if (editData?.isQuickCheckout) {
        this.billForm.disable();
      }

      this.billForm.markAsUntouched();
      if (calculate) {
        this.calculateValues();
      }
    }
  }

  navigate(link: any) {
    if (this.billForm.touched) {
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


  

  get componentUoms() {
    return this.preferForm.get('componentUoms') as UntypedFormArray;
  }

  openPaymentDialog() {
    const paymentData = {
      paymentAmount: this.billForm.get('totalCost')?.value?.attributeValue || 0,
      vendorName: this.requestToName
    };

    this.dialog
      .open(PaymentDialogComponent, {
        width: '400px',
        data: paymentData
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.processPayment();
        }
      });
  }

  processPayment() {
    // Add your payment processing logic here
    console.log('Processing payment for amount:', this.billForm.get('totalCost')?.value?.attributeValue);
    // You can redirect to payment gateway or handle payment processing
    this.toastr.success('Redirecting to payment gateway...');
  }
}
