import { Pipe, PipeTransform } from '@angular/core';
import { FormGroup, FormArray, AbstractControl } from '@angular/forms';

@Pipe({
    name: 'SortNamePipe',
    standalone: true
})
export class SortNamePipe implements PipeTransform {
  transform(array: any[], property: string): any[] {
    if (!Array.isArray(array)) {
      return array;
    }

    return array.sort((a, b) => {
      const nameA = a[property].toLowerCase();
      const nameB = b[property].toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }
}