import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormArray, UntypedFormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { InventoryinmanagementService } from '../service/inventoryin-management.service';
import { InventoryinContainerInComponent } from './container-in/container-in.component';
import { InventoryinAddedToInventoryComponent } from './added-to-inventory/added-to-inventory.component';
import { InventoryinOrderArrivalComponent } from './order-arrival/order-arrival.component';
import { MatBadge } from '@angular/material/badge';

import { MatTabGroup, MatTab, MatTabLabel, MatTabContent } from '@angular/material/tabs';

@Component({
    selector: 'app-inventoryin-list',
    templateUrl: './inventoryin-list.component.html',
    styleUrls: ['./inventoryin-list.component.scss'],
    imports: [
        MatTabGroup,
        MatTab,
        MatTabLabel,
        MatBadge,
        MatTabContent,
        InventoryinOrderArrivalComponent,
        InventoryinAddedToInventoryComponent,
        InventoryinContainerInComponent
    ]
})
export class InventoryinListComponent {
  router = inject(Router);
  inventoryinApi = inject(InventoryinmanagementService);
  apiService = inject(ApiService);
  uomService = inject(UomService);
  formService = inject(FormsService);
  http = inject(HttpClient);
  fb = inject(UntypedFormBuilder);


  currentMainIndex: number = 0;
  mainTab: Array<any> = [
    {
      id: 1,
      title: 'Order Arrival',
      badge: 0,
      index: 0,
    },
    {
      id: 2,
      title: 'Added to Inventory',
      badge: 0,
      index: 0,
    },
    {
      id: 3,
      title: 'Container in (Import)',
      badge: 0,
      index: 0,
    },
  ];

  async

  changeMainTab(event: any) {
    this.currentMainIndex = event;
  }

}
