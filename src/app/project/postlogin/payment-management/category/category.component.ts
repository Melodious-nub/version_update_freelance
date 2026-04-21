import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BusinessAccountService } from '../../business-account/business-account.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/service/api.service';
import { CategoryDialogComponent } from '../dialogs/category-dialog/category-dialog.component';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit {
  currentBusinessAccount;
  categoryList;
  category;
  public categoryheaders = [
    { name: 'Id#', prop: 'id', sortable: true, type: '' },
    { name: 'Name', prop: 'name', sortable: true, type: '' },
  ];
  pageIndex: any = 0;
  pageS = 20;
  public tableActions: any = [
    {
      label: 'Edit',
      icon: 'edit',
    },
  ];

  public pageConfig: any = {
    itemPerPage: 20,
    sizeOption: [20, 50, 75, 100],
  };
  id = 0;

  constructor(
    public router: Router,
    private businueeAccount: BusinessAccountService,
    public toastr: ToastrService,
    public dialog: MatDialog,
    private apiService: ApiService
  ) {
    this.businueeAccount.$currentBusinessAccount.subscribe((res) => {
      this.currentBusinessAccount = res;
    });
  }

  ngOnInit(): void {
    this.getAllCategory();
    if (
      this.currentBusinessAccount &&
      this.currentBusinessAccount.isSystemAccount
    ) {
      this.categoryheaders.push({
        name: 'ACTIONS',
        prop: 'action',
        sortable: false,
        type: 'menu',
      });
    }
  }

  navigate(link: any) {
    this.router.navigateByUrl(link);
  }

  onCategoryActionClick(event) {
    if (!this.currentBusinessAccount.isSystemAccount) {
      this.toastr.error('You dont have permission to edit category');
      return;
    }
    let cat = this.categoryList.find((obj) => {
      return obj.id === event.row.id;
    });

    this.category = cat.name;
    this.id = event.row.id;
    this.AddCategory();
  }

  onCategoryEditClick(event) {
    if (!this.currentBusinessAccount?.isSystemAccount) {
      this.toastr.error("You don't have permission to edit category");
      return;
    }
    let cat = this.categoryList.find((obj) => {
      return obj.id === event.data.id;
    });

    this.category = cat.name;
    this.id = event.data.id;
    this.AddCategory();
  }

  getAllCategory() {
    this.apiService.getAllCategory().subscribe((response: any) => {
      this.categoryList = response;
      this.id = 0;
    });
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
  }

  AddCategory() {
    const dialogRef = this.dialog.open(CategoryDialogComponent, {
      data: {
        name: this.category,
        Id: this.id,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getAllCategory();
    });
  }
}
