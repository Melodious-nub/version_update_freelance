import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Dir } from '@angular/cdk/bidi';

@Component({
    selector: 'terms-dialog',
    templateUrl: './terms-dialog.component.html',
    styleUrls: ['./terms-dialog.component.scss'],
    imports: [
        Dir,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ]
})
export class TermsDialogComponent {
  dialogRef = inject<MatDialogRef<TermsDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);



  agree(): void {
    this.dialogRef.close(true);
  }
  cancel(): void {
    this.dialogRef.close(false);
  }
}
