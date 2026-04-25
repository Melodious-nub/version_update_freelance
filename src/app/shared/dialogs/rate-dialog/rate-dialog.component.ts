import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, catchError, map, of } from 'rxjs';
import { MatIcon } from '@angular/material/icon';

import { DadyinButtonComponent } from '../../widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-rate-dialog',
    templateUrl: './rate-dialog.component.html',
    styleUrls: ['./rate-dialog.component.scss'],
    imports: [DadyinButtonComponent, MatIcon]
})
export class RateDialogComponent implements OnInit {
 dialogRef = inject<MatDialogRef<RateDialogComponent>>(MatDialogRef);
 data = inject(MAT_DIALOG_DATA);

 rating:any

  ngOnInit(): void {
   this.rating=this.data.rating
  }
  close() {
    this.dialogRef.close();
  }


  save(): void {
    this.dialogRef.close(this.rating);
  }

  rate(rating:any) {
   this.rating=rating
  }
}
