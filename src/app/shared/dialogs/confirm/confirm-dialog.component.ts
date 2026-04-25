import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';


@Component({
    selector: 'confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
    imports: [
        MatDialogTitle,
        MatDialogActions,
        MatButton,
        MatDialogClose
    ]
})
export class ConfirmDialogComponent {
  dialogRef = inject<MatDialogRef<ConfirmDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  okayButtonText='Yes'
  constructor() {
    this.okayButtonText=this.data?.okayButtonText ?? 'Yes'
  }

  cancel(): void {
    this.dialogRef.close();
  }




}
