import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { productTemplate } from 'src/app/shared/constant';
import { TokenService } from 'src/app/service/token.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

export type ProductBulkUploadResponse = {
  success: boolean;
  totalRows: number;
  successCount: number;
  failureCount: number;
  errors?: string[];
  message?: string;
};

export type ProductBulkUploadSample = {
  blob: Blob;
  filename: string;
};

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  additionalCostValues: any = [];
  productSubTypes: any = [];
  clonePayload: any = null;
  // Store search and filter state for navigation
  savedSearchValue: string = '';
  savedFilterValue: string = '';

  constructor(private httpClient: HttpClient, private tokenService: TokenService) {}

  private buildAuthHeaders(): HttpHeaders | null {
    try {
      const token = this.tokenService.getAccessToken();
      if (!token) return null;
      return new HttpHeaders({ Authorization: `Bearer ${token}` });
    } catch (e) {
      return null;
    }
  }

  getRawMaterialPricing(productId: string | number, prompt: string) {
    const url = `${environment.apiUrl}${
      productTemplate.rawMaterialPrice
    }?productId=${encodeURIComponent(productId)}&prompt=${prompt ?? ''}`;
    return this.httpClient.get(url, { responseType: 'text' }).toPromise();
  }

  downloadBulkUploadSampleExcelTemplate(): Observable<ProductBulkUploadSample> {
    const url = `${environment.apiUrl}${productTemplate.bulkUploadSampleExcelTemplate}`;
    const headers = new HttpHeaders({
      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    return new Observable<ProductBulkUploadSample>((subscriber) => {
      const sub = this.httpClient
        .get(url, { headers, observe: 'response', responseType: 'blob' })
        .subscribe({
          next: (res: HttpResponse<Blob>) => {
            const blob = res.body ?? new Blob();
            const contentDisposition =
              res.headers.get('content-disposition') ??
              res.headers.get('Content-Disposition') ??
              '';
            const filename =
              this.extractFilenameFromContentDisposition(contentDisposition) ||
              'product_bulk_upload_template.xlsx';
            subscriber.next({ blob, filename });
            subscriber.complete();
          },
          error: (err) => subscriber.error(err),
        });

      return () => sub.unsubscribe();
    });
  }

  bulkUploadProducts(file: File): Observable<ProductBulkUploadResponse> {
    const url = `${environment.apiUrl}${productTemplate.bulkUploadProducts}`;
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient.post<ProductBulkUploadResponse>(url, formData);
  }

  private extractFilenameFromContentDisposition(contentDisposition: string): string {
    if (!contentDisposition) return '';

    // Examples:
    // - attachment; filename="product_bulk_upload_template.xlsx"
    // - attachment; filename*=UTF-8''product_bulk_upload_template.xlsx
    const filenameStarMatch = contentDisposition.match(/filename\*\s*=\s*([^;]+)/i);
    if (filenameStarMatch?.[1]) {
      const value = filenameStarMatch[1].trim();
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

    const filenameMatch = contentDisposition.match(/filename\s*=\s*([^;]+)/i);
    if (filenameMatch?.[1]) {
      return filenameMatch[1].trim().replace(/^"|"$/g, '');
    }
    return '';
  }
  autoPostGeneration(productId: string | number) {
    const url = `${environment.pyApiUrl}post_generation/auto_post`;
    const headers = this.buildAuthHeaders();
    const options: any = {};
    if (headers) options.headers = headers;
    const body = { product_id: productId };
    return this.httpClient.post(url, body, options).toPromise();
  }




  
}
