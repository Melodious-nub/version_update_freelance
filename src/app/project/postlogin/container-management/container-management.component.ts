import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-container-management',
  templateUrl: './container-management.component.html',
  styleUrls: ['./container-management.component.scss']
})
export class ContainerManagementComponent implements OnInit {
  centered = false;
  disabled = false;
  unbounded = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  navigate(link: string): void {
    this.router.navigateByUrl(link);
  }

}
