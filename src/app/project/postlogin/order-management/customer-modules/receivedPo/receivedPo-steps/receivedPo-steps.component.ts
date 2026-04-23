import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/service/api.service';
import { CommonService } from 'src/app/service/common.service';
import { UomService } from 'src/app/service/uom.service';
import { OrderFormsService } from '../../../service/order-forms.service';
import { OrderManagementService } from '../../../service/order-management.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { FormsService } from 'src/app/service/forms.service';
import { RecordPaymentDialog } from '../shared/record-payment-dialog/record-payment-dialog.component';
import { environment } from 'src/environments/environment';
import { CreateOrderComponent } from './create-order/create-order.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { MatTooltip } from '@angular/material/tooltip';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-receivedPo-steps',
    templateUrl: './receivedPo-steps.component.html',
    styleUrls: ['./receivedPo-steps.component.scss'],
    standalone: true,
    imports: [
        DadyinButtonComponent,
        NgIf,
        MatSlideToggle,
        FormsModule,
        ReactiveFormsModule,
        NgFor,
        MatTooltip,
        CdkDrag,
        MatTabGroup,
        MatTab,
        CreateOrderComponent,
        DatePipe,
    ],
})
export class ReceivedPoStepsComponent implements OnInit {
  // ************* Variable Declarations *************
  currentStepIndex = 0;
  receivedPoForm: UntypedFormGroup;
  isSelfPO = true;
  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formsService.createPreferUomForm();
  private ngUnsubscribe: Subject<void> = new Subject();
  uomSetting = false;

  paymentStatusControl = new UntypedFormControl();

  constructor(
    public uomService: UomService,
    public ordermanagementService: OrderManagementService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    public toastr: ToastrService,
    public router: Router,
    public apiService: ApiService,
    public orderFormsService: OrderFormsService,
    private dialog: MatDialog,
    public formsService: FormsService,
    public businessAccountService: BusinessAccountService
  ) {
    this.receivedPoForm =
      this.orderFormsService.createReceivedPurchaseOrderForm();
    this.receivedPoForm.get('isReceiving').setValue(true);
    this.addConditionalValidation();
    if (
      this.receivedPoForm.get('status').value == 'CONFIRMED' ||
      this.receivedPoForm.get('status').value == 'REJECTED'
    ) {
      this.receivedPoForm.disable({ onlySelf: false, emitEvent: false });
    }
  }

  mainTab: Array<any> = [
    {
      id: 1,
      name: 'Received PO',
      index: 0,
    },
  ];

  get purchaseOrderFromName() {
    const id = this.receivedPoForm.get('requestFrom').value.id;
    const item = this.businessAccountService.customerList.find(
      (vendor) => vendor.relationAccountId == Number(id)
    );
    return item?.relationAccountName ?? '';
  }

  async ngOnInit() {
    this.businessAccountService.Get_All_CustomersList();
    if (this.route.snapshot.params.id) {
      const productIndex = this.route.snapshot.queryParams['productIndex'];
      if (productIndex || productIndex == 0) {
        if (
          !this.ordermanagementService.productIndexList.includes(productIndex)
        ) {
          this.ordermanagementService.productIndexList.push(productIndex);
        }
        this.ordermanagementService
          .getReceivedPOwithProductReplacementById(
            this.route.snapshot.params.id,
            this.ordermanagementService.productIndexList
          )
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(async (res: any) => {
            this.patchEditData(res);
          });
      } else {
        this.ordermanagementService
          .getReceivedPOById(this.route.snapshot.params.id)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(
            async (res: any) => {
              this.patchEditData(res);
            },
            (err) => {
              if (err?.status === 404) {
                this.toastr.warning('Transaction Not Found');
                this.navigate(
                  '/home/order-management/customer?currentStepIndex=2'
                );
              } else {
                this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
              }
            }
          );
      }
    } else {
      const productPackages = this.receivedPoForm.get(
        'productPackages'
      ) as UntypedFormArray;
      productPackages.push(this.orderFormsService.productPackageForm());
    }

    this.getPreference();

    this.paymentStatusControl.valueChanges.subscribe((res) => {
      this.receivedPoForm
        .get('paymentStatus')
        .patchValue(res, { onlySelf: true, emitEvent: false });
    });
  }

  addConditionalValidation() {
    this.receivedPoForm
      .get('fulfilmentType')
      .valueChanges.subscribe((value) => {
        const exporter = this.receivedPoForm.get('exporterBusinessId');
        if (value == 'CONTAINER') {
          exporter.setValidators([Validators.required]);
        } else {
          exporter.clearValidators();
        }
        exporter.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      });
  }

  ngOnDestroy() { }

