import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
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
    standalone: true,
    imports: [
    MatDialogClose,
    FormsModule,
    DadyinButtonComponent
],
})
export class RawMaterialPriceModalComponent implements OnInit {
  prompt = null;
  rawMaterial: any = null;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public apiService: ApiService,
    public toastr: ToastrService,
    public fb: UntypedFormBuilder,
    public formsService: FormsService,
    public dialogRef: MatDialogRef<RawMaterialPriceModalComponent>,
    public productService: ProductService
  ) {}

  ngOnInit(): void {}

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
