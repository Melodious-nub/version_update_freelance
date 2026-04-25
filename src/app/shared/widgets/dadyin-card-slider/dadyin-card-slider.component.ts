import { Component, input } from '@angular/core';
import { environment } from 'src/environments/environment';


@Component({
    selector: 'app-dadyin-card-slider',
    templateUrl: './dadyin-card-slider.component.html',
    styleUrls: ['./dadyin-card-slider.component.scss'],
    imports: []
})
export class DadyinCardSliderComponent {

  constructor() { }

  readonly cardLength = input<any>(undefined);
 
  currentIndex: number = 0;

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.cardLength();
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.cardLength()) % this.cardLength();
  }
}
