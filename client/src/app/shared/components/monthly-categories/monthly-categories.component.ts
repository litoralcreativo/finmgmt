import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  AccountAcumulator,
  AccountAcumulatorGroup,
} from 'src/app/shared/models/accountAcumulator.model';
import {
  ScopeAcumulator,
  ScopeAcumulatorGroup,
} from 'src/app/shared/models/scopeAcumulator.model';

@Component({
  selector: 'app-monthly-categories',
  templateUrl: './monthly-categories.component.html',
  styleUrls: ['./monthly-categories.component.scss'],
})
export class MonthlyCategoriesComponent implements OnInit {
  year: number = 1950;
  month: number = 0;
  @Input('acumulator') acumulator: AccountAcumulator | ScopeAcumulator;
  swap?: AccountAcumulatorGroup;
  negative: AccountAcumulatorGroup[] | ScopeAcumulatorGroup[] = [];
  positive: AccountAcumulatorGroup[] | ScopeAcumulatorGroup[] = [];
  totalNegative: number;
  totalPositive: number;
  @Output('go') go: EventEmitter<-1 | 1> = new EventEmitter();
  firstDayOfMonth: Date;
  today: Date = new Date();
  nextMonth: Date;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes['acumulator']) {
        this.setData();
      }
    }
  }

  ngOnInit(): void {}

  setData() {
    if (!this.acumulator) throw new Error('No acummulator provided');

    this.totalNegative = this.acumulator.groups
      .filter((x) => x.amount < 0)
      .reduce((a, c) => a + c.amount, 0);

    this.totalPositive = this.acumulator.groups
      .filter((x) => x.amount > 0)
      .reduce((a, c) => a + c.amount, 0);

    this.negative = this.acumulator.groups.filter((x) => x.amount < 0);
    this.positive = this.acumulator.groups.filter((x) => x.amount > 0);

    this.negative.forEach(
      (x) => (x.percent = (100 * x.amount) / this.totalNegative)
    );
    this.positive.forEach(
      (x) => (x.percent = (100 * x.amount) / this.totalPositive)
    );

    this.negative.sort((a, b) => a.amount - b.amount);
    this.positive.sort((a, b) => b.amount - a.amount);

    this.setMonth();
  }

  private setMonth() {
    this.year = this.acumulator.year;
    this.month = this.acumulator.month;
    this.firstDayOfMonth = new Date(this.year, this.month);
    this.nextMonth = new Date(this.year, this.month);
    this.nextMonth.setMonth(this.nextMonth.getMonth() + 1);
  }

  get disableNext(): boolean {
    return this.today < this.nextMonth;
  }

  goToMonth(direction: -1 | 1) {
    this.go.emit(direction);
  }
}
