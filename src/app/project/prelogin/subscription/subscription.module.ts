import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionComponent } from './subscription.component';
import { SubscriptionRoutingModule } from './subscription-routing.module';
import { ChooseSubscriptionComponent } from './choose-subscription/choose-subscription.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { PaymentSubscriptionComponent } from './payment-subscription/payment-subscription.component';
import { OnboardingComponent } from './onboarding/onboarding.component';



@NgModule({
    imports: [
        CommonModule,
        SubscriptionRoutingModule,
        SharedModule,
        SubscriptionComponent,
        ChooseSubscriptionComponent,
        PaymentSubscriptionComponent,
        OnboardingComponent
    ]
})
export class SubscriptionModule { }
