import { Component, Input, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { SystemConfigFormsService } from '../service/system-config-forms.service';
import { BusinessAccountService } from '../../business-account/business-account.service';

@Component({
    selector: 'app-industry-type',
    templateUrl: './industry-type.component.html',
    styleUrls: ['./industry-type.component.scss'],
    standalone: true,
})
export class IndustryTypeComponent {
  

    private router = inject(Router);
  private route = inject(ActivatedRoute);
  public toastr = inject(ToastrService);
  public systemConfigFormService = inject(SystemConfigFormsService);
  constructor() {
    
  }


}
