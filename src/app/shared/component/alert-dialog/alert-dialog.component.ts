import { Component, OnInit, inject } from '@angular/core';
import { MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Dialog } from '../../interfaces';
import { MatButton } from '@angular/material/button';


@Component({
    selector: 'app-alert-dialog',
    templateUrl: './alert-dialog.component.html',
    styleUrls: ['./alert-dialog.component.scss'],
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatButton,
        MatDialogClose
    ]
})
export class AlertDialogComponent implements OnInit {
  data = inject<MatDialogConfig>(MAT_DIALOG_DATA, { optional: true });
  private dialogRef = inject<MatDialogRef<AlertDialogComponent>>(MatDialogRef);

  public dialogData: Dialog.AlertDialogData = {
    heading: 'Alert',
    content: 'Something is happening',
    showCancel: true,
    cancelBtnName: 'Cancel',
    actionBtnName: 'Ok',
  };

  ngOnInit(): void {
    this.dialogData = {
      ...this.dialogData,
      ...this.data,
    };
  }

  onActionClick(hasAction: boolean = false) {
    this.dialogRef.close(hasAction);
  }
}
