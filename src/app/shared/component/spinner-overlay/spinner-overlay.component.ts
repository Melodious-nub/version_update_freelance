import { Component, OnInit } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-spinner-overlay',
    templateUrl: './spinner-overlay.component.html',
    styleUrls: ['./spinner-overlay.component.scss'],
    standalone: true,
    imports: [MatProgressSpinner],
})
export class SpinnerOverlayComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
