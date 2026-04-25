
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
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
export class AccountDetailsComponent {

  @Input() isCustomer: any;
  @Input() vendorForm: any;

    public toastr = inject(ToastrService);
  public customerService = inject(ApiService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  public vendorFormsService = inject(VendorFormsService);
  constructor() {}



}
