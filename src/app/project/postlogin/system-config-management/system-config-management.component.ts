import { Component, OnInit } from '@angular/core';
import { DadyinButtonComponent } from '../../../shared/widgets/dadyin-button/dadyin-button.component';
import { RouterLink } from '@angular/router';


@Component({
    selector: 'app-system-config-management',
    templateUrl: './system-config-management.component.html',
    styleUrls: ['./system-config-management.component.scss'],
    standalone: true,
    imports: [RouterLink, DadyinButtonComponent],
})
export class SystemConfigManagementComponent implements OnInit {
 
  constructor(
   
  ) {}

  ngOnInit(): void {
   
  }

  
}
