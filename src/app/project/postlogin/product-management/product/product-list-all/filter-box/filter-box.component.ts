import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { TokenService } from 'src/app/service/token.service';
import { ProductManagementService } from '../../../service/product-management.service';
import { Subject, debounceTime, distinctUntilChanged, fromEvent, switchMap, tap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription } from '@angular/material/expansion';
import { DadyinButtonComponent } from '../../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-filter-box',
    templateUrl: './filter-box.component.html',
    styleUrls: ['./filter-box.component.scss'],
    standalone: true,
    imports: [MatIcon, DadyinButtonComponent, FormsModule, ReactiveFormsModule, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription, MatCheckbox],
    providers: [DatePipe]
})
export class FilterBoxComponent implements OnInit {
  @HostListener('document:click', ['$event']) onDocumentClick(event) {
    this.openFilter=false
   }
  openFilter=false;
  @Input() products: any;
  @Output() emitFilterProducts: EventEmitter<any> = new EventEmitter();
  filterForm: UntypedFormGroup;
  createdByArray: any = [];
  byTypeArray: any = [];
  bySubtypeArray: any = [];
  byProductCategoryArray: any = [];
  searchByCreatedNotifier: any = new Subject();
  searchByTypeNotifier: any = new Subject();
  searchBySubtypeNotifier: any = new Subject();
  searchByProductCategoryNotifier: any = new Subject();
  dateFormat: string = "yyyy-MM-ddThh:mm:ss";
  filterCount: number = 0;

  constructor(
    private formbuilder: UntypedFormBuilder,
    private businessAccountService: BusinessAccountService,
    private tokenService: TokenService,
    private productmanagementService: ProductManagementService,
    private datePipe: DatePipe
  ) {
    this.filterForm = this.formbuilder.group({
      isFavourite: [null],
      isPackagingMaterial: [null],
      isRawMaterial: [null],
      isSaleable: [null],
      isSupplies: [null],
      DELETED:[null],
      isQuickCheckoutEligible: [null],
      createdByFormArray: this.formbuilder.array([]),
      byTypeFormArray: this.formbuilder.array([]),
      bySubtypeFormArray: this.formbuilder.array([]),
      byProductCategoryFormArray: this.formbuilder.array([]),
      costMin: [null, Validators.min(0)],
      costMax: [null, Validators.min(0)],
      dateMin: [null],
      dateMax: [null],
      createdSearchString: [null],
      typeSearchString: [null],
      subtypeSearchString: [null],
      categorySearchString:[null]
    });

  }

  ngOnInit(): void {
    this.searchByTypeNotifier.pipe(debounceTime(500)).subscribe(data => this.searchByType());
    this.searchBySubtypeNotifier.pipe(debounceTime(500)).subscribe(data => this.searchBySubtype());
    this.searchByCreatedNotifier.pipe(debounceTime(500)).subscribe(data => this.searchByCreated());
    this.searchByProductCategoryNotifier.pipe(debounceTime(500)).subscribe(data => this.searchByProductCategory());
    this.businessAccountService.getAllUsersForFilter().subscribe({
      next: (val) => {
        val.forEach((obj) => {
          this.createdByFormArray.push(this.formbuilder.control(false));
          this.createdByArray.push(obj);
        });
      }
    });

    let productFilter = JSON.parse(localStorage.getItem("productFilter"));
    if(productFilter != null) {
      this.filterForm.patchValue(productFilter);
    }
    let count = JSON.parse(localStorage.getItem("filterCount"));
    if(count != null) {
      this.filterCount = count;
    }
  }

  get createdByFormArray() {
    return this.filterForm.get('createdByFormArray') as UntypedFormArray;
  }

  get byTypeFormArray() {
    return this.filterForm.get('byTypeFormArray') as UntypedFormArray;
  }

  get bySubtypeFormArray() {
    return this.filterForm.get('bySubtypeFormArray') as UntypedFormArray;
  }

  get byProductCategoryFormArray() {
    return this.filterForm.get('byProductCategoryFormArray') as UntypedFormArray;
  }

  searchUser(event) {
    event.stopPropagation();
  }

  searchByCreated() {
    this.createdByFormArray.clear();
    this.createdByArray = this.createdByArray.filter(obj => {
      for (let data in obj)
        if (typeof obj[data] == "string") {
          if (obj[data].toLowerCase().includes((this.filterForm.get('createdSearchString').value).toLowerCase())) {
            this.createdByFormArray.push(this.formbuilder.control(false));
            return obj;
          }
        }
    });
  }

  searchByType() {
    this.productmanagementService.getProductTypeBySearch(null, null, "id,desc", this.filterForm.get('typeSearchString').value).subscribe((res) => {
      this.byTypeFormArray.clear();
      this.byTypeArray = [];
      res.content.forEach((obj) => {
        this.byTypeFormArray.push(this.formbuilder.control(false));
        this.byTypeArray.push(obj);
      })
    });
  }

  searchBySubtype() {
    this.productmanagementService.getProductSubTypeBySearch(null, null, "id,desc", this.filterForm.get('subtypeSearchString').value).subscribe((res) => {
      this.bySubtypeFormArray.clear();
      this.bySubtypeArray = [];
      res.content.forEach((obj) => {
        this.bySubtypeFormArray.push(this.formbuilder.control(false));
        this.bySubtypeArray.push(obj);
      })
    });
  }

