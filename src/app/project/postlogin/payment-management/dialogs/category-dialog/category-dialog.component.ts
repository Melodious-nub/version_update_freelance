import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { DialogData } from '../payment-option-dialog/payment-option-dialog.component';

@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.component.html',
  styleUrls: ['./category-dialog.component.scss']
})
export class CategoryDialogComponent implements OnInit {


  categoryForm = new UntypedFormGroup({
    category : new UntypedFormControl('',Validators.required)
  });
  
  formError = false;
  constructor(private apiService: ApiService,public toastr:ToastrService,public dialogRef: MatDialogRef<CategoryDialogComponent>,@Inject(MAT_DIALOG_DATA) public data:DialogData ) { }

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
