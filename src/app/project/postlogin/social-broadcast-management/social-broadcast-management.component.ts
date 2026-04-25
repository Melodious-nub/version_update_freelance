import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-social-broadcast-management',
    templateUrl: './social-broadcast-management.component.html',
    styleUrls: ['./social-broadcast-management.component.scss'],
    imports: [RouterOutlet]
})
export class SocialBroadcastManagementComponent {
  private router = inject(Router);

  centered = false;
  disabled = false;
  unbounded = false;

  navigate(link: string): void {
    this.router.navigateByUrl(link);
  }
}
