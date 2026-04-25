import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, Inject, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'delete-dialog',
    templateUrl: './delete-dialog.component.html',
    styleUrls: ['./delete-dialog.component.scss'],
    standalone: true,
    imports: [
        MatDialogTitle,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class DeleteDialogComponent {
  public dialogRef = inject<MatDialogRef<DeleteDialogComponent>>(MatDialogRef);
  public data = inject(MAT_DIALOG_DATA);

  constructor() {}

  cancel(): void {
    this.dialogRef.close();
  }
}
