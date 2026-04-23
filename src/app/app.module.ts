import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SpinnerInterceptor } from './interceptors/spinner.interceptor';
import { BusinessAccountInterceptor } from './interceptors/business-account.interceptor';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AppInitService } from './app-init.service';
import { ToastrModule } from 'ngx-toastr';
import { MatStepperModule } from '@angular/material/stepper';
import { StoreModule } from '@ngrx/store';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { CommonModule } from '@angular/common';
import { LandingComponent } from './project/prelogin/landing/landing.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GlobalErrorHandler } from './core/global-error-handler';
import { SocialCallbackComponent } from './project/common/social-callback/social-callback.component';

// APP INITIALIZATION
export function StartupServiceFactory(appInitService: AppInitService) {
  return () => appInitService.Init();
}
const APPINIT_PROVIDES = [AppInitService, {
  provide: APP_INITIALIZER,
  useFactory: StartupServiceFactory,
  deps: [AppInitService],
  multi: true,
}];

@NgModule({
    declarations: [AppComponent],
    imports: [
        CKEditorModule,
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        StoreModule.forRoot({}),
        ToastrModule.forRoot({
            timeOut: 2500,
            positionClass: 'toast-center-center', // Custom position class
            closeButton: true
        }),
        MatStepperModule,
        DragDropModule,
        LandingComponent,
        SocialCallbackComponent
    ],
    providers: [
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
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
