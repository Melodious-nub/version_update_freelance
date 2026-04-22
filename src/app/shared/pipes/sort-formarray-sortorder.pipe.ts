import { Pipe, PipeTransform } from '@angular/core';
import { UntypedFormGroup, FormArray, AbstractControl } from '@angular/forms';

@Pipe({
    name: 'sortFormArray',
    standalone: true
})
export class SortFormArrayPipe implements PipeTransform {
  transform(formArray: any): AbstractControl[] {
    const controls = formArray;
    controls.sort((a, b) => {
      const sortOrderA = (a as UntypedFormGroup).controls['sortOrder'].value;
      const sortOrderB = (b as UntypedFormGroup).controls['sortOrder'].value;
      return sortOrderA - sortOrderB;
    });
    return controls;
  }
}