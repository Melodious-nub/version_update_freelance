import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Dir } from '@angular/cdk/bidi';

@Component({
    selector: 'customizeGuideline-dialog',
    templateUrl: './customizeGuideline-dialog.component.html',
    styleUrls: ['./customizeGuideline-dialog.component.scss'],
    imports: [
        Dir,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ]
})
export class CustomizeGuidelineDialogComponent {
  dialogRef = inject<MatDialogRef<CustomizeGuidelineDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);


  cancel(): void {
    this.dialogRef.close();
  }
}
