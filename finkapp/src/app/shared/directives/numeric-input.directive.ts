import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appNumericInput]',
})
export class NumericInputDirective {
  @Input() decimalPlaces: number = 2; // Número de decimales permitidos, valor por defecto: 2

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event): void {
    const input = this.el.nativeElement;
    let cleanedValue = input.value.replace(/[^0-9.]/g, '');

    // Verificar si hay más de un punto
    const dotIndex = cleanedValue.indexOf('.');
    if (dotIndex !== -1) {
      const afterDot = cleanedValue.substring(dotIndex + 1);
      const beforeDot = cleanedValue.substring(0, dotIndex);
      // Permitir solo el número específico de decimales
      cleanedValue = beforeDot + '.' + afterDot.slice(0, this.decimalPlaces);
    }

    if (cleanedValue !== input.value) {
      input.value = cleanedValue;
      event.preventDefault();
    }
  }
}
