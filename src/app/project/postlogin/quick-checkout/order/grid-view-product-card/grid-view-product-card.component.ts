import { Component, Input, inject, input, output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DadyinSliderComponent } from 'src/app/shared/widgets/dadyin-slider/dadyin-slider.component';
import { environment } from 'src/environments/environment';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/service/common.service';
import { SortNumberPropertyPipe } from '../../../../../shared/pipes/sort-number-property.pipe';
import { NumberFormatterPipe } from '../../../../../shared/pipes/number-formatter.pipe';
import { FormsModule } from '@angular/forms';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { MatIconModule } from '@angular/material/icon';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgClass, DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
@Component({
    selector: 'app-grid-view-product-card',
    templateUrl: './grid-view-product-card.component.html',
    styleUrls: ['./grid-view-product-card.component.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        MatTooltipModule,
        NgClass,
        ExtendedModule,
        NgbTooltip,
        MatIconModule,
        DadyinButtonComponent,
        FormsModule,
        DatePipe,
        NumberFormatterPipe,
        SortNumberPropertyPipe
    ]
})
export class GridViewProductCardComponent {
  dialog = inject(MatDialog);
  toastr = inject(ToastrService);
  purchaseOrderService = inject(PurchaseOrderService);
  commonService = inject(CommonService);

  imgUrl = environment.imgUrl;
  @Input() product;
  readonly i = input(undefined);
  readonly ownerValue = input(undefined);
  readonly showHideButtonLabelValue = input(undefined);
  readonly hideAddToOrderValue = input(undefined);
  readonly isSelfProductValue = input(undefined);
  readonly isMyProductValue = input(undefined);
  readonly rating = input(undefined);
  readonly buyingType = input(undefined);
  readonly allTierPricingDetails = input(undefined);
  readonly deleteProductFromOrderevent = output<any>();
  readonly viewDetailevent = output<any>();
  readonly viewCustomisedDetailevent = output<any>();
  readonly minusevent = output<any>();
  readonly plusevent = output<any>();
  readonly setQuantityevent = output<any>();
  readonly changeQuantityevent = output<any>();
  readonly addProductToOrderevent = output<any>();

  hideAddToOrder(audit: any) {
    return this.hideAddToOrderValue();
  }

  showHideButtonLabel(product) {
    return this.showHideButtonLabelValue();
  }
  getOwner(audit) {
    return this.ownerValue();
  }

  deleteProductFromOrder(product) {
    this.deleteProductFromOrderevent.emit(undefined as any);
  }

  viewDetail(product, i, customise) {
    this.viewDetailevent.emit(undefined as any);
  }
  viewCustomisedDetail(product, i, customise) {
    this.viewCustomisedDetailevent.emit(undefined as any);
  }
  minus(i, product) {
    this.minusevent.emit(undefined as any);
  }

  plus(i, product) {
    this.plusevent.emit(undefined as any);
  }

  isSelfProduct(productDetails: any) {
    return this.isSelfProductValue();
  }

  openImageSlider(images: any, j) {
    this.dialog.open(DadyinSliderComponent, {
      data: { images: images, index: j },
      panelClass: 'slider-dialog',
    });
  }

  getRating(product) {
    return this.rating();
  }

  setDays(days, quantity, i) {
    this.product.deliveryDays = days;
    if (quantity) {
      this.product.skuQuantities = quantity;
      this.product.quantity = quantity;
    }
    this.setQuantityevent.emit({ quantity: this.product.skuQuantities, i: i });
  }
  setQuantity(quantity, i) {

    this.setQuantityevent.emit({ quantity: quantity, i: i });
  }
  changeQuantity(event, i) {
    this.changeQuantityevent.emit({ event: event, i: i });
  }
  addProductToOrder(product) {
    this.addProductToOrderevent.emit(undefined as any);
  }

  isNoGenericPurchase(product: any) {
    return product.productDetails?.isNoGenericPurchase == true ? true : false;
  }

  getTierPricingByProduct(id) {
    return this.allTierPricingDetails()[id] ?? null;
  }

  customise(value, customise) {
    if (customise) {
      this.product.deliveryDays =
        this.allTierPricingDetails()[this.product.id][0]?.deliveryPricing[1]
          ?.numberOfDays ?? null;

      this.product.skuQuantities =
        this.allTierPricingDetails()[this.product.id][0]?.minimumQuantity;

      this.product.quantity =
        this.allTierPricingDetails()[this.product.id][0]?.minimumQuantity;

      this.product.isCustomized = customise;
      const event = {
        target: {
          value:
            this.allTierPricingDetails()[this.product.id][0]?.minimumQuantity,
        },
      };
      this.changeQuantityevent.emit({ event: event, i: this.i() });
    } else {
      this.product.deliveryDays = null;
      let quantityToSet: any;
      if (
        ['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(
          this.buyingType()?.value
        )
      ) {
        quantityToSet = this.product.productDetails.containerMqo;
      } else {
        quantityToSet = this.product.productDetails.skuThirdMinimumQuantity;
      }
      this.product.skuQuantities = quantityToSet;
      this.product.quantity = quantityToSet;
      this.product.isCustomized = customise;
      const event = {
        target: {
          value: quantityToSet,
        },
      };

      this.changeQuantityevent.emit({ event: event, i: this.i() });
    }
  }

  async share(product) {
    const navigator = window.navigator as any;
    const productData = {
      id: product.productDetails?.id,
      productCode: product.productDetails?.productCode,
      description: product.productDetails?.description,
      productDetails: product.productDetails,
      productMetaId: product.productDetails?.productMetaId
    };
    const shareUrl = this.commonService.generateShareUrl(productData);
    const fallbackProductKey = `${product.productDetails?.productCode}:${product.productDetails?.description}(${product.productDetails?.productCode})`;
    const fallbackUrl = `${environment.uiURL}#/home/quick-checkout/order?viewType=flyer&productKey=${encodeURIComponent(fallbackProductKey)}`;
    const urlToShare = shareUrl || fallbackUrl;
    const shareTitle = productData?.description || 'Dadyin product';

    // Best-effort clipboard copy (may fail if clipboard permission is blocked)
    await navigator?.clipboard?.writeText(urlToShare).catch(() => {});

    if (navigator.share && (!navigator.canShare || navigator.canShare({ url: urlToShare }))) {
      navigator
        .share({
          title: shareTitle,
          text: urlToShare,
          url: urlToShare,
        })
        .then(() => {
          this.toastr.success('Product link Copied successfully');
        
        })
        .catch((error) => {
          console.log('Error sharing', error);
          this.toastr.success('Product link Copied successfully ');
        });
    } else {
      this.toastr.success('Product link Copied successfully ');
    }
  }



}
