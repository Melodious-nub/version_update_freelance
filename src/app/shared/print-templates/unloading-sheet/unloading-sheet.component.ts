import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-unloading-sheet',
  templateUrl: './unloading-sheet.component.html',
  styleUrls: ['./unloading-sheet.component.scss']
})
export class UnloadingSheetComponent implements OnInit {
   @Input() data:any;
   dummy:any;
   unloadingManager:any;
  constructor() { }

  ngOnInit(): void {
    this.getUnloadingManager(this.data?.containerForm?.containerExpense?.labourExpenses)
  }


  getUnloadingManager(data:any) {
    if(data) {
     const unload = data.find((item)=> item.containerExpenseTypeId=='6')
     if(unload) {
      this.unloadingManager=unload?.amountPayableTo
     }
     else {
      this.unloadingManager=''
     }
    }
    else {
      this.unloadingManager=''
    }
  }

}
