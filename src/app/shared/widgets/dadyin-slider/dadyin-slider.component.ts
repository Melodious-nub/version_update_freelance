import { Component, HostListener, Input, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-dadyin-slider',
    templateUrl: './dadyin-slider.component.html',
    styleUrls: ['./dadyin-slider.component.scss'],
    imports: [
        NgClass,
        ExtendedModule
    ]
})
export class DadyinSliderComponent {
  data = inject(MAT_DIALOG_DATA);
  dialog = inject(MatDialog);

  imgUrl = environment.imgUrl;

  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent) {
    if (event.deltaY > 0) {
      this.selectImage(this.data.index + 1);
    } else {
      this.selectImage(this.data.index - 1);
    }
  }

  selectImage(i) {
    if (i < this.data.images?.length - 1 && i >= 0) {
      this.data.index = i;
    }
    if (i >= this.data.images?.length - 1) {
      this.data.index = this.data.images?.length - 1;
    }

    if (i < 0) {
      this.data.index = 0;
    }
  }

  close() {
   this.dialog.closeAll()
  }



  
}
