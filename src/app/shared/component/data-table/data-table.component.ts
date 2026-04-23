import { SelectionModel } from '@angular/cdk/collections';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort, MatSortHeader } from '@angular/material/sort';
import { MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { Router } from '@angular/router';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { ApiService } from 'src/app/service/api.service';
import { UomService } from 'src/app/service/uom.service';
import { environment } from 'src/environments/environment';
import { NumberFormatterPipe } from '../../pipes/number-formatter.pipe';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { MatBadge } from '@angular/material/badge';
import { MatIcon } from '@angular/material/icon';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltip } from '@angular/material/tooltip';
import { DadyinButtonComponent } from '../../widgets/dadyin-button/dadyin-button.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgFor, NgIf, NgStyle, NgClass, SlicePipe, DatePipe } from '@angular/common';

@Component({
    selector: 'data-table',
    templateUrl: './data-table.component.html',
    styleUrls: ['./data-table.component.scss'],
    standalone: true,
    imports: [
        MatTable,
        MatSort,
        NgFor,
        MatColumnDef,
        NgIf,
        MatHeaderCellDef,
        MatHeaderCell,
        NgStyle,
        ExtendedModule,
        MatCheckbox,
        MatCellDef,
        MatCell,
        MatSortHeader,
        NgClass,
        DadyinButtonComponent,
        MatTooltip,
        NgbTooltip,
        MatIcon,
        MatBadge,
        FormsModule,
        NgSelectModule,
        MatHeaderRowDef,
        MatHeaderRow,
        MatRowDef,
        MatRow,
        MatPaginator,
        SlicePipe,
        DatePipe,
        NumberFormatterPipe,
    ],
})
export class DataTableComponent implements OnInit {
  initialSelection = [];
  allowMultiSelect = true;
  selection = new SelectionModel<any>(
    this.allowMultiSelect,
    this.initialSelection
  );

  imgUrl: any = environment.imgUrl;
  @Input() set data(tableData) {
    this.tableData = tableData;
    if (Array.isArray(tableData)) {
      this.tableData.map(item => {
        if (item?.buyingType == 'CONTAINER_20_FT') {
          item.buyingType = '20_FT';
        }
        if (item?.buyingType == 'CONTAINER_40_FT') {
          item.buyingType = '40_FT';
        }
        if (item?.buyingType == 'CONTAINER_40_FT_HQ') {
          item.buyingType = '40_FT_HQ';
        }
      });
    }
    this.loadTable();
  }
  @Input() pageConfig: any;

  @Input() set filterData(data) {
    this.dataSource.filter = data ? data.trim().toLowerCase() : '';
  }
  @Input() set searchTerm(value) {
    this.dataSource.filter =
      (typeof value === 'string' ? value.trim().toLowerCase() : value) || '';
    this.getSearchValue = value;
  }
  @Output() actionClick = new EventEmitter();
  @Output() rowSelection = new EventEmitter();
  @Input() width: any = 'unset';
  @Input() height: any = '90vh';
  @Input() headers: any;
  @Input() actions: any = [{ label: '', icon: '' }];
  @Input() userShow: boolean = false;
  @Input() tooltipContent: any;

  @Output() pageChange = new EventEmitter();
  @Output() sortChange = new EventEmitter();
  @Output() editData = new EventEmitter();
  @Output() uomChange = new EventEmitter();
  @Output() tooltipShow = new EventEmitter();
  @Output() tooltipHide = new EventEmitter();
  @ViewChild(MatSort, { static: false }) set sort(sortElm: MatSort) {
    if (this.dataSource) {
      this.dataSource.sort = sortElm;
    }
    this.sortTable = sortElm;
  }

  @ViewChild('paginator') paginator: MatPaginator;

  public config: any;
  public tableData: any;
  public businessId: any;
  public dataSource = new MatTableDataSource();
  public filter: any = [];
  public getSearchValue: any;
  public displayedColumns: any[];
  private sortTable: MatSort;

  @Output() rowChange = new EventEmitter<{
    row: any;
    field: string;
    value: any;
  }>();

  getStatusChipClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'draft':
        return 'chip-draft';
      case 'published':
      case 'active':
      case 'completed':
      case 'complete':
        return 'chip-published';
      case 'approved':
        return 'chip-approved';
      case 'rejected':
      case 'inactive':
        return 'chip-rejected';
      case 'scheduled':
      case 'running':
      case 'in-progress':
        return 'chip-scheduled';
      default:
        return 'chip-default';
    }
  }

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
                result =
                  result &&
                  finalRes
                    .toString()
                    .toLowerCase()
                    .includes(filterValue.toLowerCase());
              } else {
                result = false;
              }
            }
          } else {
            const dataStr = Object.keys(data).reduce((acc, curKey) => {
              let finalRes = data[curKey];
              return acc + finalRes;
            }, '');
            result =
              result &&
              dataStr.toLowerCase().includes(filterValue.toLowerCase());
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

  constructor(
    public uomService: UomService,
    public apiService: ApiService,
    public router: Router,
    public businessAccountService: BusinessAccountService
  ) { }

  ngOnInit(): void {
    this.displayedColumns = this.headers.map((col) => col.prop);
    this.businessId = this.businessAccountService.currentBusinessAccountId;
  }

  ngAfterViewInit(): void {
    this.sortTable.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges() {
    if (this.dataSource) {
      this.dataSource.filter =
        (typeof this.getSearchValue === 'string'
          ? this.getSearchValue.trim().toLowerCase()
          : this.getSearchValue) || '';
    }
  }

  onActionArrayClick(action, rowIndex, row) {
    this.actionClick.emit({ action, rowIndex, row });
  }

  loadTable() {
    this.dataSource = new MatTableDataSource(this.tableData);
    this.dataSource.filterPredicate = this.customFilterPredicate.bind(this);
  }

  editRecord(index, data, event?: MouseEvent): void {
    // Don't open product if user is selecting text
    if (event && this.getSelectionText()) {
      return;
    }
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
    this.router.navigateByUrl(link);
  }

  // Function to get the minimum width based on column properties
  getMinWidth(col: any): string {
    if (col?.minWidth) {
      return col.minWidth; // If maxWidth is defined in column object
    }
    switch (col.prop) {
      case 'addressLine':
        return '150px'; // Minimum width for addressLine and description columns
      case 'description':
        return '300px'; // Minimum width for addressLine and description columns
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

  getCellNgClass(col: any): { [key: string]: boolean } {
    const o: { [key: string]: boolean } = { 'tooltip-enabled': !!col?.isTooltip };
    if (col?.cellClass) {
      o[col.cellClass] = true;
    }
    return o;
  }

  /// related to invite

  check(action, row) {
    // Generic action gating by row status (opt-in per action)
    try {
      if (action?.showOnStatus && Array.isArray(action.showOnStatus)) {
        const status = String(row?.status || '').toLowerCase();
        return action.showOnStatus.map((s: any) => String(s).toLowerCase()).includes(status);
      }
    } catch (e) {
      // ignore
    }
    if (action.label == 'Resend') {
      return row?.showResendInviteButton ? true : false;
    }
    if (action.label == 'Accept') {
      return row?.showAcceptRelationButton ? true : false;
    }
    if (action.label == 'Reject') {
      return row?.showRejectRelationButton ? true : false;
    }
    return true;
  }

  navigateToPayment(row) {
    this.router.navigateByUrl(
      'home/quick-checkout/order/' + row.id + '?currentMainIndex=1'
    );
  }

  onEdit(event, row: any, field: string) {
    this.rowChange.emit({ row, field, value: event });
  }

  isOptionDisabled(item, items) {
    return items?.includes(item?.id?.toString()) ? true : false;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected == numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row: any) =>
        this.selection.select(row.id)
      );
    this.rowSelection.emit(this.selection.selected);
  }

  onSelectRow(row) {
    this.selection.toggle(row.id);
    this.rowSelection.emit(this.selection.selected);
  }

  clearSelection(): void {
    this.selection.clear();
  }

  // Simplified tooltip methods
  private hideTimeout: any = null;
  private currentTooltipRef: any = null;
  private isMouseOverTooltip = false;
  private tooltipElement: HTMLElement | null = null;
  private currentTooltipRow: any = null;
  private currentTooltipProp: string | null = null;

  showPopover(row: any, event: MouseEvent, prop: string, tooltipRef?: any) {
    // If same tooltip is already open, keep it open (prevent closing/reopening)
    if (this.currentTooltipRow === row && this.currentTooltipProp === prop && this.currentTooltipRef === tooltipRef) {
      if (tooltipRef) {
        try {
          tooltipRef.open();
        } catch (e) {
          // Tooltip might already be open, ignore
        }
      }
      return;
    }
    
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    this.removeHandlers();
    if (this.currentTooltipRef && this.currentTooltipRef !== tooltipRef) this.currentTooltipRef.close();
    
    this.currentTooltipRef = tooltipRef;
    this.currentTooltipRow = row;
    this.currentTooltipProp = prop;
    this.isMouseOverTooltip = false;
    if (tooltipRef) tooltipRef.open();
    this.tooltipShow.emit({ row, event, prop });
    setTimeout(() => this.attachHandlers(), 100);
  }

  hidePopover() {
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => {
      if (!this.isMouseOverTooltip) this.closeTooltip();
    }, 200);
  }

  private attachHandlers() {
    if (this.tooltipElement?.['__tooltipEnterHandler']) return;
    const tooltip = document.querySelector('.tooltip.show, .tooltip') as HTMLElement;
    if (tooltip && this.isVisible(tooltip)) {
      this.tooltipElement = tooltip;
      const enter = () => { this.isMouseOverTooltip = true; if (this.hideTimeout) clearTimeout(this.hideTimeout); };
      const leave = () => { this.isMouseOverTooltip = false; this.closeTooltip(); };
      tooltip.addEventListener('mouseenter', enter, { passive: true });
      tooltip.addEventListener('mouseleave', leave, { passive: true });
      (tooltip as any).__tooltipEnterHandler = enter;
      (tooltip as any).__tooltipLeaveHandler = leave;
    }
  }

  private isVisible(el: HTMLElement): boolean {
    const s = window.getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0' && el.offsetParent !== null;
  }

  private removeHandlers() {
    if (this.tooltipElement) {
      const enter = (this.tooltipElement as any).__tooltipEnterHandler;
      const leave = (this.tooltipElement as any).__tooltipLeaveHandler;
      if (enter) this.tooltipElement.removeEventListener('mouseenter', enter);
      if (leave) this.tooltipElement.removeEventListener('mouseleave', leave);
      delete (this.tooltipElement as any).__tooltipEnterHandler;
      delete (this.tooltipElement as any).__tooltipLeaveHandler;
    }
    this.tooltipElement = null;
  }

  private closeTooltip() {
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    this.isMouseOverTooltip = false;
    this.removeHandlers();
    if (this.currentTooltipRef) {
      this.currentTooltipRef.close();
      this.currentTooltipRef = null;
    }
    this.currentTooltipRow = null;
    this.currentTooltipProp = null;
    this.tooltipHide.emit();
  }

  getSelectionText(): string {
    if (window.getSelection) {
      return window.getSelection().toString();
    }
    return '';
  }
}
