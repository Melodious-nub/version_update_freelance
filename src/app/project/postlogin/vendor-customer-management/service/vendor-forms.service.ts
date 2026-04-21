import { Injectable } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class VendorFormsService {
  constructor(public _fb: UntypedFormBuilder) {}

  createVendorForm(): UntypedFormGroup {
    return this._fb.group({
      primaryBusinessOffering: [null],
      id: [null],
      audit: [null],
      businessCategory: [null],
      code: [null],
      sendInvite: [false],
      employeeIds:[],
      businessLine: ['EXPORTER'],
      relationAccountId: [null],
      isImportReseller: [null],
      relationAccountDetail: this._fb.group({
        id: [null],
        verifiedStatus: [null],
        code: [null],
        name: [null],
        firstName: [null],
        lastName: [null],
        taxId: [null],
        panCard: [null],
        einNumber: [null],
        ssnNumber: [null],
        itinNumber: [null],
        gst: [null],
        businessLogo: [null],
        businessCode: [null],
        primaryContact: this._fb.group({
          id: [null],
          landline: this._fb.group({
            countryId: [null],
            countryCode: [null],
            number: [null],
            extension: [null],
          }),
          email: [null],
          phone: this._fb.group({
            countryId: [null],
            countryCode: [null],
            number: [null],
            extension: [null],
          }),
          fax: this._fb.group({
            countryId: [null],
            countryCode: [null],
            number: [null],
            extension: [null],
          }),
          address: this._fb.group({
            addressLine: [null],
            addressCountry: [null],
            addressState: [null],
            addressCity: [null],
            addressZipCode: [null],
          }),
        }),
        businessLines: [null],
        relationAccounts: [null],
        branchDetails: this._fb.array([]),
      }),
      incoTermId: [null],
      paymentTermId: [null],
      portId: [null],
      sortOrder: [null],
      isImportExport: [false],
      salesRepId: [null],
      productCategoryIds: [null],
      productTypeIds: [null],
      keywords: [null],
      isLivePricingOn: [null],
      warehouses: this._fb.array([]),
      contacts: this._fb.array([]),
      notes: this._fb.array([]),
      purchaseDepartmentPricings: this._fb.array([]),
      industryTypeIds: [null],
      industrySubTypeIds: [null],
      fulfillmentLimitInDays: [null],
      account: this._fb.group({
        id: [null],
        managerFname: [null],
        managerLname: [null],
        phoneNumber: [null],
        email: [null],
        netTermId: [null],
        netTermLimit: [null],
        addNew: [null],
        ach: [null],
        routingNumber: [null],
        wireInstructions: [null],
      }),
      relationAcceptedStatus: [null],
      reverseRelation: [null],
      upsTrackingNo:[null],
      relationStatusId: [null],
      latestNote:[null],
      reminderDetails:[null],
      reminderTime:[null],
      reminders:this._fb.array([]),
      invite: this._fb.group({
        id: [null],
        debugInformation: [null],
        audit: this._fb.group({
          createdDate: [null],
          createdById: [null],
          createdByName: [null],
          createdByUserName: [null],
          lastModifiedDate: [null],
          lastModifiedById: [null],
          lastModifiedByName: [null],
          lastModifiedByUserName: [null],
          businessAccountId: [null],
        }),
        invitedTo: [null],
        email: [null],
        phone: [null],
        inviteType: [null],
        inviteTypeReferenceId: [null],
        businessType: [null],
        shareCatelog: [null],
        catelog: [null],
        inviteLink: [null],
        redirectType: [null],
        redirectReferenceId: [null],
        status: [null],
        statusMessage: [null],
        branchId: [null],
        retryCount: [null],
        roleIds: this._fb.array([]),
        businessAccountToId: [null],
      }),
      discountPercentage:[null],
      buyingType:[null],
      relationAccountAttributeValues:this._fb.array([])
    });
  }

  branchDetailForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      name: [null],
      email: [null],
      managerName: [null, [Validators.required]],
      phone: this._fb.group({
        countryId: [null, [Validators.required]],
        countryCode: [null],
        number: [null, [Validators.required]],
        extension: [null],
      }),
      workingHr: [null],
      timezone: [null],
      address: this._fb.group({
        addressLine: [null, [Validators.required]],
        addressCountry: [null],
        addressState: [null],
        addressCity: [null],
        addressZipCode: [null],
      }),
      businessAccountId: [null],
    });
  }

  warehouseDetailForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      location: [null],
      managerName: [null],
      phone: this._fb.group({
        countryId: [null],
        countryCode: [null],
        number: [null],
        extension: [],
      }),
      email: [null],
      numberOfLoadingDocks: [null],
      numberOfForkLifts: [null],
      numberOfPalletJacks: [null],
      googleMapLink: [null],
      note: [null],
    });
  }

  purchaseDepartmentPricingForm(): UntypedFormGroup {
    return this._fb.group({
      productCategoryId: [null],
      purchaserName: [null],
      discountPercent: [null],
      phone: this._fb.group({
        countryId: [null, [Validators.required]],
        countryCode: [null, [Validators.required]],
        number: [null, [Validators.required]],
      }),
      email: [null],
      buyingCapacityType: [null],
      quotationProductCategoryId: [null],
    });
  }

  contactDetailForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      title: [null, [Validators.required]],
      name: [null, [Validators.required]],
      phone: this._fb.group({
        countryId: [null, [Validators.required]],
        countryCode: [null],
        number: [null, [Validators.required]],
        extension: [],
      }),
      email: [null, [Validators.required]],
      note: [null],
    });
  }

  noteForm(): UntypedFormGroup {
    return this._fb.group({
      id: [null],
      audit: [],
      fileName: [],
      message: [null, Validators.required],
      sortOrder: [],
      relationStatusId: [null],
      businessCategory: []
    });
  }

  emailForm(): UntypedFormGroup {
    return this._fb.group({
      emailContent: [null,Validators.required],
      emailRecipients: [null,Validators.required],
      errorMessage: [null],
      isSent: [null],
      subject: [null,Validators.required],
      attachments:[null],
      sendFlyer:[false]
    });
  }

  reminderForm(): UntypedFormGroup {
    return this._fb.group({
      reminderDetails: [null,Validators.required],
      reminderTime: [null,Validators.required],
      alertSent: [false],
      sortOrder:[0]
    });
  }
}
