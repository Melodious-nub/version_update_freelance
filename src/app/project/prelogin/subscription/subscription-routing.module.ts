import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionComponent } from './subscription.component';
import { ChooseSubscriptionComponent } from './choose-subscription/choose-subscription.component';
import { PaymentSubscriptionComponent } from './payment-subscription/payment-subscription.component';
import { OnboardingComponent } from './onboarding/onboarding.component';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionRoutingModule { }
