import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, FormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ViewRfqComponent } from './view-rfq/view-rfq.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { MatTooltip } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-rfq-steps',
    templateUrl: './receivedRfq-steps.component.html',
    styleUrls: ['./receivedRfq-steps.component.scss'],
    imports: [
        DadyinButtonComponent,
        MatTooltip,
        CdkDrag,
        FormsModule,
        ReactiveFormsModule,
        MatTabGroup,
        MatTab,
        ViewRfqComponent,
        DatePipe
    ]
})
export class ReceivedRfqStepsComponent implements OnInit {
  // ************* Variable Declarations *************
  currentStepIndex = 0;
  rfqForm: UntypedFormGroup;
  isSelfRfq = true;
  currentBusinessAccount: any;
  private ngUnsubscribe: Subject<void> = new Subject();
  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formsService.createPreferUomForm();
  uomSetting = false;

  constructor(
    public uomService: UomService,
    public ordermanagementService: OrderManagementService,
    public commonService: CommonService,
    private route: ActivatedRoute,
    public toastr: ToastrService,
    public router: Router,
    public apiService: ApiService,
    public orderFormService: OrderFormsService,
    public formsService: FormsService,
    public businessAccountService: BusinessAccountService,
    public containerService: ContainerManagementService
  ) {
    this.rfqForm = this.orderFormService.createRfqForm();
  }

  async ngOnInit() {
    this.businessAccountService.Get_All_Notes();
    this.businessAccountService.Get_All_CustomersList();
    this.containerService.Get_All_IncoTerms();
    this.containerService.Get_All_ports();
    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      this.currentBusinessAccount = res;
      this.rfqForm
        .get('requestTo')
        .get('id')
        .patchValue(this.currentBusinessAccount?.id);
    });
    if (this.route.snapshot.params.id) {
      this.ordermanagementService
        .getRfqById(this.route.snapshot.params.id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(async (res: any) => {
          this.patchEditData(res);
        });
    } else {
      const productPackages = this.rfqForm.get('productPackages') as UntypedFormArray;
      productPackages.push(this.orderFormService.productPackageForm());
    }
  }

  rejectRfq() {
    let data: any = this.rfqForm.getRawValue();
    data.status = 'REJECTED';
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
        },
        (err) => {
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
        }
      );
  }

  confirmRfq() {
    let data: any = this.rfqForm.getRawValue();
    data.status = 'CONFIRMED';
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
        },
        (err) => {
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
        }
      );
  }

  async patchEditData(editData: any) {
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
        const productPackages = this.rfqForm.get(
          'productPackages'
        ) as UntypedFormArray;
        productPackages.clear();
        editData?.productPackages.forEach((element) => {
          const productPackage = this.orderFormService.productPackageRfqForm();
          productPackage.patchValue(element);
          productPackages.push(productPackage);
        });
        this.rfqForm.patchValue(editData);

        if (this.route.snapshot.params.id) {
          const loggedInAccountId =
            this.businessAccountService.currentBusinessAccountId;

          if (
            this.rfqForm.getRawValue()?.audit?.businessAccountId !=
            loggedInAccountId
          ) {
            this.isSelfRfq = false;
            this.rfqForm.disable();
          } else {
            this.isSelfRfq = true;
          }
        }
      }
    } catch (err) {
      this.toastr.error(err);
    }
  }

  navigate(link: any) {
    this.router.navigateByUrl(link);
  }

  get isEdit() {
    return this.route.snapshot.params.id ? true : false;
  }

  async calculateValues(event: any) {
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
      this.patchEditData(res);
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  convertToQuote() {
    this.router.navigateByUrl(
      '/home/order-management/customer/quotation/add' +
        '?rfqId=' +
        this.route.snapshot.params.id
    );
  }

  goToQuotation() {
    this.router.navigateByUrl(
      '/home/order-management/customer/quotation/edit/' +
        this.route.snapshot.params.id
    );
  }

  onChangeTab(event: any) {
    if (event.index == 1) {
      this.goToQuotation();
    }
  }

  get referenceOrder() {
    return this.rfqForm.get('referenceOrder');
  }
  get rfqToName() {
    return this.rfqForm.get('requestFrom').get('name')?.value;
  }

  saveRfq(status: any, print = false, isQCStylePDF = false) {
    if (this.rfqForm.invalid) {
      this.rfqForm.markAllAsTouched();
      this.toastr.error('Please fill all the required fields');
      return;
    }
    let data: any = this.rfqForm.getRawValue();
    data.isReceiving = false;
    if (data.noteTemplate.id == null) {
      data.noteTemplate = null;
    }
    data.status = status;
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
          this.navigate('/home/order-management/customer?currentStepIndex=0');
        },
        (err) => {
          console.log(err);
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
        }
      );
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

  get buyingType() {
    return this.rfqForm.get('buyingType');
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
    if (!this.rfqForm.getRawValue().id) {
      this.saveRfq('DRAFT', true, false);
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
