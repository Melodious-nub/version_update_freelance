import { Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { SubscriptionService } from '../subscription.service';
import { Router } from '@angular/router';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-payment-subscription',
    templateUrl: './payment-subscription.component.html',
    styleUrls: ['./payment-subscription.component.scss'],
    standalone: true,
    imports: [FormsModule, DecimalPipe]
})
export class PaymentSubscriptionComponent implements OnInit, OnDestroy {
  // Stripe related code
  public stripePK = (<any>window).Stripe(environment.stripePK);
  elements;
  emailAddress = '';
  paymentIntent;
  totalAmount;
  public paymentHandler: any = null;
  selectedPaymentMethod = 'CARD';
  isCoupenApplied = false;
  promoCode = '';
  selectedPaymentData;
  isPromoSuccess = false;
  discountAmount;
  setupCostAmount;
  finalPayment;
  businessInfo;
  businessDetails;
  isFromBusinessPage = false;
  

  constructor(public toastr: ToastrService, private subscriptionService: SubscriptionService, private router: Router, private businessAccountService: BusinessAccountService) { }

  ngOnInit(): void {
    this.selectedPaymentData = history.state.data;
    this.isFromBusinessPage = history.state?.from === 'business-registration';
    this.setupCostAmount = this.selectedPaymentData.setupCostValue;
    this.totalAmount = this.selectedPaymentData?.price;
    this.finalPayment = this.selectedPaymentData?.priceCost;
 
    this.initialize();
    const userData = sessionStorage.getItem('signupData');
    this.businessInfo = JSON.parse(userData);
    this.businessAccountService.$currentBusinessAccount.subscribe((res) => {
      if (res) {
        this.businessDetails = res;
      }
    });
    history.pushState(null, '', location.href); // Push current state
    window.onpopstate = () => {
      history.pushState(null, '', location.href); // Prevent back navigation
    };
  }

  async initialize() {
    this.invokeStripe();
    let component = this;
    component.paymentIntent = await this.subscriptionService
      .initiateSubscriptionPayment({
        amount: this.totalAmount,
        currency: 'USD',
      })
      .toPromise(); // Example values

    const { clientSecret } = await {
      clientSecret: component.paymentIntent?.client_secret,
    };

    const appearance = { theme: 'stripe' };
    component.elements = component.stripePK.elements({
      appearance,
      clientSecret,
    });
    const linkAuthenticationElement =
      component.elements.create('linkAuthentication');
    linkAuthenticationElement.mount('#link-authentication-element');
    linkAuthenticationElement.on('change', (event) => {
      component.emailAddress = event.value.email;
    });
    const paymentElementOptions = { layout: 'tabs' };
    const paymentElement = component.elements.create(
      'payment',
      paymentElementOptions
    );
    paymentElement.mount('#payment-element');
  }

  invokeStripe() {
    if (!window.document.getElementById('stripe-script')) {
      const script = window.document.createElement('script');
      script.id = 'stripe-script';
      script.type = 'text/javascript';
      script.src = 'https://checkout.stripe.com/checkout.js';
      script.onload = () => {
        this.paymentHandler = (<any>window).StripeCheckout.configure({
          key: environment.stripePK,
          locale: 'auto',
          token: function (stripeToken: any) { },
        });
      };
      window.document.body.appendChild(script);
    }
  }

