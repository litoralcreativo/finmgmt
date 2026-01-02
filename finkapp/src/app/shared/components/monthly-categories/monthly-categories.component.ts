import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  AcumulatorGroup,
  MonthlyAcumulator,
} from '../../models/accumulator.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-monthly-categories',
  templateUrl: './monthly-categories.component.html',
  styleUrls: ['./monthly-categories.component.scss'],
})
export class MonthlyCategoriesComponent implements OnChanges {
  @Input() donutData: MonthlyAcumulator;
  @Input() colorTheme = '#3878c8';

  year = 1950;
  month = 0;
  negatives: AcumulatorGroup[] = [];
  positives: AcumulatorGroup[] = [];
  totalNegative: number;
  totalPositive: number;
  @Output() go = new EventEmitter<1 | -1>();
  @Output() categorySelected = new EventEmitter<{
    name: string;
    selected: boolean;
  }>();
  firstDayOfMonth: Date;
  today = new Date();
  nextMonth: Date;
  isDownloading = false;

  constructor(private snackBar: MatSnackBar) {}

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes['donutData']) {
        this.setData();
      }
    }
  }

  setData() {
    if (!this.donutData) throw new Error('No acummulator provided');

    this.negatives = this.donutData.groups.filter((x) => x.amount < 0);
    this.positives = this.donutData.groups.filter((x) => x.amount > 0);

    this.totalNegative = this.negatives.reduce((a, c) => a + c.amount, 0);

    this.totalPositive = this.positives.reduce((a, c) => a + c.amount, 0);

    this.negatives.sort((a, b) => a.amount - b.amount);
    this.positives.sort((a, b) => b.amount - a.amount);

    if (this.positives.some((x) => x.category.name === 'Swap')) {
      this.positives.sort((a, b) => (a.category.name === 'Swap' ? -1 : 1));
    }
    if (this.negatives.some((x) => x.category.name === 'Swap')) {
      this.negatives.sort((a, b) => (a.category.name === 'Swap' ? -1 : 1));
    }

    this.setMonth();
  }

  private setMonth() {
    this.year = this.donutData.year;
    this.month = this.donutData.month;
    this.firstDayOfMonth = new Date(this.year, this.month);
    this.nextMonth = new Date(this.year, this.month);
    this.nextMonth.setMonth(this.nextMonth.getMonth() + 1);
  }

  get disableNext(): boolean {
    return this.today < this.nextMonth;
  }

  onCategorySelectedFromGraph(category: { name: string; selected: boolean }) {
    this.categorySelected.emit(category);
  }

  goToMonth(direction: -1 | 1) {
    this.go.emit(direction);
  }

  downloadMonthlyReport(): void {
    if (this.isDownloading) return;

    this.isDownloading = true;

    // Extraer año y mes de la fecha actual
    const year = this.firstDayOfMonth.getFullYear();
    const month = this.firstDayOfMonth.getMonth();

    console.log('Iniciando descarga de reporte mensual:', { year, month });

    // TODO: Implementar llamada al servicio de reportes
    // this.reportService.downloadMonthlyReport(this.scopeId, year, month)
    //   .subscribe({
    //     next: (blob: Blob) => this.handleFileDownload(blob, year, month),
    //     error: (error) => this.handleDownloadError(error),
    //     complete: () => this.isDownloading = false
    //   });

    // Simulación temporal para pruebas
    this.simulateDownload(year, month);
  }

  private simulateDownload(year: number, month: number): void {
    setTimeout(() => {
      this.isDownloading = false;
      this.snackBar.open(
        `Reporte de ${this.getMonthName(
          month
        )} ${year} descargado exitosamente`,
        'Cerrar',
        { duration: 3000 }
      );
    }, 2000);
  }

  private handleFileDownload(blob: Blob, year: number, month: number): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-mensual-${year}-${(month + 1)
      .toString()
      .padStart(2, '0')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private handleDownloadError(error: any): void {
    console.error('Error al descargar reporte:', error);
    this.snackBar.open(
      'Error al generar el reporte. Inténtalo nuevamente.',
      'Cerrar',
      { duration: 5000 }
    );
  }

  private getMonthName(monthIndex: number): string {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return months[monthIndex];
  }
}
