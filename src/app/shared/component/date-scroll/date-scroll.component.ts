import { Component, OnInit, Input, SimpleChanges, input, output } from '@angular/core';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';


@Component({
    selector: 'app-date-scroll',
    templateUrl: './date-scroll.component.html',
    styleUrls: ['./date-scroll.component.scss'],
    imports: [MatIcon, NgClass, ExtendedModule]
})
export class DateScrollComponent implements OnInit{
  readonly initialDate = input(new Date());
  @Input() startDate=this.getDateWithoutTime(new Date())
  @Input() selectedDate=this.startDate
  readonly dateSelected = output<any>();
  constructor() { }

  ngOnInit(): void {
    this.startDate=this.getDateWithoutTime(this.initialDate())
    this.selectedDate=this.startDate
  }

  getNext10Dates(): any {
    const dateList:any = [];
    const today = new Date(this.startDate.getTime());
    for (let i = 0; i < 11; i++) {
      const nextDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const dayName = nextDate.toLocaleString('en-us', { weekday: 'long' });
      const year = nextDate.getFullYear();
      const month = ('0' + (nextDate.getMonth() + 1)).slice(-2);
      const day = ('0' + nextDate.getDate()).slice(-2);
      const dateString = `${year}-${month}-${day}`;
      dateList.push({ dateStr: dateString, day: dayName,date: nextDate});
    }
    return dateList;
  }

  onDateSelect(date){
    this.selectedDate=new Date(date)
    this.dateSelected.emit(date)
  }

  isDateSelected(date){
    return new Date(this.selectedDate),new Date(date),new Date(this.selectedDate).getTime()==new Date(date).getTime()
  }

  getPrevDate(date: any): Date {
    date=new Date(date)
    const olderDate = new Date(date.getTime() - 11 * 24 * 60 * 60 * 1000);
    return olderDate;
  }

  getNextDate(date: any): Date {
    date=new Date(date)
    const olderDate = new Date(date.getTime() + 11 * 24 * 60 * 60 * 1000);
    return olderDate;
  }

  prev(){
    this.startDate=this.getPrevDate(this.startDate)
  }

  next(){
    this.startDate=this.getNextDate(this.startDate)
  }

  getDateWithoutTime(date: Date): Date {
    const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return dateWithoutTime;
  }

}
