import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { DadyinButtonComponent } from '../../../../../shared/widgets/dadyin-button/dadyin-button.component';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-preview-document-dialog',
    templateUrl: './preview-document-dialog.component.html',
    styleUrls: ['./preview-document-dialog.component.scss'],
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, DadyinButtonComponent, MatDialogClose]
})
export class PreviewDocumentDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<PreviewDocumentDialogComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);


  imgUrl = environment.imgUrl
  url;

  ngOnInit(): void {
    this.url = this.imgUrl +  this.data ;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(){

  }
}
