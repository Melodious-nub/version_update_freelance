import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-social-broadcast-management',
    templateUrl: './social-broadcast-management.component.html',
    styleUrls: ['./social-broadcast-management.component.scss'],
    imports: [RouterOutlet]
})
export class SocialBroadcastManagementComponent {
  centered = false;
  disabled = false;
  unbounded = false;

  constructor(private router: Router) { }

  navigate(link: string): void {
    this.router.navigateByUrl(link);
  }
}
