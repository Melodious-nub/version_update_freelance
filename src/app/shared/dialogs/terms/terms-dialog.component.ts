import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
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
  constructor(
    public dialogRef: MatDialogRef<TermsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}


  agree(): void {
    this.dialogRef.close(true);
  }
  cancel(): void {
    this.dialogRef.close(false);
  }
}
