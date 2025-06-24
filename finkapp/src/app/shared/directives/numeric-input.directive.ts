import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  Input,
} from '@angular/core';

@Directive({
  selector: '[appNumericInput]',
})
export class NumericInputDirective {
  @Input() decimalPlaces = 2;

  private el = inject(ElementRef);

  @HostListener('input', ['$event'])
  onInputChange(event: Event): void {
    const input = this.el.nativeElement;
    let cleanedValue = input.value.replace(/[^0-9.]/g, '');

    const dotIndex = cleanedValue.indexOf('.');
    if (dotIndex !== -1) {
      const afterDot = cleanedValue.substring(dotIndex + 1);
      const beforeDot = cleanedValue.substring(0, dotIndex);
      cleanedValue = beforeDot + '.' + afterDot.slice(0, this.decimalPlaces);
    }

    if (cleanedValue !== input.value) {
      input.value = cleanedValue;
      event.preventDefault();
    }
  }
}
