import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DadyinSliderComponent } from 'src/app/shared/widgets/dadyin-slider/dadyin-slider.component';
import { environment } from 'src/environments/environment';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from 'src/app/service/common.service';
@Component({
  selector: 'app-grid-view-product-card',
  templateUrl: './grid-view-product-card.component.html',
  styleUrls: ['./grid-view-product-card.component.scss'],
})
export class GridViewProductCardComponent implements OnInit {
  imgUrl = environment.imgUrl;
  @Input() product;
  @Input() i;
  @Input() ownerValue;
  @Input() showHideButtonLabelValue;
  @Input() hideAddToOrderValue;
  @Input() isSelfProductValue;
  @Input() isMyProductValue;
  @Input() rating;
  @Input() buyingType;
  @Input() allTierPricingDetails;
  @Output() deleteProductFromOrderevent = new EventEmitter();
  @Output() viewDetailevent = new EventEmitter();
  @Output() viewCustomisedDetailevent = new EventEmitter();
  @Output() minusevent = new EventEmitter();
  @Output() plusevent = new EventEmitter();
  @Output() setQuantityevent = new EventEmitter();
  @Output() changeQuantityevent = new EventEmitter();
  @Output() addProductToOrderevent = new EventEmitter();

  constructor(
    public dialog: MatDialog,
    public toastr: ToastrService,
    public purchaseOrderService: PurchaseOrderService,
    public commonService: CommonService
  ) {}

  ngOnInit(): void {}

  hideAddToOrder(audit: any) {
    return this.hideAddToOrderValue;
  }

  showHideButtonLabel(product) {
    return this.showHideButtonLabelValue;
  }
  getOwner(audit) {
    return this.ownerValue;
  }

  deleteProductFromOrder(product) {
    this.deleteProductFromOrderevent.emit();
  }

  viewDetail(product, i, customise) {
    this.viewDetailevent.emit();
  }
  viewCustomisedDetail(product, i, customise) {
    this.viewCustomisedDetailevent.emit();
  }
  minus(i, product) {
    this.minusevent.emit();
  }

  plus(i, product) {
    this.plusevent.emit();
  }

  isSelfProduct(productDetails: any) {
    return this.isSelfProductValue;
  }

  openImageSlider(images: any, j) {
    this.dialog.open(DadyinSliderComponent, {
      data: { images: images, index: j },
      panelClass: 'slider-dialog',
    });
  }

  getRating(product) {
    return this.rating;
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
    this.addProductToOrderevent.emit();
  }

  isNoGenericPurchase(product: any) {
    return product.productDetails?.isNoGenericPurchase == true ? true : false;
  }

  getTierPricingByProduct(id) {
    return this.allTierPricingDetails[id] ?? null;
  }

  customise(value, customise) {
    if (customise) {
      this.product.deliveryDays =
        this.allTierPricingDetails[this.product.id][0]?.deliveryPricing[1]
          ?.numberOfDays ?? null;

      this.product.skuQuantities =
        this.allTierPricingDetails[this.product.id][0]?.minimumQuantity;

      this.product.quantity =
        this.allTierPricingDetails[this.product.id][0]?.minimumQuantity;

      this.product.isCustomized = customise;
      const event = {
        target: {
          value:
            this.allTierPricingDetails[this.product.id][0]?.minimumQuantity,
        },
      };
      this.changeQuantityevent.emit({ event: event, i: this.i });
    } else {
      this.product.deliveryDays = null;
      let quantityToSet: any;
      if (
        ['CONTAINER_40_FT', 'CONTAINER_20_FT', 'CONTAINER_40_FT_HQ']?.includes(
          this.buyingType?.value
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

      this.changeQuantityevent.emit({ event: event, i: this.i });
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
