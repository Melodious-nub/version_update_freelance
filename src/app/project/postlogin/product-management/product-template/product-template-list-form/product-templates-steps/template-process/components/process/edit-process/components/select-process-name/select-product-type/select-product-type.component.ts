import { Component, Inject } from '@angular/core';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { ApiService } from 'src/app/service/api.service';
import { MatButton } from '@angular/material/button';



@Component({
    selector: 'app-select-product-type',
    templateUrl: './select-product-type.component.html',
    styleUrls: ['./select-product-type.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, MatButton, MatDialogClose]
})
export class SelectProductTypeComponent {

  subProductType=new UntypedFormControl()

  constructor(public dialogRef: MatDialogRef<SelectProductTypeComponent>,public apiService:ApiService, @Inject(MAT_DIALOG_DATA) public data: any) {
   this.subProductType.setValue(this.data.control.value)
   }


   onClose() {
     this.dialogRef.close(this.subProductType.value)
   }


}
