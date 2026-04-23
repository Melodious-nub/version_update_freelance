import { Component } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-spinner-overlay',
  standalone: true,
  imports: [MatProgressSpinner],
  template: `
    <div class="spinner-wrapper">
      <mat-spinner diameter="50"></mat-spinner>
    </div>
  `,
  styles: [`
    .spinner-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: rgba(0, 0, 0, 0.4);
      z-index: 99999;
      pointer-events: all;
    }
  `]
})
export class SpinnerOverlayComponent {}
