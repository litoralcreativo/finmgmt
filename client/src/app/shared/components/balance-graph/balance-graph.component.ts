import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexLegend,
} from 'ng-apexcharts';
import { BalanceData } from '../../models/balanceData.model';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  labels: string[];
  legend: ApexLegend;
  subtitle: ApexTitleSubtitle;
};

@Component({
  selector: 'app-balance-graph',
  templateUrl: './balance-graph.component.html',
  styleUrls: ['./balance-graph.component.scss'],
})
export class BalanceGraphComponent implements OnInit, OnChanges {
  @ViewChild('chart') chart: ChartComponent;
  chartOptions: ChartOptions;
  @Input('data') data: BalanceData[];
  @Output('scopeChange') scopeChange: EventEmitter<number> = new EventEmitter();

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: 'BALANCE',
          data: (this.data || []).map((x) => x.totalAmount),
          color: 'purple',
        },
      ],
      chart: {
        type: 'area',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'straight',
        width: 2,
      },
      title: {
        text: 'Fundamental Analysis of Stocks',
        align: 'left',
      },
      subtitle: {
        text: 'Price Movements',
        align: 'left',
      },
      labels: (this.data || []).map((x) => x.day.toLocaleDateString()),
      xaxis: {
        labels: {
          show: false,
        },
      },
      yaxis: {
        opposite: false,
        show: false,
      },
      legend: {
        horizontalAlign: 'left',
        show: false,
      },
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes['data'] && this.data) {
        this.updateData();
      }
    }
  }

  ngOnInit(): void {}

  updateData() {
    this.chartOptions.series = [
      {
        name: 'BALANCE',
        data: this.data.map((x) => x.totalAmount),
        color: '#673ab7',
      },
    ];
    this.chartOptions.labels = this.data.map((x) => x.day.toLocaleDateString());

    if (this.chart) {
      this.chart.labels = this.chartOptions.labels;
      this.chart.updateSeries(this.chartOptions.series);
      this.chart.resetSeries();
    }
  }

  onSelectionChange($event: any) {
    this.scopeChange.emit($event);
  }
}
