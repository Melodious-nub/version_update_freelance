import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BusinessAccountService } from '../../../business-account/business-account.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserFormsService } from '../service/user-forms.service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
})
export class UserDetailsComponent implements OnInit {
  public currentMainIndex: number = 0;

  public userForm: any;

  AccessModules = ['Order management', 'Product management', 'Customers', 'Prospects', 'Leads', 'Vendors', 'Product management']
  
  SystemAccessModules=['Order management','User management','Container management','Product management']
  
  constructor(
    public toastr: ToastrService,
    public dialog: MatDialog,
    public businessAccountService: BusinessAccountService,
    public userFormsService: UserFormsService,
    public router: Router

  ) {
    this.userForm = this.userFormsService.createUserForm()
  }

  ngOnInit(): void {

  }
  onClickSave() {

  }

  navigateToHome() {
    this.router.navigateByUrl(
      'home/system-config/user-management'
    );
  }

  expandPanel(matExpansionPanel, event): void {
    event.stopPropagation(); // Preventing event bubbling

    if (!this._isExpansionIndicator(event.target)) {
      matExpansionPanel.open(); // Here's the magic
    }
  }

  private _isExpansionIndicator(target: EventTarget): boolean {
    const expansionIndicatorClass = 'mat-expansion-indicator';
    return (
      target['classList'] &&
      target['classList'].contains(expansionIndicatorClass)
    );
  }
}
