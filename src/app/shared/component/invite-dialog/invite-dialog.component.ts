import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { Invite } from 'src/app/model/common/invite';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { AuthService } from 'src/app/service/auth.service';

import { TokenService } from 'src/app/service/token.service';
import { DadyinSelectComponent } from '../../widgets/dadyin-select/dadyin-select.component';

import { NgSelectModule } from '@ng-select/ng-select';
import { DadyinInputComponent } from '../../widgets/dadyin-input/dadyin-input.component';
import { DadyinButtonComponent } from '../../widgets/dadyin-button/dadyin-button.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-invite-dialog',
    templateUrl: './invite-dialog.component.html',
    styleUrls: ['./invite-dialog.component.scss'],
    standalone: true,
    imports: [
    MatIconModule,
    DadyinButtonComponent,
    MatTooltipModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    DadyinInputComponent,
    NgSelectModule,
    DadyinSelectComponent
],
})
export class InviteDialogComponent implements OnInit, OnDestroy {
  public submitted = false;
  public disableSubmitBtn = false;
  public inviteFriend: boolean = false;
  // public inviteeGroup: FormGroup;
  public inviteDetailGroup: UntypedFormGroup;
  private invite: Invite;
  public userDetail = { name: null, role: null, branchName: null };
  public businessCategories: any = [];
  public businessType: any = [];
  public catalogs: any = [];
  public refData: any;
  public radioOptions: any = [
    {
      label: 'Yes',
      value: 'Y',
    },
    {
      label: 'No',
      value: 'N',
    },
  ];

  public selectedInviteType = '';
  public selectedBusinessType = '';
  public selectedCatalog = '';
  public countries: any[] = [];
  public states: any[] = [];
  public industryTypes: { label: string; value: string }[] = [];

  constructor(
    public dialogRef: MatDialogRef<InviteDialogComponent>,
    private fb: UntypedFormBuilder,
    private tokenService: TokenService,
    private authService: AuthService,
    private toastr: ToastrService,
    private businessService: BusinessAccountService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.refData = data || {};
  }

  ngOnInit(): void {
    this.initInviteDetailForm();
    // this.initInviteeDetailForm();
    this.inviteDetailGroup.get('shareCatelog').setValue('N');
    this.loadBusnessCategories();
    if (this.data?.inviteFriend == true) {
      this.inviteFriend = true;
      return;
    }
    this.loadCountry();
    if (this.data?.invite) {
      this.patchFormFromInvite(this.data.invite);
    }
    if (this.data?.isSent) {
      this.inviteDetailGroup.disable();
    }
  }

  private patchFormFromInvite(row: any): void {
    const primaryContact = row?.primaryContact || row;
    const email = primaryContact?.email ?? row?.email;
    const phoneGrp = primaryContact?.phone || row?.phone || {};
    const address = primaryContact?.address || row?.address || {};
    this.inviteDetailGroup.patchValue({
      inviteTo: row?.name ?? row?.invitedTo ?? row?.businessName ?? '',
      email: email ?? '',
      businessType: row?.businessType ?? '',
      industryType: row?.industryType ?? row?.industryTypes?.[0] ?? row?.productCategories?.[0] ?? '',
      inviteType: row?.inviteType ?? 'BUSINESSOWNER',
      country: row?.country ?? address?.addressCountry ?? null,
      state: row?.state ?? address?.addressState ?? null,
      businessAddress: address?.addressLine ?? row?.businessAddress ?? '',
      zipCode: address?.addressZipCode ?? row?.zipCode ?? '',
      phone: {
        countryId: phoneGrp?.countryId ?? null,
        countryCode: phoneGrp?.countryCode ?? null,
        number: phoneGrp?.number ?? row?.phoneNumber ?? '',
        extension: phoneGrp?.extension ?? [],
      },
    });
    this.selectedInviteType = row?.inviteType ?? 'BUSINESSOWNER';
    this.selectedBusinessType = row?.businessType ?? '';
    const countryId = row?.country ?? address?.addressCountry ?? phoneGrp?.countryId;
    if (countryId) {
      this.businessService.getState(countryId).subscribe((s) => (this.states = s || []));
    }
  }

