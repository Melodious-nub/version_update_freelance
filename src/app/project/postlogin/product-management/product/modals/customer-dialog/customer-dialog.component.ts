import { Component, Inject, OnInit, Optional } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import {
  MatDialogConfig,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';

@Component({
  selector: 'app-customer-dialog',
  templateUrl: './customer-dialog.component.html',
  styleUrls: ['./customer-dialog.component.scss'],
})
export class CustomerDialogComponent implements OnInit {
 
  selectForm = this.fb.group({
    customerId:[]
  })
  

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: MatDialogConfig,
    private dialogRef: MatDialogRef<CustomerDialogComponent>,
    public businessAccountService:BusinessAccountService,
    public fb:UntypedFormBuilder
  ) {}

  ngOnInit(): void {
  this.businessAccountService.Get_All_CustomersList()
  }

  onActionClick(hasAction: boolean = false) {
    this.dialogRef.close(this.selectForm.value.customerId);
  }


}
