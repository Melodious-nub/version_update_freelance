import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortNumberProperty'
})
export class SortNumberPropertyPipe implements PipeTransform {
  transform(array: any, property: string, order: 'asc' | 'desc' = 'asc'): any[] {
    if (!Array.isArray(array)) {
      return array;
    }

    const itemsWithProperty = array.filter(item => item[property] !== undefined);
    const itemsWithoutProperty = array.filter(item => item[property] === undefined);

    itemsWithProperty.sort((a, b) => {
      const value1 = a[property];
      const value2 = b[property];
      if (value1 === null && value2 === null) {
        return 0;
      } else if (value1 === null) {
        return 1;
      } else if (value2 === null) {
        return -1;
      } else {
        if (order === 'asc') {
          return value1 - value2;
        } else {
          return value2 - value1;
        }
      }
    });

    return [...itemsWithProperty, ...itemsWithoutProperty];
  }
}