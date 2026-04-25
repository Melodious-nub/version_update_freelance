import { Component, inject } from '@angular/core';

import { UntypedFormBuilder, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { FormsService } from 'src/app/service/forms.service';
import { ProductService } from '../../product/service/product.service';

import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-raw-material-price-modal',
    templateUrl: './raw-material-price-modal.component.html',
    styleUrls: ['./raw-material-price-modal.component.scss'],
    imports: [
        MatDialogClose,
        FormsModule,
        DadyinButtonComponent
    ]
})
export class RawMaterialPriceModalComponent {
  data = inject(MAT_DIALOG_DATA);
  apiService = inject(ApiService);
  toastr = inject(ToastrService);
  fb = inject(UntypedFormBuilder);
  formsService = inject(FormsService);
  dialogRef = inject<MatDialogRef<RawMaterialPriceModalComponent>>(MatDialogRef);
  productService = inject(ProductService);

  prompt = null;
  rawMaterial: any = null;

  async refreshRawMaterialPricing() {
    try {
      const productId = this.data.id;
      if (!productId) {
        this.toastr.error('Product ID is missing');
        return;
      }
      const res = await this.productService.getRawMaterialPricing(
        productId,
        this.prompt
      );
      if (!res) {
        this.toastr.error('No raw material pricing data found');
        return;
      } else {
        this.rawMaterial = res;
      }
    } catch (err: any) {
      this.toastr.error(
        err?.error?.userMessage ?? 'Failed to get raw material pricing,Try again'
      );
    }
  }
}
