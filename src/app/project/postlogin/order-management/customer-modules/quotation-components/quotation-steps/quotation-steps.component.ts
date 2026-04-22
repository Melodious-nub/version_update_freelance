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
import { environment } from 'src/environments/environment';
import { CreateQuotationComponent } from './create-quotation/create-quotation.component';
import { MatTabsModule } from '@angular/material/tabs';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-quotation-steps',
    templateUrl: './quotation-steps.component.html',
    styleUrls: ['./quotation-steps.component.scss'],
    standalone: true,
    imports: [
        DadyinButtonComponent,
        NgIf,
        MatTooltipModule,
        CdkDrag,
        NgFor,
        FormsModule,
        ReactiveFormsModule,
        MatTabsModule,
        CreateQuotationComponent,
        DatePipe,
    ],
})
export class QuotationStepsComponent implements OnInit {
  // ************* Variable Declarations *************
  currentStepIndex = 1;
  quotationForm: UntypedFormGroup;
  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formsService.createPreferUomForm();
  private ngUnsubscribe: Subject<void> = new Subject();
  uomSetting = false;

  constructor(
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
    public containerService: ContainerManagementService,
    public service: ApiService
  ) {
    this.quotationForm = this.orderFormsService.createQuotationForm();
  }

  async ngOnInit() {
    this.businessAccountService.Get_All_Notes();
    this.containerService.Get_All_IncoTerms();
    this.containerService.Get_All_ports();
    this.containerService.Get_All_paymentTerms();
    this.getPreference();
    if (this.route.snapshot.queryParams.rfqId) {
      this.ordermanagementService
        .getRfqById(this.route.snapshot.queryParams.rfqId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(async (rfq: any) => {
          this.quotationForm
            .get('referenceOrder')
            .get('rfQuotationId')
            .patchValue(rfq?.id);
          this.quotationForm.get('requestFrom').patchValue(rfq?.requestTo);
          this.quotationForm.get('requestTo').patchValue(rfq?.requestFrom);
          delete rfq.id;
          delete rfq.status;
          delete rfq.transactionId;
          delete rfq.requestTo;
          delete rfq.requestFrom;
          rfq.productPackages.forEach((product) => {
            product.id = null;
          });
          this.patchEditData(rfq, true);
        });
    } else if (this.route.snapshot.params.id) {
      this.ordermanagementService
        .getQuotationById(this.route.snapshot.params.id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(
          async (res: any) => {
            this.patchEditData(res);

          },
          (err) => {
            if (err?.status === 404) {
              this.toastr.warning('Transaction Not Found');
              this.navigate(
                '/home/order-management/customer?currentStepIndex=1'
              );
            } else {
              this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
            }
          }
        );
    } else {
      const productPackages = this.quotationForm.get(
        'productPackages'
      ) as UntypedFormArray;
      productPackages.push(this.orderFormsService.productPackageRfqForm());
    }
  }

  async getCustomerDetails() {
    try {
      let relationAccount = this.businessAccountService.lcpList.filter(
        (data) => data.relationAccountId == this.customerId.value
      );
      const data = await this.apiService
        .Get_Single_customer(relationAccount[0]?.id)
        .toPromise();
        this.quotationForm.get('buyingCapacityType').setValue(data?.buyingType ? data?.buyingType : 'SKU' );
        this.quotationForm.get('buyingType').setValue(data?.buyingType ? data?.buyingType : 'SKU');
        this.quotationForm.get('discountPercentage').setValue(data?.discountPercentage ? data?.discountPercentage : 0);
        this.quotationForm.get('buyingCapacityDefault').setValue(data?.buyingType ? data?.buyingType : 'SKU');
        this.quotationForm.get('discountPercentageDefault').setValue(data?.discountPercentage ? data?.discountPercentage : 0);
    }
    catch (error) {
      console.log(error);
    }
  }



  saveQuotation(status: any, print = false, isQCStylePDF = false) {
    if (this.quotationForm.invalid) {
      this.quotationForm.markAllAsTouched();
      this.toastr.error('Please fill all the required fields');
      return;
    }
    let data: any = this.quotationForm.getRawValue();
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
      .updateQuotation(data, uomQuery)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.patchEditData(res);
          this.toastr.success('Saved Successfully');
          if (print) {
            this.generatePdf(isQCStylePDF);
          } else {
            this.navigate('/home/order-management/customer?currentStepIndex=1');
          }
        },
        (err) => {
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
        }
      );
  }

