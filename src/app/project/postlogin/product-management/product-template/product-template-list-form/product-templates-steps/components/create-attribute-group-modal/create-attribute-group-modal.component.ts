import { Component, OnInit } from '@angular/core';
import { MatDialogClose } from '@angular/material/dialog';

@Component({
    selector: 'app-create-attribute-group-modal',
    templateUrl: './create-attribute-group-modal.component.html',
    styleUrls: ['./create-attribute-group-modal.component.scss'],
    imports: [MatDialogClose]
})
export class CreateAttributeGroupModalComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
