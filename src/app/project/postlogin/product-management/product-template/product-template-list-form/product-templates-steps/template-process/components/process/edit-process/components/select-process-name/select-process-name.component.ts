import { Component, OnInit, inject, input, output } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'select-process-name',
    templateUrl: './select-process-name.component.html',
    styleUrls: ['./select-process-name.component.scss'],
    imports: [
        FormsModule
    ]
})
export class SelectProcessNameComponent implements OnInit {
  private apiService = inject(ApiService);

  readonly isShowTextBox = input<boolean>(true);
  readonly disabled = input<boolean>(false);
  readonly placeholder = input<string>('');
  readonly process_name = input<string>('');
  readonly process_id = input<string>('');
  readonly processData = input<any>({});

  readonly GETProcessName = output<any>();
  readonly GETProcessID = output<any>();

  processCategories: any[] = this.apiService.processList;

  processName: string = '';
  processID: string = '';

  ngOnInit(): void {
    const process_id = this.process_id();
    this.processID = process_id ? process_id : null;
    const process_name = this.process_name();
    this.processName = process_name ? process_name : '';
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
