import { Component, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';


import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-prelogin',
    templateUrl: './prelogin.component.html',
    styleUrls: ['./prelogin.component.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        RouterOutlet,
        NgClass,
        ExtendedModule
    ]
})
export class PreloginComponent implements AfterViewInit{
  private router = inject(Router);

  @ViewChild('swiperR', { static: false }) swiperR?: ElementRef;
  activeIndex = 0;
  swiperConfig: any = {
    spaceBetween: 15,
    navigation: false,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      720: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
    }
  };

  ngAfterViewInit() {
    if (this.swiperR) {
      const swiperEl = this.swiperR.nativeElement;
      Object.assign(swiperEl, this.swiperConfig);

      swiperEl.addEventListener('swiperslidechange', (event: any) => {
        this.activeIndex = event.detail[0].realIndex;
      });

      swiperEl.initialize();
    }
  }

  goToSlide(index: number) {
    this.swiperR?.nativeElement.swiper.slideTo(index);
  }
}
