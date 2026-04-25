import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
    standalone: true,
    imports: [
    MatTabGroup,
    MatTab,
    MatTabLabel,
    MatBadge,
    MatTabContent,
    InventoryinOrderArrivalComponent,
    InventoryinAddedToInventoryComponent,
    InventoryinContainerInComponent
],
})
export class InventoryinListComponent implements OnInit {

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

  constructor(
    public router: Router,
    public inventoryinApi: InventoryinmanagementService,
    public apiService: ApiService,
    public uomService: UomService,
    public formService: FormsService,
    public http: HttpClient,
    public fb: UntypedFormBuilder
  ) { }

  async ngOnInit() {
   
  }

  changeMainTab(event: any) {
    this.currentMainIndex = event;
  }

}
