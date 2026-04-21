import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';

@Component({
  selector: 'customizeGuideline-dialog',
  templateUrl: './customizeGuideline-dialog.component.html',
  styleUrls: ['./customizeGuideline-dialog.component.scss'],
})
export class CustomizeGuidelineDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<CustomizeGuidelineDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
