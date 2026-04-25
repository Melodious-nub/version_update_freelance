import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-container-management',
    templateUrl: './container-management.component.html',
    styleUrls: ['./container-management.component.scss'],
    standalone: true
})
export class ContainerManagementComponent {
  centered = false;
  disabled = false;
  unbounded = false;

  constructor(private router: Router) { }

  navigate(link: string): void {
    this.router.navigateByUrl(link);
  }

}