  loadBusnessCategories() {
    this.businessService.getBusinessCategories().subscribe((data) => {
      (data || []).forEach((element) => {
        if (element == 'LOGISTIC' || element == 'BUSINESSOWNER') {
          this.businessCategories.push({ label: element, value: element });
        }
        this.industryTypes.push({ label: element, value: element });
      });
    });

    this.businessService.getBusinessTypes().subscribe((data) => {
      data.forEach((element) => {
        this.businessType.push({
          label: element,
          value: element,
        });
      });
    });

    this.catalogs.push({
      label: 'Catelog 1',
      value: 'Catelog 1',
    });
    this.catalogs.push({
      label: 'Catelog 2',
      value: 'Catelog 2',
    });
  }

  initInviteDetailForm(): void {
    this.inviteDetailGroup = this.fb.group({
      inviteType: [null, Validators.required],
      businessType: [null],
      industryType: [null],
      shareCatelog: [null, Validators.required],
      catelog: [null],
      message: [null],
      inviteTo: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      phone: this.fb.group({
        countryId: [null],
        countryCode: [null],
        number: [null],
        extension: [],
      }),
      country: [null],
      state: [null],
      businessAddress: [null],
      zipCode: [null],
    });
  }

  // convenience getter for easy access to form fields
  // get invitee() { return this.inviteeGroup.controls; }
  get inviteDetail() {
    return this.inviteDetailGroup.controls;
  }

  ngOnDestroy() { }

  onInviteTypeChange() {
    if (this.inviteDetailGroup.get('inviteType').value == 'BUSINESSOWNER') {
      this.inviteDetailGroup
        .get('businessType')
        .setValidators([null, Validators.required]);
      this.inviteDetailGroup.get('shareCatelog').setValue('N');
    } else {
      this.inviteDetailGroup.get('shareCatelog').setValue('N');
      this.inviteDetailGroup.get('businessType').clearValidators();
    }
    this.inviteDetailGroup.get('shareCatelog').updateValueAndValidity();

    this.inviteDetailGroup.get('businessType').updateValueAndValidity();
  }

  onShareCatelogChange(event) {
    this.inviteDetailGroup.get('shareCatelog').setValue(event);

    if (this.inviteDetailGroup.get('shareCatelog').value === 'Y') {
      this.inviteDetailGroup.addControl(
        'catelog',
        this.fb.control(null, Validators.required)
      );
    } else {
      this.inviteDetailGroup.get('catelog').clearValidators();
    }
    this.inviteDetailGroup.get('catelog').updateValueAndValidity();
  }

  onSubmit() {
    this.submitted = true;
    this.inviteDetailGroup.get('inviteType').setValue(this.selectedInviteType);
    if (this.inviteDetailGroup.invalid) {
      return;
    }
    this.invite = this.inviteDetailGroup.value;

    this.invite.email = this.inviteDetailGroup.get('email').value;
    this.invite.phone = this.inviteDetailGroup.get('phone').value;
    this.invite.invitedTo = this.inviteDetailGroup.get('inviteTo').value;
    this.invite.redirectType = 'HOME';
    this.invite.redirectReferenceId = this.refData.redirectReferenceId ?? null;

    this.invite.invitedByBusinessAccountId =
      this.tokenService.getBusinessAccountIdToken();
    this.authService.sendInvite(this.invite).subscribe((respone) => {
      if (respone.status === 'SENT') {
        this.disableSubmitBtn = true;
        this.toastr.success('Invite sent to ' + this.invite.email);
        this.dialogRef.close();
      } else if (respone.message === 'USER_ALREADY_EXIST') {
        this.toastr.info('User already exist on DADYIN platform');
      }
    }, (err) => {
      this.disableSubmitBtn = false;
      this.toastr.error('Invite not sent.');
    });
  }

  onCancelCLicked() {
    this.dialogRef.close();
  }

  customSearchFn(term: string, item: any) {
    if (term.toLowerCase().includes('us')) {
      term = 'United states';
    }
    term = term.toLowerCase();
    return item.name.toLowerCase().indexOf(term) > -1;
  }

  loadCountry() {
    this.businessService.getCountry().subscribe((data) => {
      this.countries = data || [];
    });
  }

  onCountryChange(): void {
    const id = this.inviteDetailGroup.get('country')?.value;
    this.inviteDetailGroup.get('state')?.setValue(null);
    this.states = [];
    if (id) {
      this.businessService.getState(id).subscribe((s) => (this.states = s || []));
    }
  }
}