  searchByProductCategory() {
    this.productmanagementService.getCustomerCategory(this.filterForm.get('categorySearchString').value).subscribe((res) => {
      this.byProductCategoryFormArray.clear();
      this.byProductCategoryArray = [];
      res.forEach((obj) => {
        this.byProductCategoryFormArray.push(this.formbuilder.control(false));
        this.byProductCategoryArray.push(obj);
      })
    });
  }

  apply() {
    if (this.filterForm.invalid) {
      return;
    }
    if (this.filterForm.get('costMin').value > this.filterForm.get('costMax').value) {
      return;
    }
    this.filterCount = 0;

    let queryList: any = [];
    if (this.filterForm.get('isFavourite').value) {
      queryList.push("isFavourite:true");
      this.filterCount++;
    }
    if (this.filterForm.get('isPackagingMaterial').value) {
      queryList.push("isPackagingMaterial:true");
      this.filterCount++;
    }
    if (this.filterForm.get('isRawMaterial').value) {
      queryList.push("isRawMaterial:true");
      this.filterCount++;
    }
    if (this.filterForm.get('isSaleable').value) {
      queryList.push("isSaleable:true");
      this.filterCount++;
    }
    if (this.filterForm.get('isSupplies').value) {
      queryList.push("isSupplies:true");
      this.filterCount++;
    }
    if (this.filterForm.get('isQuickCheckoutEligible').value) {
      queryList.push("isQuickCheckoutEligible:true");
      this.filterCount++;
    }
    if (this.filterForm.get('DELETED').value) {
      queryList.push("status:'DELETED'");
      this.filterCount++;
    }
    let costMin = this.filterForm.get('costMin').value;
    let costMax = this.filterForm.get('costMax').value;
    if (costMin <= costMax && typeof costMin == 'number' && typeof costMax == 'number') {
      queryList.push("cost.attributeValue >: " + costMin + " and cost.attributeValue <: " + costMax);
      this.filterCount++;
    }

    let dateMin = this.filterForm.get('dateMin').value;
    let dateMax = this.filterForm.get('dateMax').value;
    if (dateMin != null && dateMax != null) {
      dateMin = this.datePipe.transform(dateMin, this.dateFormat);
      dateMax = this.datePipe.transform(dateMax, this.dateFormat);
      queryList.push("audit.createdDate >: '" + dateMin + "' and audit.createdDate <: '" + dateMax + "'");
      this.filterCount++;
    }

    let createdIdList: any = [];
    for (let index = 0; index < this.createdByFormArray.value.length; index++) {
      if (this.createdByFormArray.value[index]) {
        createdIdList.push(this.createdByArray[index]['id']);
      }
    }
    if (createdIdList.length > 0) {
      let query = "audit.createdById in ( " + createdIdList[0];
      for (let index = 0; index < createdIdList.length; index++) {
        query = query + ", " + createdIdList[index];
      }
      query = query + ")";
      queryList.push(query);
      this.filterCount++;
    }

    let typeIdList: any = [];
    for (let index = 0; index < this.byTypeFormArray.value.length; index++) {
      if (this.byTypeFormArray.value[index]) {
        typeIdList.push(this.byTypeArray[index]['id']);
      }
    }
    if (typeIdList.length > 0) {
      let query = "productTypeId in ( " + typeIdList[0];
      for (let index = 0; index < typeIdList.length; index++) {
        query = query + ", " + typeIdList[index];
      }
      query = query + ")";
      queryList.push(query);
      this.filterCount++;
    }


    let subtypeIdList: any = [];
    for (let index = 0; index < this.bySubtypeFormArray.value.length; index++) {
      if (this.bySubtypeFormArray.value[index]) {
        subtypeIdList.push(this.bySubtypeArray[index]['id']);
      }
    }
    if (subtypeIdList.length > 0) {
      let query = "productSubTypeId in ( " + subtypeIdList[0];
      for (let index = 1; index < subtypeIdList.length; index++) {
        query = query + ", " + subtypeIdList[index];
      }
      query = query + ")";
      queryList.push(query);
      this.filterCount++;
    }


    let productCategoryIdList: any = [];
    
    for (let index = 0; index < this.byProductCategoryFormArray.value.length; index++) {
      if (this.byProductCategoryFormArray.value[index]) {
        productCategoryIdList.push(this.byProductCategoryArray[index]['id']);
      }
    }


    if (productCategoryIdList.length > 0) {
      let query = "productCategoryIdList~'*%23" + productCategoryIdList[0] + "%23*'";
      for (let index = 1; index < productCategoryIdList.length; index++) {
        query = query + ' or '+ "productCategoryIdList~'*%23" + productCategoryIdList[index] + "%23*'";
      }
      query = query;
      queryList.push(query);
      this.filterCount++;
    }



    let filterQuery = queryList[0];
    for (let index = 1; index < queryList.length; index++) {
      filterQuery = filterQuery + " and " + queryList[index];
    }
    localStorage.setItem("productFilter", JSON.stringify(this.filterForm.value));
    localStorage.setItem("filterCount", JSON.stringify(this.filterCount));
  
    this.emitFilterProducts.emit(filterQuery);
    this.openFilter=false
  }

  clearFilter() {
    this.filterForm.reset();
    this.filterCount = 0;
    localStorage.removeItem("productFilter");
    localStorage.removeItem("filterCount");
    this.emitFilterProducts.emit(null);
  }
}
