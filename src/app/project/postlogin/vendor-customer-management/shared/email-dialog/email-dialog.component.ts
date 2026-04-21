import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VendorFormsService } from '../../service/vendor-forms.service';
import { VendorCustomerService } from '../../service/vendor-customer.service';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-email-dialog',
  templateUrl: './email-dialog.component.html',
  styleUrls: ['./email-dialog.component.scss'],
})
export class EmailDialogComponent implements OnInit {
  emailForm = this.vendorFormService.emailForm();
  attachments: any[] = [];
  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public vendorFormService: VendorFormsService,
    public vendorCustomerService: VendorCustomerService,
    public toastr: ToastrService,
    public apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.initiateNote();
  }

  initiateNote() {
    this.emailForm.reset();
    if (this.data?.emailData) {
      this.emailForm.patchValue(this.data?.emailData);
      this.emailForm
        .get('emailRecipients')
        ?.setValue(this.data?.emailData?.emailRecipients?.join(','));
    }
  }

 

  close() {
    this.dialog.getDialogById('email-dialog').close();
  }

  attachmentSelected(event) {
    Array.from(event.target.files).forEach((element) => {
      this.attachments.push(element);
    });
  }

  removeAttachment(i) {
   this.attachments.splice(i,1)
  }

  async sendEmail(draft?:any) {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    try {
      let emailData = this.emailForm.value;
      if(!Array.isArray(emailData.emailRecipients)){
        emailData.emailRecipients = emailData.emailRecipients?.split(',');
      }
    
      const formData = new FormData();

      // Append form values to FormData
      for (const key in emailData) {
        if (emailData.hasOwnProperty(key)) {
          // Append each form value to the FormData
          formData.append(key, emailData[key]);
        }
      }

      for (let index = 0; index < this.attachments.length; index++) {
        const element = this.attachments[index];
        formData.append('attachments', element);
      }
      if(this.attachments.length==0) {
        formData.delete('attachments');
      }
      const resp = await this.vendorCustomerService
        .sendEmail(this.data.id, formData,draft)
        .toPromise();
      if (resp?.isSent) {
        this.dialog.getDialogById('email-dialog').close();
        this.toastr.success('Email sent successfully');
      } 
      else if (resp?.isDraftSaved) {
        this.dialog.getDialogById('email-dialog').close();
        this.toastr.success('Email saved in Draft successfully');
      }
      else {
        this.toastr.error(resp?.errorMessage);
      }
    } catch (err: any) {
      console.log(err)
      this.toastr.error(err?.error?.errorMessage ?? 'Some Error Occurred');
    }
  }




}
