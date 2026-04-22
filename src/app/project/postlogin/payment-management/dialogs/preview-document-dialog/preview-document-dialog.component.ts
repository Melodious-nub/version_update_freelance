import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-preview-document-dialog',
    templateUrl: './preview-document-dialog.component.html',
    styleUrls: ['./preview-document-dialog.component.scss'],
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, DadyinButtonComponent]
})
export class PreviewDocumentDialogComponent implements OnInit {

  imgUrl = environment.imgUrl
  url;

  constructor(public dialogRef: MatDialogRef<PreviewDocumentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:string) { }

  ngOnInit(): void {
    this.url = this.imgUrl +  this.data ;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(){

  }
}
