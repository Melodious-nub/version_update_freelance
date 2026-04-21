import { Component, OnInit } from '@angular/core';
import { PrintService } from 'src/app/service/print.service';

@Component({
  selector: 'app-print-templates',
  templateUrl: './print-templates.component.html',
  styleUrls: ['./print-templates.component.scss']
})
export class PrintTemplatesComponent implements OnInit {
  constructor(public printService:PrintService) { }

  ngOnInit(): void {
  }



}
