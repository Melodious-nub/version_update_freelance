import { formatNumber } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormatter'
})

export class NumberFormatterPipe implements PipeTransform {

  transform(value: any, args: any): string {
    // if (value==null || value=='') {
    //   return '';
    // }

    // const valueString = value.toString()
    // if (valueString?.includes('0.0')) {
    //   value = Number(value)
    //   return value.toFixed(3);;
    // }

    value = Number(value)

    // Check if the value is a valid number
    if (isNaN(value)) {
      return '';
    }

    // Convert the number to a string with exactly two decimal places
    const formattedValue = value.toFixed(args);

    return formattedValue;
  }

}
