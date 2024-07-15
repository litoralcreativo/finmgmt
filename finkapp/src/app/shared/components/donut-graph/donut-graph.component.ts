import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ChartComponent,
  ApexTheme,
} from 'ng-apexcharts';
import { MonthlyAcumulator } from '../../models/accumulator.model';

const today = new Date();
const startingAccumulator: MonthlyAcumulator = {
  year: today.getFullYear(),
  month: today.getMonth() + 1,
  total: 0,
  groups: [],
};

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  theme: ApexTheme;
  labels: any;
};

@Component({
  selector: 'app-donut-graph',
  templateUrl: './donut-graph.component.html',
  styleUrl: './donut-graph.component.scss',
})
export class DonutGraphComponent {
  @ViewChild(ChartComponent) chart: ChartComponent;
  @Input('data') data: MonthlyAcumulator = startingAccumulator;
  @Output('scopeChange') scopeChange: EventEmitter<number> = new EventEmitter();
  public chartOptions: ChartOptions;
  showChart: boolean;

  constructor(private cdr: ChangeDetectorRef) {
    this.chartOptions = {
      series: [],
      chart: {
        type: 'donut',
      },
      labels: [],
      theme: {
        monochrome: {
          enabled: true,
          color: '#3878c8',
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes['data'] && this.data) {
        this.updateData();
      }
    }
  }

  updateData() {
    const outgoing = this.data.groups.filter((x) => x.amount < 0);
    this.chartOptions.series = outgoing.map((data) => {
      return Math.abs(data.amount);
    });

    this.chartOptions.labels = outgoing.map((x) => x.category.name);

    if (this.chart) {
      this.chart.labels = this.chartOptions.labels;
      this.chart.updateSeries(this.chartOptions.series);
      this.chart.resetSeries();
    }
    this.showChart = false;
    this.cdr.detectChanges();
    this.showChart = true;
  }

  onSelectionChange($event: any) {
    this.scopeChange.emit($event);
  }
}
