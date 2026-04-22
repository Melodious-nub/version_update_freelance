import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from 'src/app/service/api.service';
import { MatButtonModule } from '@angular/material/button';
import { NgFor } from '@angular/common';


@Component({
    selector: 'app-select-product-type',
    templateUrl: './select-product-type.component.html',
    styleUrls: ['./select-product-type.component.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, NgFor, MatButtonModule, MatDialogModule]
})
export class SelectProductTypeComponent implements OnInit {

  subProductType=new UntypedFormControl()

  constructor(public dialogRef: MatDialogRef<SelectProductTypeComponent>,public apiService:ApiService, @Inject(MAT_DIALOG_DATA) public data: any) {
   this.subProductType.setValue(this.data.control.value)
   }

  ngOnInit(): void {
  }


   onClose() {
     this.dialogRef.close(this.subProductType.value)
   }


}
