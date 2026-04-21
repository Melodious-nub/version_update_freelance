import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'add-new-attributes',
  templateUrl: './add-new-attributes-dialog.component.html',
  styleUrls: ['./add-new-attributes-dialog.component.scss'],
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
