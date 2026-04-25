import { enableProdMode, APP_INITIALIZER, ErrorHandler, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OverlayModule } from '@angular/cdk/overlay';
import { provideRouter, withHashLocation, withPreloading, PreloadAllModules, withRouterConfig } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideToastr } from 'ngx-toastr';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { AppInitService } from './app/app-init.service';
import { register } from 'swiper/element/bundle';

// Register Swiper custom elements
register();

// APP INITIALIZATION
export function StartupServiceFactory(appInitService: AppInitService) {
  return () => appInitService.Init();
}

import { GlobalErrorHandler } from './app/core/global-error-handler';
import { BusinessAccountInterceptor } from './app/interceptors/business-account.interceptor';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { CacheInterceptor } from './app/interceptors/cache.interceptor';
import { SpinnerInterceptor } from './app/interceptors/spinner.interceptor';

// Standalone Routes
import { routes } from './app/app.routes';

const APPINIT_PROVIDES = [AppInitService, {
  provide: APP_INITIALIZER,
  useFactory: StartupServiceFactory,
  deps: [AppInitService],
  multi: true,
}];

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    // Modern Standalone APIs
    provideZoneChangeDetection(),provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(
      routes,
      withHashLocation(),
      withPreloading(PreloadAllModules),
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    ),
    provideStore({}),
    provideEffects([]),
    provideStoreDevtools(),
    provideToastr({
      timeOut: 2500,
      positionClass: 'toast-center-center',
      closeButton: true
    }),
    importProvidersFrom(OverlayModule),


    // Preserved Interceptors and Initializers
    APPINIT_PROVIDES,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BusinessAccountInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SpinnerInterceptor,
      multi: true,
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
  ]
}).catch(err => console.error(err));
