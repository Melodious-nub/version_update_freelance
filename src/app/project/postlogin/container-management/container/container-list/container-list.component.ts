import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { ContainerManagementService } from '../../service/container-management.service';
import { DataTableComponent } from '../../../../../shared/component/data-table/data-table.component';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { SearchFilterComponent } from '../../../../../shared/component/search-filter/search-filter.component';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { MatBadge } from '@angular/material/badge';

import { MatTabGroup, MatTab, MatTabLabel, MatTabContent } from '@angular/material/tabs';

@Component({
    selector: 'app-container-list',
    templateUrl: './container-list.component.html',
    styleUrls: ['./container-list.component.scss'],
    imports: [
        MatTabGroup,
        MatTab,
        MatTabLabel,
        MatBadge,
        MatTabContent,
        CdkDrag,
        FormsModule,
        ReactiveFormsModule,
        SearchFilterComponent,
        DadyinButtonComponent,
        DataTableComponent
    ]
})
export class ContainerListComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  containerApi = inject(ContainerManagementService);
  apiService = inject(ApiService);
  uomService = inject(UomService);
  formService = inject(FormsService);
  http = inject(HttpClient);
  fb = inject(UntypedFormBuilder);

  public preferredUoms: any[];
  public preferForm: UntypedFormGroup = this.formService.createPreferUomForm();
  public containersList: any[];
  public searchText: string;

  public headers = [];

  public pageConfig = null;

  public tabelActions: any = [
    {
      label: 'Edit',
      icon: 'edit',
    },
  ];

  pageIndex: any = 0;
  pageS = 100;
  sortQuery: any = 'audit.lastModifiedDate,desc';

  currentMainIndex: number = 0;
  mainTab: Array<any> = [
    {
      id: 1,
      title: 'Container Info',
      badge: 0,
      index: 0,
    },
    {
      id: 2,
      title: 'Unloading',
      badge: 0,
      index: 1,
    },
    {
      id: 3,
      title: 'Container Details',
      badge: 0,
      index: 2,
    },
    {
      id: 4,
      title: 'Expenses',
      badge: 0,
      index: 3,
    },
    {
      id: 5,
      title: 'Report',
      badge: 0,
      index: 4,
    },
  ];

  async ngOnInit() {
    this.setTableHeaders();
    await this.getPreference();

    this.pageConfig = {
      itemPerPage: 100,
      sizeOption: [50, 75, 100],
    };
  }

  loadContainerListings(): void {
    let uomQuery = ``;
    this.componentUoms.controls.forEach((element) => {
      element.get('columnMappings').value.forEach((col) => {
        uomQuery =
          uomQuery +
          `&uomMap[${col}]=${element.get('userConversionUom').value}`;
      });
    });
    uomQuery = encodeURI(uomQuery);
    this.containerApi
      .Get_All_Containers(
        this.pageIndex,
        this.pageS,
        this.sortQuery,
        uomQuery,
        this.searchText,
        this.isExport
      )
      .subscribe((containers) => {
        this.pageConfig.totalElements = containers?.totalElements;
        this.pageConfig.totalPages = containers?.totalPages;
        this.containersList = containers.content;
      });
  }

  get componentUoms() {
    return this.preferForm.get('componentUoms') as UntypedFormArray;
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        if (event?.row?.id) {
          this.edit(event?.row);
        }
        break;

      case 'Copy':
        break;

      case 'Download':
        break;
    }
  }

  edit(data) {
    if (data?.quotationInContainer > 0) {
      this.router.navigateByUrl(
        'home/container-management/container/quotation/edit/' + data?.id
      );
    } else {
      if (this.isExport) {
        this.router.navigateByUrl(
          'home/container-management/container/export/edit/' + data?.id
        );
      } else {
        this.router.navigateByUrl(
          'home/container-management/container/import/edit/' + data?.id
        );
      }
    }
  }

  addContainer(): void {
    if (this.isExport) {
      this.router.navigateByUrl(
        'home/container-management/container/export/add'
      );
    } else {
      this.router.navigateByUrl(
        'home/container-management/container/import/add'
      );
    }
  }

  onInput(searchText: string): void {
    this.searchText = searchText;
    this.loadListings();
  }

  editRecord(event): void {
    if (event?.data?.id) {
      this.edit(event?.data);
    }
  }

  sort(event) {
    if (event.active == 'description') {
      this.sortQuery = event.active + ',' + event.direction;
      this.loadListings();
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadListings();
  }

  changeMainTab(event: any) {
    this.currentMainIndex = event;
    this.searchText = null;
    this.pageIndex = 0;
    this.pageS = 100;
    this.sortQuery = 'audit.lastModifiedDate,desc';
    this.setTableHeaders();
    this.loadListings();
  }

  setTableHeaders() {
    if (this.currentMainIndex == 0) {
      this.headers = [
        { name: 'ID#', prop: 'id', sortable: true },
        { name: 'IMPORT FROM', prop: 'requestToName', sortable: true },
        { name: 'LOCAL C#', prop: 'containerNumber', sortable: true },
        { name: 'SIZE', prop: 'containerTypeDescription', sortable: true },
        {
          name: 'DEPT. DATE',
          prop: 'departureDate',
          type: 'date',
          sortable: true,
        },
        {
          name: 'ARI. DATE',
          prop: 'arrivalDate',
          type: 'date',
          sortable: true,
        },
        { name: 'INCOTERMS', prop: 'incoTermDescription', sortable: true },
        { name: 'TOTAL ORDERS', prop: 'totalOrders', sortable: true },
        { name: 'SKUS', prop: 'totalSKUs', sortable: true },
        { name: 'EXP. WT.', prop: 'expenseByWeight', sortable: true },
        { name: 'EXP. VOL', prop: 'expenseByVolume', sortable: true },
        { name: 'ODO', prop: 'containerOdometer.value', sortable: true },
        { name: 'DOCS', prop: 'id12', sortable: true },
        { name: 'EXP. ORDER VALUE', prop: 'expenseCost', sortable: true },
        { name: 'STATUS', prop: 'status', type: 'status', sortable: true },
        { name: 'ACTIONS', prop: 'action', type: 'menu' },
      ];
    }
    if (this.currentMainIndex == 1) {
      this.headers = [
        { name: 'IMPORT FROM', prop: 'requestToName', sortable: true },
        {
          name: 'LOADING DATE',
          prop: 'loadingDate',
          type: 'date',
          sortable: true,
        },
        { name: 'LOCAL C #', prop: 'localContainerNumber', sortable: true },
        { name: 'SIZE', prop: 'departureDate', sortable: true },
        { name: 'TOTAL ORDER', prop: 'arrivalDate', sortable: true },
        { name: 'SKUS', prop: 'totalSKUs', sortable: true },
        { name: 'PKGS', prop: 'expenseByWeight', sortable: true },
        { name: 'LOADING TYPE', prop: 'expenseByVolume', sortable: true },
        { name: 'WT', prop: 'containerOdometer.value', sortable: true },
        { name: 'VOL', prop: 'id12', sortable: true },
        { name: 'ORDER VALUE', prop: 'expenseCost', sortable: true },
        { name: 'MANAGER', prop: 'manager', sortable: true },
        { name: 'STATUS', prop: 'status', type: 'status', sortable: true },
      ];
    }
    if (this.currentMainIndex == 2) {
      this.headers = [
        { name: 'IMPORT FROM', prop: 'requestToName', sortable: true },
        { name: 'LOCAL C #', prop: 'loadingDate', sortable: true },
        { name: 'CONTAINER #', prop: 'localContainerNumber', sortable: true },
        {
          name: 'DEPT. DATE',
          prop: 'departureDate',
          type: 'date',
          sortable: true,
        },
        {
          name: 'ARRIVAL DATE',
          prop: 'arrivalDate',
          type: 'date',
          sortable: true,
        },
        { name: 'VESSEL NAME', prop: 'totalSKUs', sortable: true },
        { name: 'BOL', prop: 'expenseByWeight', sortable: true },
        { name: 'MBL', prop: 'expenseByVolume', sortable: true },
        { name: 'HBL', prop: 'containerOdometer.value', sortable: true },
        { name: 'PAYMENT', prop: 'id12', sortable: true },
        { name: 'STATUS', prop: 'status', type: 'status', sortable: true },
      ];
    }

    if (this.currentMainIndex == 3) {
      this.headers = [
        { name: 'IMPORT FROM', prop: 'requestToName', sortable: true },
        { name: 'LOCAL C #', prop: 'loadingDate', sortable: true },
        { name: 'CONTAINER #', prop: 'localContainerNumber', sortable: true },
        { name: 'CUSTOM', prop: 'departureDate', type: 'date', sortable: true },
        { name: 'VESSEL', prop: 'arrivalDate', type: 'date', sortable: true },
        { name: 'TRUCKING', prop: 'totalSKUs', sortable: true },
        { name: 'LABOURS', prop: 'expenseByWeight', sortable: true },
        { name: 'OTHER EXPENSE', prop: 'expenseByVolume', sortable: true },
        {
          name: 'COST CALCULATION',
          prop: 'containerOdometer.value',
          sortable: true,
        },
        { name: 'TOTAL EXPENSES', prop: 'id12', sortable: true },
      ];
    }

    if (this.currentMainIndex == 4) {
    }
  }

  getPreference() {
    this.apiService.getPreferredUoms().subscribe((preference: any) => {
      this.preferredUoms = preference;
      const preferenceForContainer = this.preferredUoms.find(
        (item) => item.componentType == 'CONTAINER'
      );
      preferenceForContainer?.componentUoms?.forEach((ele) => {
        const componentUomForm = this.formService.createComponentUomForm();
        this.componentUoms.push(componentUomForm);
      });
      this.preferForm.patchValue(preferenceForContainer);
      this.loadListings();
    });
  }

  get isExport() {
    if (window.location.href.includes('export')) {
      return true;
    } else {
      return false;
    }
  }

  loadListings() {
    if (this.currentMainIndex == 0) {
      this.loadContainerListings();
    }
    if (this.currentMainIndex == 1) {
      this.containersList = [];
    }
  }

  createQuotation() {
    this.router.navigateByUrl(
      'home/container-management/container/quotation/add'
    );
  }
}
