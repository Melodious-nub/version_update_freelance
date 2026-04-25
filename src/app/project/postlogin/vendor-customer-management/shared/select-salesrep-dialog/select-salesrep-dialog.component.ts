import { Component, OnInit, inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { BusinessAccountService } from '../../../business-account/business-account.service';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
    selector: 'app-select-salesrep-dialog',
    templateUrl: './select-salesrep-dialog.component.html',
    styleUrls: ['./select-salesrep-dialog.component.scss'],
    imports: [
        NgSelectModule,
        FormsModule,
        DadyinButtonComponent,
    ]
})
export class selectSalesRepDialogComponent implements OnInit {
  dialog = inject(MatDialog);
  data = inject(MAT_DIALOG_DATA);
  businessAccountService = inject(BusinessAccountService);
  toastr = inject(ToastrService);

  salesRepId = null;

  ngOnInit(): void {
    this.businessAccountService.Get_All_employees();
  }

  close() {
    this.dialog.getDialogById('selectSalesRepDialog').close();
  }

  async upload() {
    this.dialog.getDialogById('selectSalesRepDialog').close(this.salesRepId);
  }



}
