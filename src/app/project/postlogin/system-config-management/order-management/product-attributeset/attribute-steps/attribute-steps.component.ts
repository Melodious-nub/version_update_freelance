import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/service/api.service';
import { CommonService } from 'src/app/service/common.service';
import { UomService } from 'src/app/service/uom.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { ContainerManagementService } from 'src/app/project/postlogin/container-management/service/container-management.service';
import { OrderManagementService } from '../../service/order-management.service';
import { OrderManagementFormsService } from '../../service/order-management-forms.service';
import { CreateAttributeComponent } from './create-attribute/create-attribute.component';

@Component({
    selector: 'app-attribute-steps',
    templateUrl: './attribute-steps.component.html',
    styleUrls: ['./attribute-steps.component.scss'],
    imports: [CreateAttributeComponent]
})
export class AttributeSetStepsComponent implements OnInit {
  // ************* Variable Declarations *************
  currentStepIndex = 0;
  attributeConfigForm: UntypedFormGroup

  currentBusinessAccount: any;


  constructor(
    public uomService: UomService,
    public ordermanagementService: OrderManagementService,
    public commonService: CommonService,
    public toastr: ToastrService,
    public router: Router,
    public apiService: ApiService,
    public ordermanagementFormsService: OrderManagementFormsService,
    public businessAccountService:BusinessAccountService,
    public containerService:ContainerManagementService
  ) {
    this.attributeConfigForm = this.ordermanagementFormsService.createAttributeConfigForm();
  }


  ngOnInit(): void {
    
  }
  
  


  navigate(link:any) {
    this.router.navigateByUrl(link)
  }

}
