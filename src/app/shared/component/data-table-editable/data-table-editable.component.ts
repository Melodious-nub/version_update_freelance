import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { UomService } from 'src/app/service/uom.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'data-table-editable',
    templateUrl: './data-table-editable.component.html',
    styleUrls: ['./data-table-editable.component.scss']
})
export class DataTableEditableComponent implements OnInit {
    imgUrl: any = environment.imgUrl
    @Input() set data(tableData) {
        this.tableData = tableData;
        this.loadTable();
    }
    @Input() pageConfig: any

    @Input() set filterData(data) {
        this.dataSource.filter = data ? data.trim().toLowerCase() : '';
    }
    @Input() set searchTerm(value) {
        this.dataSource.filter = (typeof value === 'string' ? value.trim().toLowerCase() : value) || '';
        this.getSearchValue = value;
    }
    @Output() actionClick = new EventEmitter();

    @Input() headers: any;
    @Input() actions: any = [{ label: '', icon: '' }];
    @Input() userShow: boolean = false;

    @Output() pageChange = new EventEmitter();
    @Output() sortChange = new EventEmitter();
    @Output() editData = new EventEmitter();
    @Output() uomChange = new EventEmitter();
    @ViewChild(MatSort, { static: false }) set sort(sortElm: MatSort) {
        if (this.dataSource) {
            this.dataSource.sort = sortElm;
        }
        this.sortTable = sortElm;
    }

    @ViewChild('paginator') paginator: MatPaginator;
  @Output() rowChange = new EventEmitter<{ row: any, field: string, value: any }>();

    public config: any;
    public tableData: any;
    public businessId: any;
    public dataSource = new MatTableDataSource();
    public filter: any = [];
    public getSearchValue: any;
    public displayedColumns: any[]
    private sortTable: MatSort;




    customFilterPredicate(data: any, filterObj: any): boolean {
        let result = true;
        if (typeof filterObj === 'object') {
            for (const key in filterObj) {
                if (filterObj.hasOwnProperty(key)) {
                    const filterValue = filterObj[key];
                    if (key !== 'query') {
                        if (filterValue) {
                            let finalRes = data[key];
                            if (finalRes) {
                                result = result && finalRes.toString().toLowerCase().includes(filterValue.toLowerCase());
                            } else {
                                result = false;
                            }
                        }
                    } else {
                        const dataStr = Object.keys(data).reduce((acc, curKey) => {
                            let finalRes = data[curKey];
                            return acc + finalRes;
                        }, '');
                        result = result && dataStr.toLowerCase().includes(filterValue.toLowerCase());
                    }
                }
            }
        } else {
            const dataStr = Object.keys(data).reduce((acc, curKey) => {
                let finalRes = data[curKey];
                return acc + finalRes;
            }, '');
            result = dataStr.toLowerCase().includes(filterObj.toLowerCase());
        }
        return result;
    }

    constructor(public uomService: UomService, public router: Router, public businessAccountService: BusinessAccountService) { }

    ngOnInit(): void {
        this.displayedColumns = this.headers.map(col => col.prop);
        this.businessId = this.businessAccountService.currentBusinessAccountId

    }

    ngAfterViewInit(): void {
        this.sortTable.sortChange.subscribe(() => this.paginator.pageIndex = 0);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;

    }

    ngOnChanges() {
        if (this.dataSource) {
            this.dataSource.filter = (typeof this.getSearchValue === 'string' ?
                this.getSearchValue.trim().toLowerCase() : this.getSearchValue) || '';
        }
    }

    onActionArrayClick(action, rowIndex, row) {     
        this.actionClick.emit({ action, rowIndex, row });
    }

    loadTable() {

        this.dataSource = new MatTableDataSource(this.tableData);
        this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
    }

    editRecord(index, data): void {
        this.editData.emit({ index, data });
    }

    onPageChange(data): void {

        this.pageChange.emit(data);
    }

    onUOMChange(data) {
        this.uomChange.emit(data);
    }

    onSortChange(sortCol: Sort): void {
        let sortData = null;
        sortData = sortCol;
        this.sortChange.emit(sortCol);
    }
    gotToLink(link: any) {
        this.router.navigateByUrl(link)

    }


    /// related to invite 

    check(action, row) {
        if (action.label == 'Resend') {
            return row?.showResendInviteButton ? true : false
        }
        if (action.label == 'Accept') {
            return row?.showAcceptRelationButton ? true : false
        }
        if (action.label == 'Reject') {
            return row?.showRejectRelationButton ? true : false
        }
        return true
    }


    getMinWidth(col: any): string {
        switch (col.prop) {
          case 'addressLine':
          case 'description':
            return '400px'; // Minimum width for addressLine and description columns
          case 'transactionId':
            return '200px'; // Custom min-width for transactionId (example)
          // Add more conditions as necessary
          default:
            return 'unset'; // Default value for columns without specific conditions
        }
      }
    
      // Function to get the maximum width (as per your original logic)
      getMaxWidth(col: any): string {
        if (col?.maxWidth) {
          return col.maxWidth; // If maxWidth is defined in column object
        }
        if (col.prop === 'productCode' || col.prop === 'templateCode') {
          return '300px'; // Example: Set max width for productCode and templateCode
        }
        return 'unset'; // Default for columns without specific maxWidth
      }

    onEdit(event,row: any, field: string) {
        this.rowChange.emit({ row, field, value: event.target.value });
      }
    


}
