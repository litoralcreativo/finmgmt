import { CurrencyPipe } from '@angular/common';
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
  ApexPlotOptions,
  ApexOptions,
  ApexLegend,
  ApexTooltip,
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
  theme: ApexTheme;
  plotOptions: ApexPlotOptions;
  labels: any;
  legend: ApexLegend;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-donut-graph',
  templateUrl: './donut-graph.component.html',
  styleUrl: './donut-graph.component.scss',
  providers: [CurrencyPipe],
})
export class DonutGraphComponent {
  @ViewChild(ChartComponent) chart: ChartComponent;
  @Input('data') data: MonthlyAcumulator = startingAccumulator;
  @Input('colorTheme') colorTheme: string = '#3878c8';
  @Output('scopeChange') scopeChange: EventEmitter<number> = new EventEmitter();
  @Output('categorySelected') categorySelected: EventEmitter<{
    name: string;
    selected: boolean;
  }> = new EventEmitter();
  public chartOptions: ChartOptions;
  showChart: boolean;

  constructor(
    private cdr: ChangeDetectorRef,
    private currencyPipe: CurrencyPipe
  ) {
    this.chartOptions = {
      legend: {
        show: false,
        floating: false,
      },
      series: [],
      chart: {
        type: 'donut',
        events: {
          dataPointSelection: (e: any, chart: any, options?: any) => {
            this.onChartSelection(
              options.w.globals.labels[options.dataPointIndex],
              options.selectedDataPoints[0].length !== 0
            );
          },
        },
      },
      labels: [],
      theme: {
        monochrome: {
          enabled: true,
          color: this.colorTheme,
        },
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: { show: false },
              value: {
                show: true,
                formatter: (value) => `${this.formatCurrency(Number(value))}`,
              },
            },
            size: '60',
          },
        },
      },
      tooltip: {
        enabled: false,
      },
    };
  }
  onChartSelection(categoryName: string, selected: boolean) {
    this.categorySelected.emit({ name: categoryName, selected: selected });
  }

  private formatCurrency(value: number): string {
    return this.currencyPipe.transform(value, 'USD', 'symbol', '1.2-2')!;
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (this.data && (changes['data'] || changes['colorTheme'])) {
        this.updateData();
      }
    }
  }

  updateData() {
    if (this.data.groups.length === 0) return;
    const outgoing = this.data.groups.filter((x) => x.amount < 0);
    this.chartOptions.series = outgoing.map((data) => {
      return Math.abs(data.amount);
    });

    this.chartOptions.labels = outgoing.map((x) => x.category.name);

    this.chartOptions.theme = {
      monochrome: {
        enabled: true,
        color: this.colorTheme,
      },
    };

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
