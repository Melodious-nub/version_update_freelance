import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, of ,tap} from 'rxjs';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache: Map<string, HttpResponse<any>> = new Map<string, HttpResponse<any>>();

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method !== 'GET') {
      // Bypass caching for non-GET requests
      return next.handle(request);
    }
  
    const cachedResponse: HttpResponse<any> | undefined = this.cache.get(request.url);
    
    const cacheableUrls = [
      'dadyin-api/meta', 
      "dadyin-api/relationaccounts/?filter=businessCategory:'VENDOR'", 
      "dadyin-api/relationaccounts/?filter=businessCategory:'CUSTOMER'", 
      "filter=businessCategory:'VENDOR'&filter=businessLine:'EXPORTER'"
    ];
  
    // Check if the request URL matches one of the cacheable URLs
    const isCacheable = cacheableUrls.some(url => request.url.includes(url));
    const isNonCacheable = request.url.includes('noncache');
  
    if (cachedResponse && isCacheable && !isNonCacheable) {
      // Return the cached response if it exists
      return of(cachedResponse.clone());
    }
  
    
    // No cached response, proceed with the request
    return next.handle(request).pipe(
      // Intercept the response and cache it
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          this.cache.set(request.url, event.clone());
        }
      })
    );
  
  }
}