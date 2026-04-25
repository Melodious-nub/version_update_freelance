import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-order-management',
    templateUrl: './order-management.component.html',
    styleUrls: ['./order-management.component.scss'],
    standalone: true,
    imports: [RouterOutlet]
})
export class OrderManagementComponent {

    private router = inject(Router);
  constructor() { }

  navigate(link: string): void {
    this.router.navigateByUrl(link);
  }

}
