import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-bill-management',
    templateUrl: './bill-management.component.html',
    styleUrls: ['./bill-management.component.scss'],
    imports: [RouterOutlet]
})
export class BillManagementComponent {  router = inject(Router);


}
