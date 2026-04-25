import { Component, inject } from '@angular/core';
import {UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { CommonService } from 'src/app/service/common.service';
import { UomService } from 'src/app/service/uom.service';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { ContainerManagementService } from 'src/app/project/postlogin/container-management/service/container-management.service';
import { CategoryManagementService } from '../../service/category-management.service';
import { CategoryManagementFormsService } from '../../service/category-management-forms.service';
import { CreateCategoryComponent } from './create-category/create-category.component';

@Component({
    selector: 'app-category-steps',
    templateUrl: './category-steps.component.html',
    styleUrls: ['./category-steps.component.scss'],
    imports: [CreateCategoryComponent]
})
export class CategoryStepsComponent {
  uomService = inject(UomService);
  categorymanagementService = inject(CategoryManagementService);
  commonService = inject(CommonService);
  toastr = inject(ToastrService);
  router = inject(Router);
  apiService = inject(ApiService);
  categorymanagementFormsService = inject(CategoryManagementFormsService);
  businessAccountService = inject(BusinessAccountService);
  containerService = inject(ContainerManagementService);

  // ************* Variable Declarations *************
  currentStepIndex = 0;
  productCategoryForm: UntypedFormGroup

  currentBusinessAccount: any;


  constructor() {
    this.productCategoryForm = this.categorymanagementFormsService.createCategoryForm();
  }
  
  


  navigate(link:any) {
    this.router.navigateByUrl(link)
  }

}
