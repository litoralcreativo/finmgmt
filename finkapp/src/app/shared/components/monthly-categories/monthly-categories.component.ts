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
}