  get buyingType() {
    return this.quotationForm.get('buyingType');
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

  generatePdf(isQCStylePDF: boolean = false) {
    if (!this.quotationForm.getRawValue().id) {
      this.saveQuotation('DRAFT', true, isQCStylePDF);
      return;
    }
    const uomQuery = this.getUomQuery();
    this.ordermanagementService
      .generateQuotationPdf(
        this.quotationForm.getRawValue().id,
        this.customerId.value,
        this.buyingType.value,
        isQCStylePDF,
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

  async patchEditData(editData: any, calculate = false) {
    try {
      if (editData) {
        editData.editTillDate = editData?.editTillDate?.slice(0, 10) ?? null;
        editData.expectedByDate =
          editData?.expectedByDate?.slice(0, 10) ?? null;
        editData.requiredByDate =
          editData?.requiredByDate?.slice(0, 10) ?? null;
        editData.date = editData?.date?.slice(0, 10) ?? null;
        const productPackages = this.quotationForm.get(
          'productPackages'
        ) as UntypedFormArray;
        productPackages.clear();
        editData.media_url_ids = [];
        editData?.media_urls?.forEach((res) => {
          editData.media_url_ids.push(res?.id);
        });
        editData?.productPackages.forEach((element) => {
          const productPackage = this.orderFormsService.productPackageRfqForm();
          productPackage.patchValue(element);
          productPackages.push(productPackage);
        });
        this.quotationForm.patchValue(editData);

        if (calculate) {
          this.getCustomerDetails();
          this.calculateQuotationValues();
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  navigate(link: any) {
    this.router.navigateByUrl(link);
  }

  gotToReceivedQuote() {
    this.router.navigateByUrl(
      '/home/order-management/customer/receivedRfq/view/' +
      this.route.snapshot.params.id
    );
  }

  async calculateQuotationValues() {
    if (this.quotationForm.invalid) {
      this.quotationForm.markAllAsTouched();
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
      const data: any = this.quotationForm.getRawValue();
      data.isReceiving = false;
      if (data.noteTemplate.id == null) {
        data.noteTemplate = null;
      }
      const res: any =
        await this.ordermanagementService.Calculate_Quotation_Values(
          data,
          uomQuery
        );

      this.patchEditData(res);
    } catch (err: any) {
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  onChangeTab(event: any) {
    if (event.index == 0) {
      this.gotToReceivedQuote();
    }
  }

  get referenceOrder() {
    return this.quotationForm.get('referenceOrder');
  }

  get quotationToName() {
    const id = this.quotationForm.get('requestTo').value.id;
    const item = this.businessAccountService.lcpList.find(
      (vendor) => vendor.relationAccountId == Number(id)
    );
    return item?.relationAccountName ?? '';
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

  async shareQuotation() {
    const navigator = window.navigator as any;
    const urlToShare = `${environment.uiURL}#/home/order-management/vendor/receivedquotation/view/${this.quotationForm?.value.id}`;

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

  get businessLine() {
    const item = this.businessAccountService.lcpList.find(
      (item) => item.relationAccountId == Number(this.customerId.value)
    );

    return item ? item?.businessLine : '';
  }

  get category() {
    const item = this.businessAccountService.lcpList.find(
      (item) => item.relationAccountId == Number(this.customerId.value)
    );
    // item?.productCategoryIdList is a comma separated string like "#55,#56"
    if (item?.productCategoryIdList) {
      const categoryIds = item.productCategoryIdList
        .replace(/#/g, '')
        .split(',')
        .map((id: string) => id.trim())
        .filter((id: string) => id);

      // Assuming you have a list of all categories with id and name
      // For example: this.businessAccountService.categoryList = [{id: 55, name: 'Category A'}, ...]
      const categoryNames = categoryIds
        .map((id: string) => {
          const category = this.apiService.productCategoriesList?.find(
            (cat: any) => String(cat.id) === id
          );
          return category ? category.name : null;
        })
        .filter((name: string | null) => !!name);


      return categoryNames.join(', ');
    }
    return '';
  }

  get customerId() {
    return this.quotationForm.get('requestTo').get('id');
  }
}
