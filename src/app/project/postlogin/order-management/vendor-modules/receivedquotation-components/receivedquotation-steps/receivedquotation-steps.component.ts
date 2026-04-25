import { Component, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/service/api.service';
import { CommonService } from 'src/app/service/common.service';
import { UomService } from 'src/app/service/uom.service';
import { OrderFormsService } from '../../../service/order-forms.service';
import { OrderManagementService } from '../../../service/order-management.service';
import { FormsService } from 'src/app/service/forms.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ViewQuotationComponent } from './view-quotation/view-quotation.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatTooltip } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-quotation-steps',
    templateUrl: './receivedquotation-steps.component.html',
    styleUrls: ['./receivedquotation-steps.component.scss'],
    imports: [
        DadyinButtonComponent,
        MatTooltip,
        FormsModule,
        ReactiveFormsModule,
        MatTabGroup,
        MatTab,
        ViewQuotationComponent,
        DatePipe
    ]
})
export class ReceivedQuotationStepsComponent implements OnInit {
  // ************* Variable Declarations *************
  uomSetting = false;
  currentStepIndex = 0;
  recvQuotationForm: UntypedFormGroup;
  public preferredUoms: any[];
  private ngUnsubscribe: Subject<void> = new Subject();
  public preferForm: UntypedFormGroup = this.formsService.createPreferUomForm();

  constructor(
    public uomService: UomService,
    public ordermanagementService: OrderManagementService,
    public commonService: CommonService,
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    public toastr: ToastrService,
    public router: Router,
    public apiService: ApiService,
    public orderFormsService: OrderFormsService,
    public formsService: FormsService,
    public dialog: MatDialog
  ) {
    this.recvQuotationForm = this.orderFormsService.createQuotationForm();
  }

  mainTab: Array<any> = [
    {
      id: 1,
      name: 'Received Quotation',
      index: 0,
    },
  ];

  async ngOnInit() {
    if (this.route.snapshot.params.id) {
      this.ordermanagementService
        .getQuotationById(this.route.snapshot.params.id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(async (res: any) => {
          this.patchEditData(res);
        });
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

  async patchEditData(editData: any) {
    if (editData) {
      editData.editTillDate = editData?.editTillDate?.slice(0, 10) ?? null;
      editData.expectedByDate = editData?.expectedByDate?.slice(0, 10) ?? null;
      editData.requiredByDate = editData?.requiredByDate?.slice(0, 10) ?? null;
      editData.date = editData?.date?.slice(0, 10) ?? null;
      editData.media_url_ids = [];
      editData?.media_urls?.forEach((res) => {
        editData.media_url_ids.push(res?.id);
      });
      const productPackages = this.recvQuotationForm.get(
        'productPackages'
      ) as UntypedFormArray;
      productPackages.clear();

      editData?.productPackages.forEach((element) => {
        const productPackage = this.orderFormsService.productPackageRfqForm();
        productPackage.patchValue(element);
        productPackages.push(productPackage);
      });
      this.recvQuotationForm.patchValue(editData);

      this.recvQuotationForm.disable({ onlySelf: true, emitEvent: false });
    }
  }

  rejectQuotation() {
    let data = this.recvQuotationForm.getRawValue();
    data.status = 'REJECTED';
    this.ordermanagementService
      .updateQuotation(data, null)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (res: any) => {
          this.toastr.success('Saved Successfully');
          this.navigate('/home/order-management/vendor?currentStepIndex=1');
        },
        (err) => {
          this.toastr.error(err?.error?.message ?? 'Some Error Occurred');
        }
      );
  }

  convertToPO() {
    this.router.navigateByUrl(
      '/home/order-management/vendor/purchaseorder/add' +
      '?quotationId=' + this.route.snapshot.params.id
    );
  }

  navigate(link: any) {
    this.router.navigateByUrl(link);
  }

  confirmDelete() {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '25%',
      })
      .afterClosed()
      .subscribe(async (res) => {
        if (res) {
          this.deleteRecvQuotation();
        }
      });
  }

  async deleteRecvQuotation() {
    try {
      const id: any = this.route.snapshot.params.id;
      const data = await this.ordermanagementService.deleteRecvQuotation(id).toPromise();
      this.toastr.success('Successfully Deleted');
      this.router.navigateByUrl(
        '/home/order-management/vendor?currentStepIndex=1'
      );
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }
}
