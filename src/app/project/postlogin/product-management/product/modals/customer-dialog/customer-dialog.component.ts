import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { DadyinSearchableSelectComponent } from '../../../../../../shared/widgets/dadyin-searchable-select/dadyin-searchable-select.component';

@Component({
    selector: 'app-customer-dialog',
    templateUrl: './customer-dialog.component.html',
    styleUrls: ['./customer-dialog.component.scss'],
    imports: [
        MatDialogClose,
        DadyinSearchableSelectComponent,
        DadyinButtonComponent,
    ]
})
export class CustomerDialogComponent implements OnInit {
  data = inject<MatDialogConfig>(MAT_DIALOG_DATA, { optional: true });
  private dialogRef = inject<MatDialogRef<CustomerDialogComponent>>(MatDialogRef);
  businessAccountService = inject(BusinessAccountService);
  fb = inject(UntypedFormBuilder);

 
  selectForm = this.fb.group({
    customerId:[]
  })

  ngOnInit(): void {
  this.businessAccountService.Get_All_CustomersList()
  }

  onActionClick(hasAction: boolean = false) {
    this.dialogRef.close(this.selectForm.value.customerId);
  }


}
