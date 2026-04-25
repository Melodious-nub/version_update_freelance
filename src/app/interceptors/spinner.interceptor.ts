import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SpinnerOverlayService } from '../service/spinner-overlay.service';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {
  private readonly spinnerOverlayService = inject(SpinnerOverlayService);


  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Exclude specific API calls that should not show global loading spinner
    if (req.url.includes('/last-sales-invoices') ||
      req.url.includes('/last-purchase-bills') ||
      req.url.includes('/last-inventory-details')) {
      return next.handle(req);
    }

    return new Observable<HttpEvent<any>>((observer) => {
      this.spinnerOverlayService.show();
      const subscription = next.handle(req).subscribe({
        next: (event) => observer.next(event),
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      });
      
      return () => {
        subscription.unsubscribe();
        this.spinnerOverlayService.hide();
      };
    });
  }
}