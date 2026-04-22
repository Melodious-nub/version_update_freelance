import { Component, OnInit, Inject } from '@angular/core';
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
    standalone: true,
    imports: [
        NgSelectModule,
        FormsModule,
        DadyinButtonComponent,
    ],
})
export class selectSalesRepDialogComponent implements OnInit {
  salesRepId = null;
  constructor(
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public businessAccountService: BusinessAccountService,
    public toastr: ToastrService
  ) {}

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
