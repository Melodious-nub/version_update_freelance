import { Contact } from "./contact";

export interface BusinessAccountResponse {
    count: number;
    next: string;
    previous: string;
    results: BusinessAccount[];
}

export interface BusinessAccount {
    id?: number;
    account: string;
    description: string;
    email: string;
    phone: string;
    businessType: any[]
    roleName: string;
    name: string;
}

export class BusinessAccounts {
    id?: number;
    name: string;
    description: string;
    country: string;
    currency: string;
    currencyRate: string;
    currency2nd: string;
    currency2ndRate: string;
    primaryContact: Contact;
    type: string[];
    roleName: string;
    fromInvite: boolean;
    inviteId: number;
    countryid;
    stateid;
    cityid;
    firstName;
    lastName;
    gst;
    language;
    businessLogo;
    companyStamp;
    digitalStamp;
    isSystemAccount: boolean;
    relationAccounts: any[];
}

export class Branch {
    id;
    name: string;
    managerName: string;
    phone: string;
    email: string;
    workingHr: string;
    timezone: string;
    countryId: any;
    cityId: any;
    countryName: any;
    cityName: any;
    isEdit: boolean = false;
    line1: string;
    address : {
      addressLine: string,
      addressCountry: string,
      addressState: string,
      addressCity: string,
      addressZipCode: string
  }
}

export class BusinessAddress {
    id;
    label;
    personName;
    phoneNumber;
    addressLine1;
    addressLine2;
    countryId;
    TownId;
    zipCode;
}

export class Data {
    error: boolean;
    msg: string;
}
export class Country extends Data {

}

export class User {
    id: number;
    debugInformation: any;
    createdDate: any;
    modifiedDate: any;
    verifiedStatus: string;
    username: string;
    email: string;
    roles: any;
    branch: Branch;
    enabled: boolean;
    displayName: string;
    inviteId: number;
    firstName: string;
    lastName: string;
    externalRefId: string;
    position: string;
    phone: string;
}