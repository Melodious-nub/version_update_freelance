import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';


@Component({
    selector: 'confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
    standalone: true,
    imports: [
    MatDialogTitle,
    MatDialogActions,
    MatButton,
    MatDialogClose
],
})
export class ConfirmDialogComponent {
  okayButtonText='Yes'
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.okayButtonText=this.data?.okayButtonText ?? 'Yes'
  }

  cancel(): void {
    this.dialogRef.close();
  }




}
