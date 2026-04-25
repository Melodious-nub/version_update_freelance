import {
  Component,
  OnInit,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ToastrService } from 'ngx-toastr';
import { ContainerManagementService } from 'src/app/project/postlogin/container-management/service/container-management.service';
import { ProductService } from 'src/app/project/postlogin/product-management/product/service/product.service';
import { ApiService } from 'src/app/service/api.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { OrderManagementService } from '../../../../service/order-management.service';
import { OrderFormsService } from '../../../../service/order-forms.service';
import { PrintService } from 'src/app/service/print.service';
import { MatDialog } from '@angular/material/dialog';
import { first } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaymentService } from 'src/app/service/payment.service';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { DadyinButtonComponent } from '../../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { NgClass, DatePipe } from '@angular/common';

@Component({
    selector: 'app-payment',
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        DadyinButtonComponent,
        NgClass,
        ExtendedModule,
        DatePipe
    ]
})
export class PaymentComponent implements OnInit {
  showPayNowButton = false;
  @Input() purchaseOrderForm: any;
  @Input() componentUoms: any;
  @Output() getOrderById = new EventEmitter();
  paymentOverview: any[] = [];
  constructor(
    public fb: UntypedFormBuilder,
    public ordermanagementService: OrderManagementService,
    public orderFormService: OrderFormsService,
    public formsService: FormsService,
    public route: ActivatedRoute,
    public toastr: ToastrService,
    public uomService: UomService,
    public containerService: ContainerManagementService,
    public businessAccountService: BusinessAccountService,
    public apiService: ApiService,
    public router: Router,
    public productService: ProductService,
    public ref: ChangeDetectorRef,
    public printService: PrintService,
    public dialog: MatDialog,
    public paymentService: PaymentService
  ) {}

  ngOnInit() {
    this.purchaseOrderForm.get('totalCost').enable();
    this.getPaymentOverview();
  }

  get paymentStatus() {
    return this.purchaseOrderForm.getRawValue().paymentStatus;
  }
  get importLocalType() {
    return this.purchaseOrderForm.getRawValue().importLocalType;
  }

  get deliveryPickup() {
    return this.purchaseOrderForm.getRawValue().deliveryPickup;
  }

  get deliveryAddressValue() {
    if (this.purchaseOrderForm.getRawValue().deliveryAddress?.addressLine) {
      const address: any = Object.values(
        this.purchaseOrderForm.getRawValue()?.deliveryAddress
      ).join(',');
      return address;
    } else {
      return '';
    }
  }

  getPaymentOverview() {
    if(!this.route.snapshot.params.id) {
      return;
    }
    this.ordermanagementService
      .Get_PaymentOverview(this.route.snapshot.params.id)
      .pipe(first())
      .subscribe(
        (paymentOverview: any) => {
          this.paymentOverview = paymentOverview;
        },
        (err) => {
          this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
        }
      );
  }

  get paymentEnabled() {
    return this.purchaseOrderForm.getRawValue().paymentEnabled;
  }

  ////  Stripe related code
  public stripePK = (<any>window).Stripe(environment.stripePK);
  // public stripeSK = require("stripe")(environment.stripeSk);
  elements;
  emailAddress = '';
  paymentIntent;
  public paymentHandler: any = null;

  initiateStripePayment() {
    if (this.paymentStatus == 'COMPLETED') {
      return;
    }
    this.invokeStripe();
    this.initialize(this.purchaseOrderForm.getRawValue().totalCost);
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
          token: function (stripeToken: any) {},
        });
      };
      window.document.body.appendChild(script);
    }
  }

  public async initialize(cost: any) {
    let component = this;
    component.paymentIntent = await this.paymentService
      .createPaymentIntent(
        cost.attributeValue,
        cost.userConversionUom,
        this.orderId
      )
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

  get orderId() {
    return this.purchaseOrderForm.getRawValue().id;
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

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      this.confirmPayment(component.paymentIntent.id, component.orderId);
    }

    if (error.type === 'card_error' || error.type === 'validation_error') {
      component.showMessage(error.message);
    } else {
      component.showMessage('An unexpected error occurred.');
    }
  }

  private confirmPayment(paymentId: any, orderId: any) {
    let component = this;
    this.paymentService
      .paymentOrderConfirm({ paymentId: paymentId, orderId: orderId })
      .subscribe(
        (res) => {
          component.showMessage('Payment received successfully');
          this.toastr.success('Payment received successfully');
          this.getOrderById.emit(null);
           this.getPaymentOverview();
        },
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
}
