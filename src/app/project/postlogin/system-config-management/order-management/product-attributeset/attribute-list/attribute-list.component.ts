import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, input } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { OrderManagementService } from '../../service/order-management.service';
import { DataTableComponent } from '../../../../../../shared/component/data-table/data-table.component';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { SearchFilterComponent } from '../../../../../../shared/component/search-filter/search-filter.component';

@Component({
    selector: 'app-attribute-list',
    templateUrl: './attribute-list.component.html',
    styleUrls: ['./attribute-list.component.scss'],
    imports: [
        RouterLink,
        SearchFilterComponent,
        DadyinButtonComponent,
        DataTableComponent,
    ]
})
export class AttributeListComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  apiService = inject(ApiService);
  http = inject(HttpClient);
  ordermanagementService = inject(OrderManagementService);

  attributeSetList: any[] = []
  filterValue
  public headers = [
    { name: 'NAME ATTRIBUTE SET', prop: 'description', sortable: true },
    { name: 'TRANSACTION CATEGORY', prop: 'transactionCategory', sortable: true },
    { name: '# OF ATTRIBUTES', prop: 'attributeNumber', sortable: true },
    { name: 'ACTIONS', prop: 'action', type: 'menu' }
  ];

  public tabelActions: any = [
    {
      label: 'Edit',
      icon: 'edit',
    },
  ];
  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'audit.lastModifiedDate,desc';

  readonly role = input<any>(undefined);

  public pageConfig: any = {
    itemPerPage: 20,
    sizeOption: [20, 50, 75, 100],
  };

  ngOnInit() {

    this.loadAllAttributeSets()

  }



  onActionClick(event) {
    ;
    switch (event.action.label) {
      case 'Edit':
        if (event?.row?.id) {
          this.router.navigateByUrl(
            'home/order-management/' + this.role() + '/rfq/edit/' + event.row.id
          );
        }
        break;

      case 'Copy':

        break;

      case 'Download':

        break;
    }
  }



  onInput(filterValue: string): void {
    this.filterValue = filterValue;
  }

  editRecord(event): void {
    this.router.navigateByUrl(
      'home/system-config/order-management/product-attributeset/edit/' + event.data.id
    );
  }

  sort(event) {
    if (event.active == 'description') {
      this.sortQuery = event.active + ',' + event.direction;
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
  }


  addAttributeConfig() {
    this.router.navigateByUrl('/home/system-config/order-management/product-attributeset/add')
  }

  loadAllAttributeSets() {
    this.ordermanagementService
      .getAllproductAttributeSets()
      .subscribe((res) => {
        this.attributeSetList = res;
        this.attributeSetList.map((it) => { it.attributeNumber = it.attributes?.length })
        this.pageConfig.totalElements = res?.totalElements
        this.pageConfig.totalPages = res?.totalPages
      });
  }


}
