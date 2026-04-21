import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss'],
})
export class PaymentDialogComponent {
  paymentAmount: number;
  vendorName: string;

  constructor(
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
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
