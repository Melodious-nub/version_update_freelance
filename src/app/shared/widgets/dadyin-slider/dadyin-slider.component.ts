import { Component, HostListener, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dadyin-slider',
  templateUrl: './dadyin-slider.component.html',
  styleUrls: ['./dadyin-slider.component.scss'],
})
export class DadyinSliderComponent implements OnInit {
  imgUrl = environment.imgUrl;

  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent) {
    if (event.deltaY > 0) {
      this.selectImage(this.data.index + 1);
    } else {
      this.selectImage(this.data.index - 1);
    }
  }
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,public dialog:MatDialog) {}

  ngOnInit(): void {}

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
