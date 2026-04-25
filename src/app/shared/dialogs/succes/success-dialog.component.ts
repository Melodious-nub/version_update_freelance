import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'success-dialog',
    templateUrl: './success-dialog.component.html',
    styleUrls: ['./success-dialog.component.scss'],
    standalone: true,
    imports: [
        MatDialogTitle,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class SuccessDialogComponent {
  public dialogRef = inject<MatDialogRef<SuccessDialogComponent>>(MatDialogRef);
  public data = inject(MAT_DIALOG_DATA);

  cancel(): void {
    this.dialogRef.close();
  }
}
