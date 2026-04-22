import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { BidiModule } from '@angular/cdk/bidi';

@Component({
    selector: 'customizeGuideline-dialog',
    templateUrl: './customizeGuideline-dialog.component.html',
    styleUrls: ['./customizeGuideline-dialog.component.scss'],
    standalone: true,
    imports: [
        BidiModule,
        MatDialogModule,
        MatButtonModule,
    ],
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
