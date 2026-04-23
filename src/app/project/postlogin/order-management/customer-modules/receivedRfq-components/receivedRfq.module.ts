import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceivedRfqListComponent } from './receivedRfq-list/receivedRfq-list.component';
import { ViewRfqComponent } from './receivedRfq-steps/view-rfq/view-rfq.component';
import { ReceivedRfqStepsComponent } from './receivedRfq-steps/receivedRfq-steps.component';
import { ReceivedRfqComponent } from './receivedRfq.component';
import { ReceivedRfqRoutingModule } from './receivedRfq.routing.module';

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        SharedModule,
        ReceivedRfqRoutingModule,
        ReceivedRfqListComponent,
        ViewRfqComponent,
        ReceivedRfqStepsComponent,
        ReceivedRfqComponent
    ],
    exports: [
        ReceivedRfqListComponent,
        ViewRfqComponent,
        ReceivedRfqStepsComponent,
        ReceivedRfqComponent
    ]
})
export class ReceivedRfqModule { }
