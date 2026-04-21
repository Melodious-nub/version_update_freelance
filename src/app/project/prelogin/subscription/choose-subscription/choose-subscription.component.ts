import { Component, OnInit } from '@angular/core';
import { PaymentInfoList } from '../payment-info-list';
import { Router } from '@angular/router';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { SubscriptionService } from '../subscription.service';

@Component({
  selector: 'app-choose-subscription',
  templateUrl: './choose-subscription.component.html',
  styleUrls: ['./choose-subscription.component.scss']
})
export class ChooseSubscriptionComponent implements OnInit {
  calenderList = [{ name: 'Yearly', isChecked: true, value: 'Year' }, { name: 'Monthly', isChecked: false, value: 'Month' }];
  selectedCalendar = this.calenderList[0];
  paymentInfoList = PaymentInfoList;
  selectedPayment = this.paymentInfoList[2];
  showBackButton = false;
  businessDetails;

  constructor(private router: Router, private businessAccountService: BusinessAccountService, private subscriptionService: SubscriptionService) { }

  ngOnInit(): void {
    this.showBackButton = history.state?.from === 'business-registration';
    const paymentInfoId = history.state?.paymentInfoId;
    this.selectedPayment = this.paymentInfoList.find(payment => payment.businessSubscriptionId === paymentInfoId) || this.paymentInfoList[2];
    this.paymentInfoList.forEach(val => val.isChecked = false);
    this.selectedPayment.isChecked = true;
    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      if (res) {
        this.businessDetails = res;
      }
    });
  }

  cancel() {

  }

  getCalendarList(calendar) {
    this.calenderList.forEach(val => val.isChecked = false);
    calendar.isChecked = true;
    this.selectedCalendar = calendar;
  }

  choosePayment(paymentInfo) {
    this.paymentInfoList.forEach(val => val.isChecked = false);
    paymentInfo.isChecked = true;
    this.selectedPayment = paymentInfo;
  }

  getCostWithComma(value) {
    return value.toLocaleString('en-US');
  }

  navigateToPayment(isChecked?: boolean) {
    if (!isChecked) {
      return
    }
    const selectedPaymentData = {
      logo: this.selectedPayment.logo,
      type: this.selectedCalendar.value,
      priceText: this.selectedCalendar.value === 'Year' ? this.selectedPayment.yearCostText : this.selectedPayment.monthCostText,
      setupCost: this.selectedPayment.setupCost,
      price: this.selectedCalendar.value === 'Year' ? this.selectedPayment.yearPrice : this.selectedPayment.monthPrice,
      priceCost: this.selectedCalendar.value === 'Year' ? this.selectedPayment.yearCost : this.selectedPayment.monthCost,
      subscriptionPackageMonthAmount: this.selectedPayment.subscriptionPackageMonthAmount,
      subscriptionPackageAmount: this.selectedCalendar.value === 'Year' ? this.selectedPayment.subscriptionPackageYearAmount : this.selectedPayment.subscriptionPackageMonthAmount,
      setupCostValue: this.selectedPayment.setupCostValue
    }
    sessionStorage.setItem('selectedSubscription', JSON.stringify({ ...this.selectedPayment, subscriptionType: this.selectedCalendar.name.toLocaleUpperCase() }))
    if (selectedPaymentData.priceCost === 0) {
      if (this.showBackButton) {
        this.updateBusiness();
      } else {
        this.router.navigateByUrl('/subscription/onboarding');
      }
    } else {
      if (this.showBackButton) {
        this.router.navigateByUrl('/subscription/payment', { state: { data: selectedPaymentData, from: 'business-registration' } })
      } else {
        this.router.navigateByUrl('/subscription/payment', { state: { data: selectedPaymentData } })
      }
    }
  }

  updateBusiness() {
    const businessSubscriptionUsageDetails = {
      productSupport: this.selectedPayment?.productSupport,
      allowedNoOfBranches: 0,
      subscriptionStart: new Date().toISOString().split('.')[0],
      subscriptionEnd: this.endDate(this.selectedCalendar.name.toLocaleUpperCase()),
      subscriptionType: this.selectedCalendar.name.toLocaleUpperCase(),
      isSubscriptionPaid: false,
      businessSubscriptionId: this.selectedPayment?.businessSubscriptionId,
      promoCodeUsed: null
    };
    this.businessDetails.businessSubscriptionUsageDetails = { ...this.businessDetails.businessSubscriptionUsageDetails, ...businessSubscriptionUsageDetails };
    this.subscriptionService.updateBusiness(this.businessDetails).subscribe(res => {
        this.businessAccountService.getBusinessAccount();
        this.router.navigateByUrl('/home/business-registration');
    })
  }

   endDate(type) {
    const today = new Date();
    const nextEndDate = new Date(today);
    if (type === 'MONTHLY') {
      nextEndDate.setMonth(today.getMonth() + 1);
    } else {
      nextEndDate.setFullYear(today.getFullYear() + 1);
    }
    // Format as YYYY-MM-DDTHH:mm:ss
    const formatted = nextEndDate.toISOString().split('.')[0];
    return formatted;
  }

  navigateToBusinessRegistration() {
    this.router.navigateByUrl('/home/business-registration');
  }

}
