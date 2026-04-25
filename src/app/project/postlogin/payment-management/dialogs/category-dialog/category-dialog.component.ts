import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { DialogData } from '../payment-option-dialog/payment-option-dialog.component';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-category-dialog',
    templateUrl: './category-dialog.component.html',
    styleUrls: ['./category-dialog.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, NgClass, ExtendedModule, DadyinButtonComponent]
})
export class CategoryDialogComponent implements OnInit {
  private apiService = inject(ApiService);
  toastr = inject(ToastrService);
  dialogRef = inject<MatDialogRef<CategoryDialogComponent>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);



  categoryForm = new UntypedFormGroup({
    category : new UntypedFormControl('',Validators.required)
  });
  
  formError = false;

  ngOnInit(): void {
    if(this.data && this.data.Id && this.data.Id > 0){
      this.categoryForm.patchValue({category: this.data.name});
    }
  }

  AddCategory(){
    if(this.categoryForm.valid){

    let data = {
      "id": this.data && this.data.Id && this.data.Id > 0 ? this.data.Id : 0,
      'name': this.categoryForm.get('category').value
    }
    this.apiService.saveCategory(data).subscribe((res)=>{
      this.toastr.success("Category saved successfully");
      this.onCancel();
    });
  }
  }

  onSave(){
    this.AddCategory();
  }
  onCancel(){
    this.dialogRef.close();
  }
}
