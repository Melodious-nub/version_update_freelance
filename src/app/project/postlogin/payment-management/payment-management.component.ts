import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/service/api.service';
import { Router } from '@angular/router';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormsService } from 'src/app/service/forms.service';
import { PaymentManagementService } from './service/payment-management.service';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { DadyinSearchableSelectComponent } from '../../../shared/widgets/dadyin-searchable-select/dadyin-searchable-select.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { NgIf, NgFor, NgClass, CurrencyPipe, DatePipe } from '@angular/common';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { DadyinButtonComponent } from '../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-payment-management',
    templateUrl: './payment-management.component.html',
    styleUrls: ['./payment-management.component.scss'],
    standalone: true,
    imports: [
        DadyinButtonComponent,
        CdkDrag,
        NgIf,
        NgFor,
        FormsModule,
        ReactiveFormsModule,
        MatTabsModule,
        MatExpansionModule,
        DadyinSearchableSelectComponent,
        NgClass,
        ExtendedModule,
        CurrencyPipe,
        DatePipe,
    ],
})
export class PaymentManagementComponent implements OnInit {
  currentMainIndex = 0;
  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formsService.createPreferUomForm();
  uomSetting = false;
  showPayNowButton = false;
  public pageConfig: any = {
    itemPerPage: 20,
    sizeOption: [20, 50, 75, 100],
  };
  businessId = new UntypedFormControl();
  invoicesList: any[] = [];
  constructor(
    public router: Router,
    public dialog: MatDialog,
    public apiService: ApiService,
    public fb: UntypedFormBuilder,
    public formsService: FormsService,
    public paymentManagementService: PaymentManagementService,
    public toastr: ToastrService
  ) {}

  ngOnInit() {
    this.uomSetting = false;
    this.loadInvoices();
  }

  getUomQuery() {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    return uomQuery;
  }

  navigate(link: any) {
    this.router.navigateByUrl(link);
  }

  expandPanel(matExpansionPanel, event): void {
    event.stopPropagation(); // Preventing event bubbling

    if (!this._isExpansionIndicator(event.target)) {
      matExpansionPanel.open(); // Here's the magic
    }
  }

  private _isExpansionIndicator(target: EventTarget): boolean {
    const expansionIndicatorClass = 'mat-expansion-indicator';
    return (
      target['classList'] &&
      target['classList'].contains(expansionIndicatorClass)
    );
  }

  getPreference() {
    this.apiService.getPreferredUoms().subscribe((preference: any) => {
      this.preferredUoms = preference;
      const preferenceForPurchaseorder = this.preferredUoms.find(
        (item) => item.componentType == 'ORDER'
      );
      preferenceForPurchaseorder?.componentUoms?.forEach((ele) => {
        const componentUomForm = this.formsService.createComponentUomForm();
        this.componentUoms.push(componentUomForm);
      });
      this.preferForm.patchValue(preferenceForPurchaseorder);
    });
  }

  get componentUoms() {
    return this.preferForm.get('componentUoms') as UntypedFormArray;
  }

  loadInvoices() {
    this.paymentManagementService.getPendingPaymentBills().subscribe((res) => {
      this.invoicesList = res;
      this.invoicesList.forEach((invoice) => {
        invoice.amountToPay =
          (invoice.remainingPaymentCost?.attributeValue ??
            invoice.totalCost?.attributeValue) ||
          0;
        invoice.isSelected = false; // Initialize selection state
      });
    });
  }

  get totalAmount() {
    return this.filteredInvoicesList.reduce(
      (sum, inv) => sum + (+inv.amountToPay || 0),
      0
    );
  }

  // stripe related

  ////  Stripe related code
  public stripePK = (<any>window).Stripe(environment.stripePK);
  elements;
  emailAddress = '';
  paymentIntent;
  public paymentHandler: any = null;

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
          token: function (stripeToken: any) {},
        });
      };
      window.document.body.appendChild(script);
    }
  }

  async initialize() {
    if (this.filteredInvoicesList.length == 0) {
      this.toastr.show('No invoices selected for payment.');
      return;
    }
    this.currentMainIndex = 1;
    this.invokeStripe();
    let component = this;
    component.paymentIntent = await this.paymentManagementService
      .initiateInvoicePayment({
        amount: this.totalAmount,
        currency: 'USD',
      })
      .toPromise(); // Example values

    const { clientSecret } = await {
      clientSecret: component.paymentIntent.client_secret,
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
    setTimeout(() => {
      this.showPayNowButton = true;
    }, 2000);
  }

  public async handleSubmit(e) {
    let component = this;
    component.setLoading(true);
    let elements = component.elements;
    const { error, paymentIntent } = await component.stripePK.confirmPayment({
      elements,
      confirmParams: {
        return_url: environment.uiURL + '#/home',
        receipt_email: component.emailAddress,
      },
      redirect: 'if_required',
    });

    console.log(error);

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      const today = new Date().toISOString().split('T')[0];
      const payload = this.filteredInvoicesList.map((inv) => ({
        id: { invoiceId: inv.id },
        audit: inv.audit,
        paidAmount: {
          attributeValue: inv.amountToPay,
          userConversionUom: 'USD',
        },
        paymentDate: today,
      }));
      await this.confirmPayment(component.paymentIntent.id, payload); // Pass the payload to confirmPayment
      component.setLoading(false);
      this.toastr.success('Payment successful!');
      this.currentMainIndex = 0;
      this.loadInvoices();
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

  private confirmPayment(paymentId: any, payload: any) {
    let component = this;
    this.paymentManagementService
      .saveInvoicePaymentAfterStripe(paymentId, payload)
      .subscribe(
        (res) => {},
        (err) => {
          this.toastr.error(
            err?.error?.message ?? 'Something went wrong, Please try again'
          );
        }
      );
  }

  public async showMessage(messageText) {
    let component = this;
    const messageContainer = document.querySelector('#payment-message');
    messageContainer.classList.remove('hidden');
    messageContainer.textContent = messageText;
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

  get filteredInvoicesList() {
    return this.invoicesList.filter((inv) => inv.isSelected);
  }

  changeMainTab(event) {
    this.currentMainIndex = event;
  }
}
