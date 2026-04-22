import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'add-new-attributes',
    templateUrl: './add-new-attributes-dialog.component.html',
    styleUrls: ['./add-new-attributes-dialog.component.scss'],
    standalone: true,
    imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        NgFor,
        MatOptionModule,
        MatButtonModule,
    ],
})
export class AddNewAttributesDialogComponent {
  selectedValue: string;
  constructor(
    public dialogRef: MatDialogRef<AddNewAttributesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  selectProductType(event: MatSelectChange) {
    this.selectedValue = event?.value;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    this.dialogRef.close(this.selectedValue);
  }
}
