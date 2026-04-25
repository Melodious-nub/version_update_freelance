import { Component, OnInit } from '@angular/core';
import { MatDialogClose } from '@angular/material/dialog';

@Component({
    selector: 'app-usage-formulas-modal',
    templateUrl: './usage-formulas-modal.component.html',
    styleUrls: ['./usage-formulas-modal.component.scss'],
    imports: [MatDialogClose]
})
export class UsageFormulasModalComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
