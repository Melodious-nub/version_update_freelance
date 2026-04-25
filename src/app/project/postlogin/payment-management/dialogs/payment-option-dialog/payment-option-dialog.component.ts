import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogClose } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { FormsModule } from '@angular/forms';


export interface DialogData {
  Id: number;
  name: string;
}

@Component({
    selector: 'app-payment-option-dialog',
    templateUrl: './payment-option-dialog.component.html',
    styleUrls: ['./payment-option-dialog.component.scss'],
    imports: [FormsModule, DadyinButtonComponent, MatDialogClose]
})
export class PaymentOptionDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<PaymentOptionDialogComponent>>(MatDialogRef);
  data = inject<DialogData>(MAT_DIALOG_DATA);
  apiService = inject(ApiService);
  toastr = inject(ToastrService);


  phoneNumber;
  userName;
  email;

  bankName;
  routingNo;
  accountNo;
  address;

  ngOnInit(): void {
    if(this.data && this.data.Id && this.data.Id > 0){
      this.findById();
    }
  }

  findById(){
    if(this.data.name == 'Paypal'){
      this.getPayPalById();
    }else if( this.data.name == 'Venmo'){
      this.getVenmoById();
    }else {
      this.getBankById();
    }
  }

  getBankById() {
    this.apiService.getBankByID(this.data.Id).subscribe((response:any)=>{
      this.data.Id = response.id;
       this.bankName = response.name;
      this.routingNo = response.routingNumber;
      this.accountNo = response.accountNumber;
      this.address = response.address;
    });
  }

  getVenmoById() {
    this.apiService.getVenmoByID(this.data.Id).subscribe((response:any)=>{
      this.data.Id = response.id;
       this.phoneNumber = response.phoneNumber;
      this.userName = response.userName;
      this.email = response.email;
    });
  }

  getPayPalById() {
    this.apiService.getPayPalByID(this.data.Id).subscribe((response:any)=>{
      this.data.Id = response.id;
       this.phoneNumber = response.phoneNumber;
      this.userName = response.userName;
      this.email = response.email;
    });
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(){
    if(this.data.name == 'Paypal'){
      this.savePayPal();
    }else if( this.data.name == 'Venmo'){
      this.saveVenmo();
    }else {
      this.saveBankAccount();
    }
  }

  savePayPal(){
    let data ={
      id:this.data.Id,
      phoneNumber:this.phoneNumber ,
      userName:this.userName ,
      email:this.email 
    }
    this.apiService.savePaypal(data).subscribe((response: any) => {
      this.toastr.success("Paypal saved successfully");
    });
  }
  saveVenmo(){
    let data ={
      id:this.data.Id,
      phoneNumber:this.phoneNumber ,
      userName:this.userName ,
      email:this.email 
    }
    this.apiService.saveVenmo(data).subscribe((response: any) => {
      this.toastr.success("Venmo saved successfully");
    });
  }
  saveBankAccount(){
    let data = {
      id:this.data.Id,
      "name": this.bankName,
      "routingNumber":this.routingNo,
      "accountNumber":this.accountNo,
      "address":this.address
  }
  this.apiService.saveBank(data).subscribe((response: any) => {
    this.toastr.success("Bank account saved successfully");
  });
  }
}
