import { Routes } from '@angular/router';
import { SubscriptionComponent } from './subscription.component';
import { ChooseSubscriptionComponent } from './choose-subscription/choose-subscription.component';
import { PaymentSubscriptionComponent } from './payment-subscription/payment-subscription.component';
import { OnboardingComponent } from './onboarding/onboarding.component';

export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: '',
    component: SubscriptionComponent,
    children: [
      {
        path: '', component: ChooseSubscriptionComponent
      },
      {
        path: 'payment', component: PaymentSubscriptionComponent
      },
      {
        path: 'onboarding', component: OnboardingComponent
      }
    ]
  }
];
