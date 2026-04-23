import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-users-management',
    templateUrl: './users-management.component.html',
    styleUrls: ['./users-management.component.scss'],
    standalone: true,
    imports: [RouterOutlet]
})
export class UsersManagementComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
