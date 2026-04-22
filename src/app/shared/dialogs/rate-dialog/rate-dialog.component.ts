import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, catchError, map, of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { NgFor, NgIf } from '@angular/common';
import { DadyinButtonComponent } from '../../widgets/dadyin-button/dadyin-button.component';

@Component({
    selector: 'app-rate-dialog',
    templateUrl: './rate-dialog.component.html',
    styleUrls: ['./rate-dialog.component.scss'],
    standalone: true,
    imports: [DadyinButtonComponent, NgFor, NgIf, MatIconModule]
})
export class RateDialogComponent implements OnInit {
 rating:any
  constructor(public dialogRef: MatDialogRef<RateDialogComponent>,httpClient: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any){}

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
