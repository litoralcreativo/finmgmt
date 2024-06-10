import { Pipe, PipeTransform } from '@angular/core';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
  transform(value: string | Date): string {
    const date = new Date(value);
    const today = new Date();

    if (isToday(date)) {
      return 'today';
    }

    if (isYesterday(date)) {
      return 'yesterday';
    }

    const daysDifference = differenceInDays(today, date);
    if (daysDifference < 7) {
      return format(date, 'EEEE'); // Formats date as the day of the week (e.g., Monday)
    }

    return format(date, 'MMM d, yyyy'); // Formats date as Jun 4, 2024
  }
}
