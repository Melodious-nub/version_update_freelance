import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-social-broadcast-management',
  templateUrl: './social-broadcast-management.component.html',
  styleUrls: ['./social-broadcast-management.component.scss']
})
export class SocialBroadcastManagementComponent implements OnInit {
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
