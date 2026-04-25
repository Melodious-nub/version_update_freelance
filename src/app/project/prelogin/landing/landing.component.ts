import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/service/api.service';
import { TokenService } from 'src/app/service/token.service';
import { PricecompareDialogComponent } from 'src/app/shared/component/pricecompare-dialog/pricecompare-dialog.component';
import { SwiperOptions } from 'swiper/types';
import { OrderManagementService } from '../../postlogin/order-management/service/order-management.service';
import { environment } from 'src/environments/environment';
import { BusinessAccountService } from '../../postlogin/business-account/business-account.service';

import { MatIcon } from '@angular/material/icon';
import { DadyinButtonComponent } from '../../../shared/widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss'],
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
    RouterLink,
    DadyinButtonComponent,
    MatIcon
],
})
export class LandingComponent implements OnInit, AfterViewInit {
  @ViewChild('swiperLanding') swiperLanding?: ElementRef;
  @ViewChild('swiperLanding2') swiperLanding2?: ElementRef;
  productsList = [];
  industryTypeId = this.fb.control(null);
  productSearchRequest: any = {};
  poFile = null;
  swiperConfig: SwiperOptions = {
    spaceBetween: 15,
    navigation: false,

    breakpoints: {
      0: {
        slidesPerView: 1.2,
        spaceBetween: 10,
      },
      720: {
        slidesPerView: 5,
        spaceBetween: 10,
      },
    },
  };

  imgSrc = environment.imgUrl;
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public tokenService: TokenService,
    public apiService: ApiService,
    public fb: UntypedFormBuilder,
    public dialog: MatDialog,
    public toastr: ToastrService,
    public OrderManagementService: OrderManagementService,
    public businessAccountService: BusinessAccountService
  ) {}

  ngAfterViewInit() {
    [this.swiperLanding, this.swiperLanding2].forEach(swiper => {
      if (swiper) {
        const swiperEl = swiper.nativeElement;
        Object.assign(swiperEl, this.swiperConfig);
        swiperEl.navigation = true;
        swiperEl.initialize();
      }
    });
  }

  ngOnInit(): void {
    this.apiService.Get_Industry_Types();
    this.loadProducts();
    if (this.tokenService?.getAccessToken()) {
      this.router.navigateByUrl('home');
      return;
    }
  }

  getExploreMoreUrl(category: string): string {
    const vendorId =
      Number(this.route.snapshot.queryParams['vendorId']) ||
      this.businessAccountService.vendorId;
    return `home/quick-checkout/order?category=${category}&vendorId=${vendorId}&viewType=flyer`;
  }

  fileSelected(event: any, type: string, fileInput: HTMLInputElement) {
    event.preventDefault(); // Prevent default behavior
    if (type === 'drop') {
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        this.poFile = files[0];
        fileInput.value = null;
      }
    } else {
      const files = fileInput.files;
      if (files && files.length > 0) {
        this.poFile = files[0];
        fileInput.value = null;
      }
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // Prevent default behavior
  }

  async generatePoFromPdf(fileinp1: any) {
    try {
      const formData = new FormData();
      formData.append('orderQuotation', this.poFile);
      const data = await this.OrderManagementService.generatePoFromPdf(
        formData,
        null
      ).toPromise();
      fileinp1.value = ''; // Clear the file input after selection
      if (data.status == 'FAILED') {
        this.toastr.warning(data?.error);
      }

      this.openCompareDialog(data);
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.error ?? 'Some Error Occurred');
    }
  }

  openCompareDialog(data) {
    data.landing = true;
    let dialogRef = this.dialog.open(PricecompareDialogComponent, {
      width: '90%',
      data: data,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
      }
    });
  }
  onPaste(event, fileinp1: any) {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind) {
          const pastedFile = item.getAsFile();
          if (pastedFile) {
            this.poFile = pastedFile;
            this.generatePoFromPdf(fileinp1);
          }
        }
      }
    }
  }

  searchProductTimeout: any;

  searchProduct(event) {
    clearTimeout(this.searchProductTimeout);
    this.productSearchRequest.searchString = event.target.value;
    this.searchProductTimeout = setTimeout(() => {
      this.loadProducts();
    }, 400); // 400ms debounce
  }

  loadProducts() {
    this.productSearchRequest.pageIndex = 0;
    this.productSearchRequest.pageS = 20;
    this.productSearchRequest.sortQuery =
      'productCode,audit.businessAccount.id';
    this.productSearchRequest.filter = `preferredCustomerId is null`;
    this.OrderManagementService.Get_ALL_Product_List(
      this.productSearchRequest
    ).subscribe((res) => {
      this.productsList = res?.content;
    });
  }

  orderNow(product: any) {
    const productKey = `${product?.productCode}:${product?.description}(${product?.productCode})`;
    const url = `home/quick-checkout/order?viewType=flyer&productKey=${encodeURIComponent(
      productKey
    )}`;
    this.router.navigateByUrl(url);
  }

  navigate(url: string) {
    this.router.navigateByUrl(url);
  }
}
