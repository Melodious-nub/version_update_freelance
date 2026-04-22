import { Component, OnInit } from '@angular/core';
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
    standalone: true,
    imports: [CreateCategoryComponent]
})
export class CategoryStepsComponent implements OnInit {
  // ************* Variable Declarations *************
  currentStepIndex = 0;
  productCategoryForm: UntypedFormGroup

  currentBusinessAccount: any;


  constructor(
    public uomService: UomService,
    public categorymanagementService: CategoryManagementService,
    public commonService: CommonService,
    public toastr: ToastrService,
    public router: Router,
    public apiService: ApiService,
    public categorymanagementFormsService: CategoryManagementFormsService,
    public businessAccountService:BusinessAccountService,
    public containerService:ContainerManagementService
  ) {
    this.productCategoryForm = this.categorymanagementFormsService.createCategoryForm();
  }


  ngOnInit(): void {
    
  }
  
  


  navigate(link:any) {
    this.router.navigateByUrl(link)
  }

}
