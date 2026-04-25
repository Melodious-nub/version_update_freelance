import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { HttpService } from 'src/app/service/http.service';
import { apiModules } from 'src/app/shared/constant';
import { MatExpansionModule } from '@angular/material/expansion';

import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { MatIconModule } from '@angular/material/icon';

export interface BusinessBulkExtractRow {
  rowNumber: number;
  businessName: string;
  businessType: string;
  industryType: string;
  businessEmail: string;
  countryCode: string;
  contactNumber: string;
}

export interface BusinessBulkExtractResponse {
  success: boolean;
  totalRows: number;
  rows: BusinessBulkExtractRow[];
}

@Component({
    selector: 'app-bulk-add-dialog',
    templateUrl: './bulk-add-dialog.component.html',
    styleUrls: ['./bulk-add-dialog.component.scss'],
    imports: [
        MatIconModule,
        DadyinButtonComponent,
        MatExpansionModule
    ]
})
export class BulkAddDialogComponent implements OnInit {
  businessListExpanded = true;
  extractedRows: BusinessBulkExtractRow[] = [];
  selectedFile: File | null = null;
  extractLoading = false;
  saveLoading = false;
  selectedFiles: File[] = []; // to store the selected files      this.selectedFiles.push(file);

  constructor(
    public dialogRef: MatDialogRef<BulkAddDialogComponent>,
    private toastr: ToastrService,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {}

  onBack(): void {
    this.dialogRef.close();
  }

  removeFile(file: File): void {
    this.selectedFiles = this.selectedFiles.filter((f) => f !== file);
  }


  onSave(): void {
    if (!this.selectedFile) {
      this.toastr.warning('Please upload an Excel file first.');
      return;
    }
    this.saveLoading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    this.httpService
      .post<{ success?: boolean; message?: string }>(
        `${apiModules.businessBulkUpload}`,
        formData,
        false,
        { showLoader: false }
      )
      .subscribe({
        next: (res) => {
          this.saveLoading = false;
          this.toastr.success(res?.message ?? 'Businesses uploaded successfully.');
          this.dialogRef.close({ success: true });
        },
        error: (err) => {
          this.saveLoading = false;
          this.toastr.error(
            err?.error?.userMessage ?? err?.error?.message ?? 'Upload failed.'
          );
        },
      });
  }

  onFileSelected(event: Event): void {
    console.log(event);
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedFiles.push(file);
    }
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      this.toastr.warning('Please upload an Excel file (.xlsx, .xls or .csv).');
      return;
    }
    this.selectedFile = file;
    this.extractLoading = true;
    const formData = new FormData();
    formData.append('file', file);
    this.httpService
      .post<BusinessBulkExtractResponse>(
        `${apiModules.businessBulkUploadExtract}`,
        formData,
        false,
        { showLoader: false }
      )
      .subscribe({
        next: (res) => {
          this.extractLoading = false;
          if (res?.success && Array.isArray(res?.rows)) {
            this.extractedRows = res.rows;
            this.toastr.success(`Loaded ${this.extractedRows.length} row(s) from file.`);
          } else {
            this.extractedRows = [];
            this.toastr.info('No rows could be extracted from the file.');
          }
        },
        error: (err) => {
          this.extractLoading = false;
          this.toastr.error(
            err?.error?.userMessage ?? err?.error?.message ?? 'Failed to read file.'
          );
        },
      });
    input.value = '';
  }


  downloadSample(): void {
    this.httpService
      .get(apiModules.businessBulkUploadSample, null, {
        Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }, false, {
        responseType: 'blob',
        observe: 'response',
        showLoader: false,
      })
      .subscribe({
        next: (res: any) => {
          const blob = res.body ?? new Blob();
          const cd =
            res.headers?.get?.('content-disposition') ||
            res.headers?.get?.('Content-Disposition') ||
            '';
          const filename =
            this.getFilenameFromContentDisposition(cd) ||
            'business_bulk_upload_template.xlsx';
          const a = document.createElement('a');
          a.href = window.URL.createObjectURL(blob);
          a.download = filename;
          a.click();
          window.URL.revokeObjectURL(a.href);
          this.toastr.success('Template downloaded.');
        },
        error: () => this.toastr.error('Failed to download template.'),
      });
  }

  private getFilenameFromContentDisposition(cd: string): string {
    if (!cd) return '';
    const star = cd.match(/filename\*\s*=\s*([^;]+)/i);
    if (star?.[1]) {
      const value = star[1].trim();
      const parts = value.split("''");
      const encoded = (parts.length > 1 ? parts.slice(1).join("''") : value)
        .trim()
        .replace(/^"|"$/g, '');
      try {
        return decodeURIComponent(encoded);
      } catch {
        return encoded;
      }
    }
    const plain = cd.match(/filename\s*=\s*([^;]+)/i);
    if (plain?.[1]) return plain[1].trim().replace(/^"|"$/g, '');
    return '';
  }

  formatPhone(row: BusinessBulkExtractRow): string {
    const code = row.countryCode?.trim() || '';
    const num = row.contactNumber?.trim() || '';
    if (!num) return '—';
    return code ? `${code} ${num}` : num;
  }
}
