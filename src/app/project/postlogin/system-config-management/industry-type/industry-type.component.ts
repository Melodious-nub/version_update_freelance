import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { SystemConfigFormsService } from '../service/system-config-forms.service';
import { BusinessAccountService } from '../../business-account/business-account.service';

@Component({
  selector: 'app-industry-type',
  templateUrl: './industry-type.component.html',
  styleUrls: ['./industry-type.component.scss'],
})
export class IndustryTypeComponent implements OnInit {
  

  constructor(
    private router: Router,
    private route: ActivatedRoute,    
    public toastr: ToastrService,
    public systemConfigFormService: SystemConfigFormsService,
  ) {
    
  }

  ngOnInit(): void {
  
  }


}