  public async handleSubmit(e) {
    let component = this;
    component.setLoading(true);
    let elements = component.elements;
    const { error, paymentIntent } = await component.stripePK.confirmPayment({
      elements,
      confirmParams: {
        receipt_email: component.emailAddress,
      },
      redirect: 'if_required',
    });

    console.log(error);

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      const payload = {
        paymentId: paymentIntent.id,
        businessAccountId: this.businessInfo?.businessAccount?.id
      }
      await this.confirmPayment(payload); // Pass the payload to confirmPayment
    } else {
      if (
        error &&
        (error?.type === 'card_error' || error?.type === 'validation_error')
      ) {
        this.toastr.error(error?.message);
        component.setLoading(false);
        this.toastr.error('Payment failed. Please try again.');
      } else {
        this.toastr.error('An unexpected error occurred.');
      }
    }
  }

  private confirmPayment(payload: any) {
    this.subscriptionService
      .confirmSubscriptionPayment(payload)
      .subscribe(
        (res) => {
          let component = this;
          component.setLoading(false);
          sessionStorage.setItem('isSubscriptionPaid', JSON.stringify(true))
          // this.toastr.success('Payment successful!');
          if (this.isFromBusinessPage) {
            this.updateBusiness();
          } else {
            this.router.navigateByUrl('/subscription/onboarding');
          }
        },
        (err) => {
          this.toastr.error(
            err?.error?.message ?? 'We could not process your payment. Please try again after sometime.'
          );
          this.router.navigateByUrl('/home/business-registration?currentMainIndex=2');
        }
      );
  }

  updateBusiness() {
    const selectedPayment = sessionStorage.getItem('selectedSubscription') ? JSON.parse(sessionStorage.getItem('selectedSubscription')) : null;
    const businessSubscriptionUsageDetails = {
      productSupport: selectedPayment?.productSupport,
      allowedNoOfBranches: 0,
      subscriptionStart: new Date().toISOString().split('.')[0],
      subscriptionEnd: this.endDate(selectedPayment?.subscriptionType),
      subscriptionType: selectedPayment?.subscriptionType,
      isSubscriptionPaid: true,
      businessSubscriptionId: selectedPayment?.businessSubscriptionId,
      promoCodeUsed: sessionStorage.getItem('promoCode') ? sessionStorage.getItem('promoCode') : null
    };
    this.businessDetails.businessSubscriptionUsageDetails = { ...this.businessDetails.businessSubscriptionUsageDetails, ...businessSubscriptionUsageDetails };
    this.subscriptionService.updateBusiness(this.businessDetails).subscribe(res => {
      this.businessAccountService.getBusinessAccount();
      this.router.navigateByUrl('/home/business-registration?currentMainIndex=2&payment=success');
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

  public async setLoading(isLoading) {
    let component = this;
    if (isLoading) {
      document.querySelector('#spinner').classList.remove('hidden');
      document.querySelector('#button-text').classList.add('hidden');
    } else {
      //document.querySelector("#submit").disabled = false;
      document.querySelector('#spinner').classList.add('hidden');
      document.querySelector('#button-text').classList.remove('hidden');
    }
  }

  goBack() {
    this.router.navigateByUrl('/subscription')
  }

  applyCoupen() {
    if (this.promoCode) {
      const payload = {
        promoCode: this.promoCode,
        subscriptionPackageAmount: this.selectedPaymentData?.subscriptionPackageAmount,
        setupCost: this.selectedPaymentData?.setupCostValue
      }

      this.subscriptionService
        .applyPromoCode(payload)
        .subscribe(
          (res: any) => {
            if (res?.status === 'SUCCESS') {
              this.discountAmount = res?.discountAmount;
              this.setupCostAmount = this.selectedPaymentData?.setupCostValue - res?.discountAmount;
              this.finalPayment = res?.finalPaymentAmount;
              this.totalAmount = this.finalPayment;
              this.isCoupenApplied = true;
              this.isPromoSuccess = true;
              sessionStorage.setItem('promoCode', this.promoCode);
              this.initialize();
            }
          },
          (err) => {
            this.isPromoSuccess = false;
            this.toastr.error(
              err?.error?.errorMessage ?? 'Something went wrong, Please try again'
            );
          }
        );
    }
  }

  removeCoupen() {
    this.subscriptionService
      .removePromoCode(this.promoCode)
      .subscribe(
        (res: any) => {
          if (res?.status === 'SUCCESS') {
            this.promoCode = '';
            this.isCoupenApplied = false;
            this.setupCostAmount = this.selectedPaymentData.setupCostValue;
            this.totalAmount = this.selectedPaymentData?.price;
            this.finalPayment = this.selectedPaymentData?.priceCost;
            sessionStorage.removeItem('promoCode');
            this.initialize();
          }
        },
        (err) => {
          this.toastr.error(
            err?.error?.errorMessage ?? 'Something went wrong, Please try again'
          );
        }
      );
  }

  ngOnDestroy() {
    window.onpopstate = null;
  }

}
