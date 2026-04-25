import { Component, OnInit } from '@angular/core';
import { PrintService } from 'src/app/service/print.service';
import { UnloadingSheetComponent } from './unloading-sheet/unloading-sheet.component';


@Component({
    selector: 'app-print-templates',
    templateUrl: './print-templates.component.html',
    styleUrls: ['./print-templates.component.scss'],
    standalone: true,
    imports: [UnloadingSheetComponent]
})
export class PrintTemplatesComponent implements OnInit {
  constructor(public printService:PrintService) { }

  ngOnInit(): void {
  }



}
