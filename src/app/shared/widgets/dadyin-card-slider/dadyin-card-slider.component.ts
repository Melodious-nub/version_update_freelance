import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dadyin-card-slider',
  templateUrl: './dadyin-card-slider.component.html',
  styleUrls: ['./dadyin-card-slider.component.scss']
})
export class DadyinCardSliderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input() cardLength: any;
 
  currentIndex: number = 0;

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.cardLength;
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.cardLength) % this.cardLength;
  }
}
