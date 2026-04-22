import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SwiperOptions } from 'swiper';
import { SwiperComponent, SwiperModule } from 'swiper/angular';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgFor, NgClass } from '@angular/common';

@Component({
    selector: 'app-prelogin',
    templateUrl: './prelogin.component.html',
    styleUrls: ['./prelogin.component.scss'],
    standalone: true,
    imports: [
        RouterOutlet,
        NgFor,
        NgClass,
        ExtendedModule,
        SwiperModule,
    ],
})
export class PreloginComponent implements OnInit {
  @ViewChild('swiperR', { static: false }) swiperR?: SwiperComponent;
  activeIndex = 0;
  swiperConfig: SwiperOptions = {
    spaceBetween: 15,
    navigation: false,
    loop: true,
    autoplay: true,
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      720: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
    },
    on: {
      slideChange: () => {
        if (
          this.swiperR.swiperRef?.activeIndex ||
          this.swiperR.swiperRef?.activeIndex == 0
        ) {
          const index = this.swiperR.swiperRef?.activeIndex;
          this.activeIndex = index;
        }
      },
    },
  };
  constructor(private router: Router) {}

  ngOnInit(): void {}

  goToSlide(index: number) {
    this.swiperR.swiperRef.slideTo(index);
  }
}
