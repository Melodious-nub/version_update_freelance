import { Component, Inject, OnInit, Optional } from '@angular/core';
import {
  MatDialogConfig,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Dialog } from '../../interfaces';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss'],
})
export class AlertDialogComponent implements OnInit {
  public dialogData: Dialog.AlertDialogData = {
    heading: 'Alert',
    content: 'Something is happening',
    showCancel: true,
    cancelBtnName: 'Cancel',
    actionBtnName: 'Ok',
  };

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: MatDialogConfig,
    private dialogRef: MatDialogRef<AlertDialogComponent>
  ) {}

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
