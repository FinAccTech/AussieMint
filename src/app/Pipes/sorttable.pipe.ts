import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sorttable'
})
export class SorttablePipe implements PipeTransform {

  transform(array: any[], column: string, ascending: boolean = true): any[] {
    if (!array || !column) return array;

    return array.sort((a, b) => {
      let valA = a[column];
      let valB = b[column];

      if (typeof valA === 'string') {
        return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return ascending ? valA - valB : valB - valA;
      }
    });
  }
}
