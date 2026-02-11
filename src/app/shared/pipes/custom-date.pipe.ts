import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate',
  standalone: true,
})
export class CustomDatePipe implements PipeTransform {
  datePipe: DatePipe = new DatePipe('en-FR');

  transform(date: Date): string | null {
    if (!date) {
      return null;
    }
    let today: Date = new Date();
    let frontDate: Date = new Date(date);
    let isToday: boolean =
      frontDate.getFullYear() === today.getFullYear() &&
      frontDate.getMonth() === today.getMonth() &&
      frontDate.getDate() === today.getDate();
    if (isToday) {
      return this.datePipe.transform(date, 'HH:mm');
    }
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
