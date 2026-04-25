import { Component, OnInit, inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderFormsService } from '../../../../service/order-forms.service';
import { OrderManagementService } from '../../../../service/order-management.service';
import { first } from 'rxjs';
import { payment } from 'src/app/shared/constant';
import { UomService } from 'src/app/service/uom.service';
import { DadyinButtonComponent } from '../../../../../../../shared/widgets/dadyin-button/dadyin-button.component';


@Component({
    selector: 'app-record-payment-dialog',
    templateUrl: './record-payment-dialog.component.html',
    styleUrls: ['./record-payment-dialog.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        DadyinButtonComponent
    ]
})
export class RecordPaymentDialogComponent implements OnInit {
  dialog = inject(MatDialog);
  data = inject(MAT_DIALOG_DATA);
  toastr = inject(ToastrService);
  orderFormsService = inject(OrderFormsService);
  orderManagementService = inject(OrderManagementService);
  uomService = inject(UomService);

  paymentRecordForm: UntypedFormGroup;
  paymentOverview: any;
  constructor() {
    this.paymentRecordForm = this.orderFormsService.createPaymentForm();
  }

  ngOnInit(): void {
    this.getPaymentOverview(this.data.orderId);
  }

  getPaymentOverview(orderId) {
    this.orderManagementService
      .Get_PaymentOverview(orderId)
      .pipe(first())
      .subscribe(
        (paymentOverview: any) => {
          this.paymentOverview = paymentOverview;
        },
        (err) => {
          this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
        }
      );
  }

  async addManualEntry() {
    try {
      if (this.paymentRecordForm?.invalid) {
        this.paymentRecordForm.markAllAsTouched();
        return;
      }
      const orderId = this.data.orderId;
      const data = this.paymentRecordForm.getRawValue();
      const resp = await this.orderManagementService
        .recordManualPayment(data, orderId)
        .toPromise();
      this.paymentRecordForm.reset();
      this.getPaymentOverview(this.data.orderId);
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

  close() {
    this.dialog.closeAll();
  }
}
