import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class BusinessRegistrationFormsService {

  constructor(public _fb: UntypedFormBuilder) { }

  createBusinessForm(): UntypedFormGroup {
    return this._fb.group({
      id: [],

      shopName: [],
      themePrimaryColor: ['#0065F4'],
      themeSecondaryColor: ['#dfeffb'],
      themePrimaryColorLight: ['#d5e7fa'],
      themeSecondaryColorLight: ['#f3f9fd'],
      domainStatus: [],
      aboutBusiness: [],
      domain: [],
      name: [null, Validators.required],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      language: [null],
      verifiedStatus: ['SELF'],
      businessLines: [null],
      gst: [null],
      fromInvite: [false],
      inviteId: [null],
      companyStamp: [false],
      code: [null],
      digitalStamp: [null],
      currentRate: [null],
      isSystemAccount: [null],
      currency: [null],
      currency2nd: [null],
      industryTypeIds: [null],
      industrySubTypeIds: [null],
      productTypeIds: [null],
      productCategoryIds: [null],
      taxId: [null],
      panCard: [null],
      einNumber: [null],
      ssnNumber: [null],
      itinNumber: [null],
      primaryContact: this._fb.group({
        id: [null],
        landline: this._fb.group({
          countryId: [null],
          countryCode: [null],
          number: [null],
          extension: [null]
        }),
        email: [null, Validators.required],
        phone: this._fb.group({
          countryId: [null],
          countryCode: [null],
          number: [null],
          extension: [null]
        }),
        fax: this._fb.group({
          countryId: [null],
          countryCode: [null],
          number: [null],
          extension: [null]
        }),
        address: this._fb.group({
          addressLine: [null],
          addressCountry: [null],
          addressState: [null],
          addressCity: [null],
          addressZipCode: [null],
        }),
        personalEmail: [null],
        personalPhone: this._fb.group({
          countryId: [null],
          countryCode: [null],
          number: [null],
          extension: [null]
        })
      }),
      businessSubscriptionUsageDetails: this._fb.group({
        id: null,
        promoCode: null,
        promoCodeUsed: null, // if used then send the promoCode else it is null
        allowedTeamSize: -1,
        quickCheckoutFees: 7.0, // for first time signup it will be 0
        allowedTransactionsByMonth: 12, // for first time sign up it will be 0
        containerManagementByYear: 2,// for first time sign up it will be 0
        salesUser: -1,
        allowCRM: -1,
        productSupport: '0M',
        allowedNoOfBranches: 0, // for first time sign up it will be 0
        subscriptionStart: null,
        subscriptionEnd: null,
        subscriptionType: null,
        isSubscriptionPaid: false,
        businessSubscriptionId: 1
      }),
      businessLogo: [],
      branchDetails: this._fb.array([]),
      employees: this._fb.array([]),
      relationAccounts: [],
      type: [],
      portId: []
    });
  }

  branchDetailForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      name: [null, Validators.required],
      email: [null],
      managerName: [null],
      phone: this._fb.group({
        countryId: [null],
        countryCode: [null],
        number: [null],
        extension: [null]
      }),
      temporaryId: [null],
      workingHr: [null],
      timezone: [null],
      address: this._fb.group({
        addressLine: [null],
        addressCountry: [null],
        addressState: [null],
        addressCity: [null],
        addressZipCode: [null],
      }),
      businessAccountId: [null],
      type: [],
      sortOrder: []
    });
  }


  employeeForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      businessAccountId: [null],
      lastName: [null],
      firstName: [null, Validators.required],
      phone: this._fb.group({
        countryId: [null],
        countryCode: [null],
        number: [null],
        extension: [null]
      }),
      email: [null],
      roleId: [null],
      externalRefId: [null],
      branchId: [null],
      sortOrder: [],
      invite: [null],
      sendInvite: [false],
      temporaryBranchId: [null],
      assignedLeads: []
    });
  }


}
