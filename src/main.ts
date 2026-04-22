import { enableProdMode, APP_INITIALIZER, ErrorHandler, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { StartupServiceFactory } from './app/app-init.service';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatStepperModule } from '@angular/material/stepper';
import { ToastrModule } from 'ngx-toastr';
import { StoreModule } from '@ngrx/store';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './app/shared/shared.module';
import { CommonModule } from '@angular/common';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation, withPreloading, PreloadAllModules, withInMemoryScrolling } from '@angular/router';
import { APP_ROUTES } from './app/app.routes';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { GlobalErrorHandler } from './app/core/global-error-handler';
import { SpinnerInterceptor } from './app/interceptors/spinner.interceptor';
import { CacheInterceptor } from './app/interceptors/cache.interceptor';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { BusinessAccountInterceptor } from './app/interceptors/business-account.interceptor';
import { HTTP_INTERCEPTORS, withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { AppInitService } from './app/app-init.service';

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
        provideRouter(APP_ROUTES, 
          withHashLocation(), 
          withPreloading(PreloadAllModules),
          withInMemoryScrolling({ scrollPositionRestoration: 'top' })
        ),
        importProvidersFrom(CKEditorModule, BrowserModule, CommonModule, SharedModule, FormsModule, ReactiveFormsModule, StoreModule.forRoot({}), ToastrModule.forRoot({
            timeOut: 2500,
            positionClass: 'toast-center-center',
            closeButton: true
        }), MatStepperModule, DragDropModule),
        APPINIT_PROVIDES,
        AppInitService,
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
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi())
    ]
})
  .catch(err => console.error(err));
