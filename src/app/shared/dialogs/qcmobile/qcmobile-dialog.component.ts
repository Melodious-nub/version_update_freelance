import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogActions } from '@angular/material/dialog';
import { Component, inject } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BusinessAccountService } from 'src/app/project/postlogin/business-account/business-account.service';
import { MatButton } from '@angular/material/button';


@Component({
    selector: 'qcmobile-dialog',
    templateUrl: './qcmobile-dialog.component.html',
    styleUrls: ['./qcmobile-dialog.component.scss'],
    imports: [
        MatDialogTitle,
        MatDialogActions,
        MatButton
    ]
})
export class QcmobileDialogComponent {
  dialogRef = inject<MatDialogRef<QcmobileDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);
  authService = inject(AuthService);
  router = inject(Router);
  private toastr = inject(ToastrService);
  private businessAccountService = inject(BusinessAccountService);


  private getDefaultFlyerUrl(): string {
    return (
      window.location.origin +
      `#/home/quick-checkout/order?category=pharmacy&vendorId=${this.businessAccountService.vendorId}&viewType=flyer`
    );
  }

  viewProducts(): void {
    window.location.href = this.getDefaultFlyerUrl();
    this.dialogRef.close();
  }

  shareLink() {
    const navigator = window.navigator as any;
    if (this.data.qcData) {
      const url =
        window.location.origin +
        '#/home/quick-checkout/order/' +
        this.data.qcData.id;
      navigator?.clipboard?.writeText(url).catch(() => {});
      this.toastr.success('Product link Copied successfully');
      if (navigator.share && (!navigator.canShare || navigator.canShare({ url }))) {
        navigator.share({ text: url, url }).catch(() => {});
      }
      this.authService.logout();
      window.location.href = this.getDefaultFlyerUrl();
      this.dialogRef.close();
    } else {  
      const url = this.getDefaultFlyerUrl();
      navigator?.clipboard?.writeText(url).catch(() => {});
      this.toastr.success('Product link Copied successfully');
      if (navigator.share && (!navigator.canShare || navigator.canShare({ url }))) {
        navigator.share({ text: url, url }).catch(() => {});
      }
      this.authService.logout();
      window.location.href = url;
      this.dialogRef.close();
    }
  }
}
