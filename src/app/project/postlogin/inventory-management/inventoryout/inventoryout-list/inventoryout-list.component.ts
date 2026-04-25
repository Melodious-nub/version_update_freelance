import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, UntypedFormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { InventoryoutmanagementService } from '../service/inventoryout-management.service';
import { ContainerInComponent } from './container-in/container-in.component';
import { AddedToInventoryComponent } from './added-to-inventory/added-to-inventory.component';
import { OrderArrivalComponent } from './order-arrival/order-arrival.component';
import { MatBadgeModule } from '@angular/material/badge';
import { NgFor, NgIf } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
    selector: 'app-inventoryout-list',
    templateUrl: './inventoryout-list.component.html',
    styleUrls: ['./inventoryout-list.component.scss'],
    standalone: true,
    imports: [
        MatTabsModule,
        NgFor,
        MatBadgeModule,
        NgIf,
        OrderArrivalComponent,
        AddedToInventoryComponent,
        ContainerInComponent,
    ],
})
export class InventoryoutListComponent implements OnInit {

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
    public inventoryoutApi: InventoryoutmanagementService,
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