  recordPayment() {
    this.dialog
      .open(RecordPaymentDialog, {
        width: '95%',
        data: {
          orderId: this.receivedPoForm.get('id').value,
        },
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
        }
      });
  }

  confirmRejection() {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.rejectPo();
        }
      });
  }

  confirmPo() {
    if (this.receivedPoForm.invalid) {
      this.toastr.error('Form Invalid');
      this.receivedPoForm.markAllAsTouched();
      return;
    }
    if (this.checkIfAnyProductDataIsNotSelfProduct()) {
      this.toastr.error(
        'Order contains Products which are not available to you'
      );
      return;
    }
    if (this.checkIfAnyProductDataIsNotCustomizedProduct()) {
      this.toastr.error(
        'Order contains Customized Product which needs to clone'
      );
      return;
    }
    let data: any = this.receivedPoForm.getRawValue();
    data.status = 'CONFIRMED';
    data.isReceiving = true;
    data.isReceivingSide = true;
    if (data.noteTemplate.id == null) {
      data.noteTemplate = null;
    }
    if (data?.referenceContainerId == 'NEW') {
      data.referenceContainerId = null;
      data.isCreateNewContainer = true;
    }
    let uomQuery = this.getUomQuery();
    this.ordermanagementService
      .updatePo(data, uomQuery)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.toastr.success('Updated Successfully');
          this.patchEditData(res);
        },
        (err) => {
          console.log(err);
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
        }
      );
  }

  savePo(status: any, refresh: any = false, print = false) {
    if (this.receivedPoForm.invalid) {
      this.toastr.error('Form Invalid');
      this.receivedPoForm.markAllAsTouched();
      return;
    }
    let data: any = this.receivedPoForm.getRawValue();
    data.requestTo.id = this.businessAccountService.currentBusinessAccountId;
    data.isReceiving = true;
    data.isReceivingSide = true;
    if (status != null) {
      data.status = status;
    }
    if (data?.referenceContainerId == 'NEW') {
      data.referenceContainerId = null;
      data.isCreateNewContainer = true;
    }
    if (data.noteTemplate.id == null) {
      data.noteTemplate = null;
    }
    let uomQuery = this.getUomQuery();
    if (refresh) {
      this.ordermanagementService
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
      this.ordermanagementService
        .updatePo(data, uomQuery)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          (res: any) => {
            this.patchEditData(res);           
            if (print) {
              this.generatePdf();
            }
            else {
              this.toastr.success('Saved Successfully');   
              this.navigate('/home/order-management/customer?currentStepIndex=2');
            }
          },
          (err) => {
            console.log(err);
            this.toastr.error(err?.error?.message ?? 'Error Occurred');
          }
        );
    }
  }

  rejectPo() {
    let data: any = this.receivedPoForm.getRawValue();
    data.status = 'REJECTED';
    data.isReceiving = true;
    data.isReceivingSide = true;
    if (data.noteTemplate.id == null) {
      data.noteTemplate = null;
    }
    let uomQuery = this.getUomQuery();
    this.ordermanagementService
      .updatePo(data, uomQuery)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.patchEditData(res);
          this.toastr.success('Updated Successfully');
        },
        (err) => {
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
        }
      );
  }

  async patchEditData(editData: any, calculate = false) {
    try {
      if (editData) {
        editData.editTillDate = editData?.editTillDate?.slice(0, 10) ?? null;
        editData.expectedByDate =
          editData?.expectedByDate?.slice(0, 10) ?? null;
        editData.requiredByDate =
          editData?.requiredByDate?.slice(0, 10) ?? null;
        editData.date = editData?.date?.slice(0, 10) ?? null;
        editData.media_url_ids = [];
        editData?.media_urls?.forEach((res) => {
          editData.media_url_ids.push(res?.id);
        });
        const productPackages = this.receivedPoForm.get(
          'productPackages'
        ) as UntypedFormArray;
        productPackages.clear();
        editData?.productPackages.forEach((productPackage) => {
          const productPackageForm =
            this.orderFormsService.productPackageForm();
          const packageCustomAttributeValues = productPackageForm.get(
            'packageCustomAttributeValues'
          ) as UntypedFormArray;
          productPackage?.packageCustomAttributeValues?.forEach(
            (packagecustom) => {
              const packageForm =
                this.formsService.createPackageAttributeForm();
              packageForm.patchValue(packagecustom);
              packageCustomAttributeValues.push(packageForm);
            }
          );
          productPackageForm.patchValue(productPackage);
          productPackages.push(productPackageForm);
        });
        this.receivedPoForm.patchValue(editData);
        this.paymentStatusControl.patchValue(editData?.paymentStatus, {
          emitEvent: false,
          onlySelf: true,
        });
        if (this.route.snapshot.params.id) {
          const loggedInAccountId =
            this.businessAccountService.currentBusinessAccountId;
          if (
            this.receivedPoForm.getRawValue()?.audit?.businessAccountId !=
            loggedInAccountId
          ) {
            this.isSelfPO = false;
          } else {
            this.isSelfPO = true;
          }
        }
        if (calculate) {
          this.calculateValues();
        }
      }
    } catch (err) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  checkIfAnyProductDataIsNotSelfProduct() {
    const productPackages = this.receivedPoForm.get(
      'productPackages'
    ) as UntypedFormArray;
    const loggedInAccountId =
      this.businessAccountService.currentBusinessAccountId;
    const ind = productPackages
      ?.getRawValue()
      .findIndex(
        (productPackage) =>
          productPackage.productDetails?.audit?.businessAccountId !=
          loggedInAccountId
      );
    return ind == -1 ? false : true;
  }

  get requestFromId() {
    return this.receivedPoForm.get('requestFrom').get('id');
  }

  checkIfAnyProductDataIsNotCustomizedProduct() {
    const productPackages = this.receivedPoForm.get(
      'productPackages'
    ) as UntypedFormArray;
    const ind = productPackages?.value.findIndex(
      (productPackage) =>
        productPackage?.isCustomized &&
        productPackage?.productDetails?.preferredCustomerId !=
        this.requestFromId?.value
    );
    return ind == -1 ? false : true;
  }

  get isCustomer() {
    if (window.location.href.includes('customer')) {
      return true;
    } else {
      return false;
    }
  }

  navigate(link: any) {
    this.router.navigateByUrl(link);
  }

  async calculateValues() {
    if (this.receivedPoForm.invalid) {
      this.receivedPoForm.markAllAsTouched();
      this.toastr.error('Please fill all the required fields');
      return;
    }
    try {
      let uomQuery = this.getUomQuery();
      const data: any = this.receivedPoForm.getRawValue();
      data.isReceiving = true;
      data.isReceivingSide = true;
      if (data.noteTemplate.id == null) {
        data.noteTemplate = null;
      }
      const res: any =
        await this.ordermanagementService.Calculate_Received_Purchase_Order_Values(
          data,
          uomQuery
        );
      this.patchEditData(res);
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }





  confirmDelete() {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.deleteReceivedPo();
        }
      });
  }

  async deleteReceivedPo() {
    try {
      const id: any = this.route.snapshot.params.id;
      const data = await this.ordermanagementService
        .deleteReceivedPo(id)
        .toPromise();
      this.toastr.success('Successfully Deleted');
      this.navigate('/home/order-management/customer?currentStepIndex=2');
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  async paymentToggle(event) {
    try {
      this.receivedPoForm.get('paymentEnabled').setValue(event.checked);
      const data = this.receivedPoForm.getRawValue();
      data.isReceiving = true;
      data.isReceivingSide = true;
      if (data.noteTemplate.id == null) {
        data.noteTemplate = null;
      }
      if (data?.referenceContainerId == 'NEW') {
        data.referenceContainerId = null;
        data.isCreateNewContainer = true;
      }
      let uomQuery = this.getUomQuery();
      const res = await this.ordermanagementService
        .updatePo(data, uomQuery)
        .toPromise();
      this.patchEditData(res);
      this.toastr.success('Successfully Updated');
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  async onUpdateStatus() {
    try {
      const data = this.receivedPoForm.getRawValue();
      data.isReceiving = true;
      data.isReceivingSide = true;
      if (data.noteTemplate.id == null) {
        data.noteTemplate = null;
      }
      if (data?.referenceContainerId == 'NEW') {
        data.referenceContainerId = null;
        data.isCreateNewContainer = true;
      }
      let uomQuery = this.getUomQuery();
      const res = await this.ordermanagementService
        .updatePo(data, uomQuery)
        .toPromise();
      this.patchEditData(res);
      this.toastr.success('Successfully Updated');
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
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

  async sharePo() {
    const navigator = window.navigator as any;
    const urlToShare = `${environment.uiURL
      }#/home/order-management/vendor/purchaseorder/edit/${this.receivedPoForm?.getRawValue().id
      }`;

    // Best-effort clipboard copy
    await navigator?.clipboard?.writeText(urlToShare).catch(() => {});

    if (navigator.share && (!navigator.canShare || navigator.canShare({ url: urlToShare }))) {
      navigator
        .share({
          title: 'Dadyin',
          text: urlToShare,
          url: urlToShare,
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
      alert('share not supported');
    }
  }

  get customerId() {
    return this.receivedPoForm.get('requestFrom').get('id');
  }
  get buyingType() {
    return this.receivedPoForm.get('buyingType');
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
    if (!this.receivedPoForm.getRawValue().id) {
      this.savePo('DRAFT',false,true);
      return;
    }
    const uomQuery = this.getUomQuery();
    this.ordermanagementService
      .generatePdf(
        this.receivedPoForm.getRawValue().id,
        this.businessAccountService.currentBusinessAccountId,
        this.buyingType.value,
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
          link.download = filename ?? 'rcvpurchase_order.pdf';
          link.click();
          URL.revokeObjectURL(link.href);
        },
        (err) => {
          this.toastr.error(err?.error.userMessage ?? 'Some error Occured');
        }
      );
  }



}
