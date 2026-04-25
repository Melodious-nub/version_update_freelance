import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { AuthService } from './service/auth.service';
import { TokenService } from './service/token.service';
import { HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from './service/http.service';
import { PrintTemplatesComponent } from './shared/print-templates/print-templates.component';
import { SpinnerOverlayService } from './service/spinner-overlay.service';
import { SpinnerOverlayComponent } from './shared/component/spinner-overlay/spinner-overlay.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet, PrintTemplatesComponent, SpinnerOverlayComponent, AsyncPipe],
})
export class AppComponent implements OnInit {
  currentRoute: string;
  @HostListener('window:beforeunload', ['$event'])
  onWindowClose(event: any): void {
    if (
      window.location.href.includes('edit') ||
      window.location.href.includes('add')
    ) {
      event.preventDefault();
      event.returnValue = false;
    }
  }

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    public http: HttpClient,
    private httpService: HttpService,
    public spinnerOverlayService: SpinnerOverlayService
  ) { }

  ngOnInit() {
    this.loadThemeColors();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.spinnerOverlayService.reset();
      }
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
        if (
          !this.currentRoute.match('/') &&
          !this.currentRoute.includes('resetpassword') &&
          !this.currentRoute.includes('signin') &&
          !this.currentRoute.includes('signup') &&
          !this.currentRoute.includes('select-business-account') &&
          !this.currentRoute.includes('business-details') &&
          !this.currentRoute.includes('forbidden') &&
          !this.currentRoute.includes('landing')
        ) {
          if (this.tokenService.getAccessToken()) {
            this.authService.getCurrentUser().subscribe(
              (response) => {
                if (!response) {
                  this.router.navigateByUrl('/signin');
                }
              },
              (err) => {
                this.authService.logout();
              }
            );
          } else {
            this.router.navigateByUrl('/signin');
          }
        }
      }
    });

    if (this.tokenService.getAccessToken()) {
      this.authService.getCurrentUser().subscribe(
        (response) => {
          if (!response) {
            this.router.navigateByUrl('/signin');
          }
        },
        (err) => {
          this.authService.logout();
        }
      );
    }
  }

  getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
      });
    } else {

    }
  }

  getIpAddress() {
    this.http
      .get('https://api.ipify.org?format=jsonp&callback=getIP')
      .subscribe((response: any) => {
      });
  }

  loadThemeColors() {
    // Default theme primary colors (from styles.scss :root)
    const defaultTheme = {
      primaryColor: '#0065F4',
      primaryLight: '#d5e7fa',
      secondaryColor: '#dfeffb',
      secondaryLight: '#f3f9fd',
    };

    // Apply default theme on load; API can override later if needed
    // this.setCSSVariables(defaultTheme);

    // For production: replace 'your-api-endpoint' with your actual API endpoint to load business-specific theme
    // this.httpService.get('your-api-endpoint', null, null, false, { showLoader: false })
    //   .subscribe(
    //     (colors: any) => {
    //       this.setCSSVariables(colors);
    //     },
    //     (error) => {
    //       console.error('Failed to load theme colors:', error);
    //       this.setCSSVariables(defaultTheme);
    //     }
    //   );
  }

  setCSSVariables(colors: any) {
    const root = document.documentElement;
    Object.keys(colors).forEach(key => {
      let cssVarName = key;
      if (!cssVarName.startsWith('--')) {
        cssVarName = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
      }
      root.style.setProperty(cssVarName, colors[key]);
    });
  }
}
