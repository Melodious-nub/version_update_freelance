import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/service/api.service';
import { CommonService } from 'src/app/service/common.service';
import { UomService } from 'src/app/service/uom.service';
import { OrderFormsService } from '../../../service/order-forms.service';
import { OrderManagementService } from '../../../service/order-management.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { ContainerManagementService } from 'src/app/project/postlogin/container-management/service/container-management.service';
import { FormsService } from 'src/app/service/forms.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-rfq-steps',
  templateUrl: './rfq-steps.component.html',
  styleUrls: ['./rfq-steps.component.scss'],
})
export class RfqStepsComponent implements OnInit {
  // ************* Variable Declarations *************
  currentStepIndex = 0;
  rfqForm: UntypedFormGroup;

  currentBusinessAccount: any;
  private ngUnsubscribe: Subject<void> = new Subject();
  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formsService.createPreferUomForm();
  uomSetting = false;

  constructor(
    public dialog: MatDialog,
    public uomService: UomService,
    public ordermanagementService: OrderManagementService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    public toastr: ToastrService,
    public router: Router,
    public apiService: ApiService,
    public orderFormsService: OrderFormsService,
    public formsService: FormsService,
    public businessAccountService: BusinessAccountService,
    public containerService: ContainerManagementService
  ) {
    this.rfqForm = this.orderFormsService.createRfqForm();
  }

  async ngOnInit() {
    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.rfqForm.get('requestFrom').get('id').patchValue(res?.id);
    });
    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.currentBusinessAccount = res;
      this.rfqForm
        .get('requestFrom')
        .get('id')
        .patchValue(this.currentBusinessAccount?.id);
    });
    this.getPreference();

    if (this.route.snapshot.params.id) {
      this.ordermanagementService
        .getRfqById(this.route.snapshot.params.id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          async (res: any) => {
            this.patchEditData(res, true);
          },
          (err) => {
            if (err?.status === 404) {
              this.toastr.warning('Transaction Not Found');
              this.router.navigateByUrl(
                '/home/order-management/customer?currentStepIndex=0'
              );
            } else {
              this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
            }
          }
        );
    } else {
      const productPackages = this.rfqForm.get('productPackages') as UntypedFormArray;
      productPackages.push(this.orderFormsService.productPackageRfqForm());
    }

    this.rfqForm.get('status').valueChanges.subscribe((res) => {
      if (res == 'CONFIRMED' || res == 'REJECTED') {
        this.rfqForm.disable({ onlySelf: true, emitEvent: false });
      }
    });
  }

  confirmDelete() {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.deleteRfq();
        }
      });
  }

  async deleteRfq() {
    try {
      const id: any = this.route.snapshot.params.id;
      const data = await this.ordermanagementService.deleteRfq(id).toPromise();
      this.toastr.success('Successfully Deleted');
      this.router.navigateByUrl(
        '/home/order-management/vendor?currentStepIndex=1'
      );
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  async calculateValues() {
    if (this.rfqForm.invalid) {
      this.rfqForm.markAllAsTouched();
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
      let data: any = this.rfqForm.getRawValue();
      data.isReceiving = false;
      if (data.noteTemplate.id == null) {
        data.noteTemplate = null;
      }
      const res: any = await this.ordermanagementService.Calculate_Rfq_Values(
        data,
        uomQuery
      );
      this.patchEditData(res, false);
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  saveRfq(status: any) {
    if (this.rfqForm.invalid) {
      this.rfqForm.markAllAsTouched();
      this.toastr.error('Please fill all the required fields');
      return;
    }
    let data: any = this.rfqForm.getRawValue();
    data.isReceiving = false;
    data.status = status;
    if (data.noteTemplate.id == null) {
      data.noteTemplate = null;
    }
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    this.ordermanagementService
      .updateRfq(data, uomQuery)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.patchEditData(res, false);
          this.toastr.success('Saved Successfully');
          this.router.navigateByUrl(
            '/home/order-management/vendor?currentStepIndex=0'
          );
        },
        (err) => {
          console.log(err);
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
        }
      );
  }

  patchEditData(editData: any, calculate = false) {
    if (editData) {
      editData.editTillDate = editData?.editTillDate?.slice(0, 10) ?? null;
      editData.expectedByDate = editData?.expectedByDate?.slice(0, 10) ?? null;
      editData.requiredByDate = editData?.requiredByDate?.slice(0, 10) ?? null;
      editData.date = editData?.date?.slice(0, 10) ?? null;
      const productPackages = this.rfqForm.get('productPackages') as UntypedFormArray;
      productPackages.clear();
      editData?.productPackages.forEach((element) => {
        const productPackage = this.orderFormsService.productPackageRfqForm();
        productPackage.patchValue(element);
        if (element.productId) {
          productPackage.get('productDetails').get('description').disable();
        }
        productPackage?.get('productDetails').get('skuPackageType').disable();
        productPackages.push(productPackage);
      });
      editData.media_url_ids = [];
      editData?.media_urls?.forEach((res) => {
        editData.media_url_ids.push(res?.id);
      });
      this.rfqForm.patchValue(editData);
      if (calculate) {
        this.calculateValues();
      }
    }
  }
  navigate(link: any) {
    if (this.rfqForm.touched) {
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
  get requestToName() {
    const id = this.rfqForm.get('requestTo').value.id;
    const item = this.businessAccountService.vendorList.find(
      (vendor) => vendor.relationAccountId == Number(id)
    );
    return item?.relationAccountName ?? '';
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

  get buyingType() {
    return this.rfqForm.get('buyingType');
  }

  saveRFQ(status: any, print = false, isQCStylePDF = false) {
    if (this.rfqForm.invalid) {
      this.rfqForm.markAllAsTouched();
      this.toastr.error('Please fill all the required fields');
      return;
    }
    let data: any = this.rfqForm.getRawValue();
    data.isReceiving = false;
    data.status = status;
    if (data.noteTemplate.id == null) {
      data.noteTemplate = null;
    }
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    this.ordermanagementService
      .updateRfq(data, uomQuery)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.patchEditData(res);
          this.toastr.success('Saved Successfully');
          if (print) {
            this.generatePdf();
          } else {
            this.navigate('/home/order-management/vendor?currentStepIndex=0');
          }
        },
        (err) => {
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
        }
      );
  }

  generatePdf() {
    if (!this.rfqForm.getRawValue().id) {
      this.saveRFQ('DRAFT', true, false);
      return;
    }
    const uomQuery = this.getUomQuery();
    this.ordermanagementService
      .generateRFQPdf(
        this.rfqForm.getRawValue().id,
        this.buyingType.value,
        false,
        uomQuery
      )
      .subscribe(
        (response: any) => {
          const blob = new Blob([response.body!], { type: 'application/pdf' });
          const contentDisposition = response.headers.get(
            'Content-Disposition'
          );
          const filenameMatch = contentDisposition.split('=');
          const filename = filenameMatch[1];
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename ?? 'quotation.pdf';
          link.click();
          URL.revokeObjectURL(link.href);
        },
        (err) => {
          this.toastr.error(err?.error.userMessage ?? 'Some error Occured');
        }
      );
  }
}
