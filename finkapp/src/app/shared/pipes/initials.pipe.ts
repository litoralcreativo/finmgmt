import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
})
export class InitialsPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    const words = value.split(' ');

    // Dos o más palabras: devolver las iniciales de las dos primeras palabras
    const initials = words
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
    return initials;
  }
}
