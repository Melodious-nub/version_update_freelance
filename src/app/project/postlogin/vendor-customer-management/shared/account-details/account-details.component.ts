
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm/confirm-dialog.component';
import { VendorFormsService } from '../../service/vendor-forms.service';
import { FlexModule } from '@ngbracket/ngx-layout/flex';
import { DadyinSelectComponent } from '../../../../../shared/widgets/dadyin-select/dadyin-select.component';
import { DadyinInputComponent } from '../../../../../shared/widgets/dadyin-input/dadyin-input.component';
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription } from '@angular/material/expansion';

@Component({
    selector: 'app-account-details',
    templateUrl: './account-details.component.html',
    styleUrls: ['./account-details.component.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelDescription, DadyinInputComponent, DadyinSelectComponent, FlexModule]
})
export class AccountDetailsComponent implements OnInit {

  @Input('isCustomer') isCustomer: any;
  @Input('vendorForm') vendorForm: any;

  constructor(
    public toastr: ToastrService,
    public customerService: ApiService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    public vendorFormsService: VendorFormsService
  ) {}

    ngOnInit(): void {
    }



}
