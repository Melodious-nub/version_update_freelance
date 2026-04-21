import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {
  transform(array: any[], field: string, reverse: boolean = false): any[] {
    if (!Array.isArray(array) || !field) {
      return array;
    }

    const direction = reverse ? -1 : 1;

    return [...array].sort((a: any, b: any) => {
      const valueA = this.getValue(a, field);
      const valueB = this.getValue(b, field);

      if (valueA === valueB) return 0;
      if (valueA === null || valueA === undefined) return 1;
      if (valueB === null || valueB === undefined) return -1;

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction * valueA.localeCompare(valueB);
      }

      return direction * (valueA < valueB ? -1 : 1);
    });
  }

  private getValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }
}
