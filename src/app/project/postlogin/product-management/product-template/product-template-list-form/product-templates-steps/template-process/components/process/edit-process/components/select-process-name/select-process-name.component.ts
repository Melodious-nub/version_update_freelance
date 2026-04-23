import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'select-process-name',
    templateUrl: './select-process-name.component.html',
    styleUrls: ['./select-process-name.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        FormsModule,
        NgFor,
    ],
})
export class SelectProcessNameComponent implements OnInit {
  @Input() isShowTextBox: boolean = true;
  @Input() disabled: boolean = false;
  @Input() placeholder: string = '';
  @Input() process_name: string = '';
  @Input() process_id: string = '';
  @Input() processData: any = {};

  @Output() GETProcessName: EventEmitter<any> = new EventEmitter();
  @Output() GETProcessID: EventEmitter<any> = new EventEmitter();

  processCategories: any[] = this.apiService.processList;

  processName: string = '';
  processID: string = '';

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.processID = this.process_id ? this.process_id : null;
    this.processName = this.process_name ? this.process_name : '';
  }

  getProcessName(event: any, isText: boolean = false): void {
    const proccessValue = isText
      ? event.target.value
      : Number(event.target.value);

    this.processID = proccessValue;

    if (typeof proccessValue === 'number') {
      const process_Details = this.apiService.getDataByAttr(
        this.processCategories,
        'id',
        proccessValue
      );
      this.processName = process_Details.description;
    } else {
      this.processName = proccessValue;
    }
    this.GETProcessName.emit(this.processName);
    this.GETProcessID.emit(proccessValue);
  }
}
