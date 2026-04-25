import { Component, inject } from '@angular/core';
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
export class AttributeSetStepsComponent {
  uomService = inject(UomService);
  ordermanagementService = inject(OrderManagementService);
  commonService = inject(CommonService);
  toastr = inject(ToastrService);
  router = inject(Router);
  apiService = inject(ApiService);
  ordermanagementFormsService = inject(OrderManagementFormsService);
  businessAccountService = inject(BusinessAccountService);
  containerService = inject(ContainerManagementService);

  // ************* Variable Declarations *************
  currentStepIndex = 0;
  attributeConfigForm: UntypedFormGroup

  currentBusinessAccount: any;


  constructor() {
    this.attributeConfigForm = this.ordermanagementFormsService.createAttributeConfigForm();
  }
  
  


  navigate(link:any) {
    this.router.navigateByUrl(link)
  }

}
