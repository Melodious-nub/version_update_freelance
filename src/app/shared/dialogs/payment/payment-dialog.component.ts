import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DadyinButtonComponent } from '../../widgets/dadyin-button/dadyin-button.component';
import { MatIconButton } from '@angular/material/button';

@Component({
    selector: 'app-payment-dialog',
    templateUrl: './payment-dialog.component.html',
    styleUrls: ['./payment-dialog.component.scss'],
    imports: [
        MatDialogTitle,
        MatIconButton,
        DadyinButtonComponent,
        DecimalPipe,
    ]
})
export class PaymentDialogComponent {
  dialogRef = inject<MatDialogRef<PaymentDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  paymentAmount: number;
  vendorName: string;

  constructor() {
    const data = this.data;

    this.paymentAmount = data?.paymentAmount || 0;
    this.vendorName = data?.vendorName || '';
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  continue(): void {
    this.dialogRef.close(true);
  }
}
