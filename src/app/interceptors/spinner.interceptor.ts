import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { finalize, Observable, timeout, catchError } from 'rxjs';
import { SpinnerOverlayService } from '../service/spinner-overlay.service';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {
  
  constructor(private readonly spinnerOverlayService: SpinnerOverlayService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Exclude specific API calls that should not show global loading spinner
    if(req.url.includes('/last-sales-invoices') || 
       req.url.includes('/last-purchase-bills') || 
       req.url.includes('/last-inventory-details')){ 
     return next.handle(req);
    }

    this.spinnerOverlayService.show();
  
    return next.handle(req).pipe(
      // Add a safety timeout of 30 seconds to ensure the spinner never hangs indefinitely
      timeout(30000),
      catchError((error) => {
        // Pass error through, finalize will handle the hide()
        throw error;
      }),
      finalize(() => {
        this.spinnerOverlayService.hide();
      })
    );
  }
}