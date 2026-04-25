import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { Component, OnInit, inject, input, output } from '@angular/core';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/service/api.service';
import { ToastrService } from 'ngx-toastr';
import { FormsService } from 'src/app/service/forms.service';
import { UomService } from 'src/app/service/uom.service';
import { BatchModalComponent } from '../../common-modals/batch-modal/batch-modal/batch-modal.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-production',
    templateUrl: './production.component.html',
    styleUrls: ['./production.component.scss'],
    imports: [
        DadyinButtonComponent,
        MatPaginator,
        DatePipe
    ]
})
export class ProductionComponent implements OnInit {
  toastr = inject(ToastrService);
  apiService = inject(ApiService);
  formsService = inject(FormsService);
  uomService = inject(UomService);
  private dialog = inject(MatDialog);

  productionDetails: any;
  productionLogs: any[] = [];
  totalLogs = 0;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  searchTerm = '';
  searchSubject = new Subject<string>();
  readonly productForm = input<UntypedFormGroup>(undefined);

  readonly componentUoms = input<UntypedFormArray>(undefined);
  readonly calculate = output<any>();

  ngOnInit(): void {
    this.initSearch();
    this.loadProductionLogs();
  }

  initSearch() {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm = term;
      this.currentPage = 0;
      this.loadProductionLogs(0);
    });
  }

  loadProductionLogs(page: number = this.currentPage) {
    const productId = Number(this.productForm()?.getRawValue()?.id);
    if (!productId) {
      return;
    }

    this.apiService.getProductionLogsList(productId, page, this.pageSize, this.searchTerm).subscribe({
      next: (response: any) => {
        this.productionLogs = response?.content || [];
        this.totalLogs = response?.totalElements || 0;
        this.pageSize = response?.size || this.pageSize;
        this.currentPage = response?.number || page;
      },
      error: (err: any) => {
        console.log(err);
        this.productionLogs = [];
        this.totalLogs = 0;
        this.toastr.error(err?.error?.userMessage || 'Error loading production logs');
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.loadProductionLogs(this.currentPage);
  }

  onSearchChange(term: string) {
    this.searchSubject.next(term);
  }

  addNewBatch(productionDetails: any) {
    this.openBatchModal(productionDetails);
  }

  openBatchModal(productionDetails: any) {
    const dialogRef = this.dialog.open(BatchModalComponent, {
      width: '80vw',
      maxWidth: '80vw',
      height: '90vh',
      disableClose: true,
      // position: { right: '0', top: '0' },
      panelClass: 'side-sheet-dialog',
      backdropClass: 'dark-backdrop',
      data: { productionDetails, componentUoms: this.componentUoms(), productForm: this.productForm() }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProductionLogs(0);
      }
    });
  }

  async getProductionDetails() {
    const productForm = this.productForm();
    if (!productForm?.getRawValue()?.id) {
      this.toastr.error('Product ID is required,Please save the product first');
      return;
    }
    this.apiService
      .getProductionLogInitialize(Number(productForm.getRawValue()?.id))
      .subscribe({
        next: (response: any) => {
          this.productionDetails = response || [];
          this.addNewBatch(this.productionDetails);
        },
        error: (err: any) => {
          console.log(err);
          this.toastr.error(err?.error?.userMessage || 'Error loading ledger data');
        }
      });
  }

  editBatch(log: any) {
    const batchId = Number(log?.id);
    if (!batchId) {
      this.toastr.error('Invalid batch selected');
      return;
    }
    this.apiService.getProductionLogbyId(batchId).subscribe({
      next: (response: any) => {
        const productionDetails = response || {};
        this.openBatchModal(productionDetails);
      },
      error: (err: any) => {
        console.log(err);
        this.toastr.error(err?.error?.userMessage || 'Error loading batch details');
      }
    });
  }
}
