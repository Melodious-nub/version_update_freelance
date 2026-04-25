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
import { MatDialog } from '@angular/material/dialog';
import { InvoiceFormsService } from '../invoice-forms.service';
import { InvoiceManagementService } from '../invoice-management.service';
import { Subject, takeUntil } from 'rxjs';
import { CreateInvoiceComponent } from './create-invoice/create-invoice.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { MatTooltip } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-invoice-steps',
    templateUrl: './invoice-steps.component.html',
    styleUrls: ['./invoice-steps.component.scss'],
    imports: [
        DadyinButtonComponent,
        MatTooltip,
        CdkDrag,
        FormsModule,
        ReactiveFormsModule,
        MatTabGroup,
        MatTab,
        CreateInvoiceComponent,
        DatePipe
    ]
})
export class InvoiceStepsComponent implements OnInit {
  // ************* Variable Declarations *************
  currentStepIndex = 0;
  invoiceForm: UntypedFormGroup;
  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formsService.createPreferUomForm();
  uomSetting = false;
  ngUnsubscribe: any = new Subject<void>();

  constructor(
    public uomService: UomService,
    public invoiceManagementService: InvoiceManagementService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    public toastr: ToastrService,
    public router: Router,
    public apiService: ApiService,
    public invoiceFormsService: InvoiceFormsService,
    public formsService: FormsService,
    public businessAccountService: BusinessAccountService,
    public dialog: MatDialog
  ) {
    this.invoiceForm = this.invoiceFormsService.createInvoiceForm();
  }

  mainTab: Array<any> = [
    {
      id: 1,
      name: 'Invoice',
      index: 0,
    },
  ];

  async ngOnInit() {
    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.invoiceForm.get('requestFrom').get('id').patchValue(res?.id);
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
      this.invoiceManagementService
        .getInvoiceById(this.route.snapshot.params.id, uomQuery)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          async (res: any) => {
            this.patchEditData(res);
          },
          (err) => {
            if (err?.status === 404) {
              this.toastr.warning('Transaction Not Found');
              this.navigate(
                '/home/order-management/customer?currentStepIndex=3'
              );
            } else {
              this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
            }
          }
        );
    } else {
      const productPackages = this.invoiceForm.get(
        'productPackages'
      ) as UntypedFormArray;
      productPackages.push(
        this.invoiceFormsService.createProductPackageGroup()
      );
    }
    this.getPreference();

    this.invoiceForm.get('status').valueChanges.subscribe((res) => {
      if (res == 'CONFIRMED' || res == 'REJECTED') {
        this.invoiceForm.disable({ onlySelf: true, emitEvent: false });
      }
    });

    this.businessAccountService.Get_All_CustomersList();
  }

  get requestFromName() {
    const id = this.invoiceForm.get('requestFrom').value.id;
    const item = this.businessAccountService.customerList.find(
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
          this.deleteInvoice();
        }
      });
  }

  async deleteInvoice() {
    try {
      const id: any = this.route.snapshot.params.id;
      const data = await this.invoiceManagementService
        .deleteInvoice(id)
        .toPromise();
      this.toastr.success('Successfully Deleted');
      this.navigate('/home/order-management/customer?currentStepIndex=3');
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  async calculateValues() {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
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
      let data: any = this.invoiceForm.getRawValue();
      data.isReceiving = false;
      if (data.noteTemplate.id == null) {
        data.noteTemplate = null;
      }
      const res: any =
        await this.invoiceManagementService.calculateInvoiceValues(
          data,
          uomQuery
        );
      this.patchEditData(res);
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  saveInvoice(isDraft: any) {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();
      this.toastr.error('Please fill all the required fields');
      return;
    }
    if (this.invoiceForm.invalid) {
      this.toastr.error('Form Invalid');
      this.invoiceForm.markAllAsTouched();
      return;
    }
    let data: any = this.invoiceForm.getRawValue();
    if (data.noteTemplate.id == null) {
      data.noteTemplate = null;
    }
    data.isReceiving = false;
    data.requestTo.id = this.businessAccountService.currentBusinessAccountId;
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
    this.invoiceForm.markAllAsTouched();
    this.invoiceManagementService
      .saveInvoice(data, uomQuery)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.patchEditData(res);
          this.toastr.success('Saved Successfully');
          this.navigate('/home/order-management/customer?currentStepIndex=3');
        },
        (err) => {
          console.log(err);
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
        }
      );
  }

  async patchEditData(editData: any, calculate?: any) {
    console.log(editData, 'edittt');
    if (editData) {
      editData.editTillDate = editData?.editTillDate?.slice(0, 10) ?? null;
      editData.expectedByDate = editData?.expectedByDate?.slice(0, 10) ?? null;
      editData.requiredByDate = editData?.requiredByDate?.slice(0, 10) ?? null;
      editData.date = editData?.date?.slice(0, 10) ?? null;
      const productPackages = this.invoiceForm.get(
        'productPackages'
      ) as UntypedFormArray;
      productPackages.clear();
      editData.media_url_ids = [];
      editData?.media_urls?.forEach((res) => {
        editData.media_url_ids.push(res?.id);
      });
      editData?.productPackages.forEach((element) => {
        const productPackage =
          this.invoiceFormsService.createProductPackageGroup();
        productPackage.patchValue(element);
        if (element.productId) {
          productPackage.get('productDetails').get('description').disable();
        }
        productPackages.push(productPackage);
      });
      this.invoiceForm.patchValue(editData);
      if (editData?.isQuickCheckout) {
        this.invoiceForm.disable();
      }

      this.invoiceForm.markAsUntouched();
      if (calculate) {
        this.calculateValues();
      }
    }
  }

  navigate(link: any) {
    if (this.invoiceForm.touched) {
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
}
