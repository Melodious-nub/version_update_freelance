import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'terms-dialog',
  templateUrl: './terms-dialog.component.html',
  styleUrls: ['./terms-dialog.component.scss'],
})
export class TermsDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<TermsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
  }


  agree(): void {
    this.dialogRef.close(true);
  }
  cancel(): void {
    this.dialogRef.close(false);
  }
}
