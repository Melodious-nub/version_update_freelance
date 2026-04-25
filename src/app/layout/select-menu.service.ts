import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectMenuService {
  selectedMenu: any;

  selectedChildMenu: Subject<any> = new Subject<any>();

  constructor() { }

  setSelectedchild(newvalue) {
    this.selectedMenu = newvalue;
  }

  changeSelectedMenu(newvalue) {
    this.setSelectedchild(newvalue);
    this.selectedChildMenu.next(newvalue);
  }

}
