import { CurrencyPipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexTheme,
  ApexPlotOptions,
  ApexLegend,
  ApexTooltip,
} from 'ng-apexcharts';
import { AcumulatorGroup } from '../../models/accumulator.model';

const startingAccumulator: AcumulatorGroup[] = [];

export interface ChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  theme: ApexTheme;
  plotOptions: ApexPlotOptions;
  labels: string[];
  legend: ApexLegend;
  tooltip: ApexTooltip;
}

@Component({
  selector: 'app-donut-graph',
  templateUrl: './donut-graph.component.html',
  styleUrl: './donut-graph.component.scss',
  providers: [CurrencyPipe],
})
export class DonutGraphComponent implements OnChanges {
  @ViewChild(ChartComponent) chart!: ChartComponent;
  @Input() data: AcumulatorGroup[] = startingAccumulator;
  @Input() colorTheme = '#3878c8';
  @Output() scopeChange = new EventEmitter<number>();
  @Output() categorySelected = new EventEmitter<{
    name: string;
    selected: boolean;
  }>();
  public chartOptions!: ChartOptions;
  showChart = false;
  selectedCategory?: AcumulatorGroup;

  private currencyPipe = inject(CurrencyPipe);

  constructor() {
    this.chartOptions = {
      legend: {
        show: false,
        floating: false,
      },
      series: [],
      chart: {
        animations: {
          easing: 'easein',
          speed: 300,
        },
        type: 'donut',
        events: {
          dataPointSelection: (e, chart, options?) => {
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
            size: '50',
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
    this.selectedCategory = this.data.find(
      (x) => x.category.name === categoryName
    );
    if (!selected) this.selectedCategory = undefined;
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
    if (this.data.length === 0) return;
    /* const outgoing = this.data.filter((x) => x.amount < 0); */
    this.chartOptions.series = this.data.map((data) => {
      return Math.abs(data.amount);
    });

    this.chartOptions.labels = this.data.map((x) => x.category.name);

    this.chartOptions.theme = {
      monochrome: {
        enabled: true,
        color: this.colorTheme,
      },
    };

    if (this.chart) {
      this.chart.labels = this.chartOptions.labels;
      this.chart?.updateSeries(this.chartOptions.series);
      this.chart?.resetSeries();
    }
  }

  onSelectionChange($event: number) {
    this.scopeChange.emit($event);
  }
}
