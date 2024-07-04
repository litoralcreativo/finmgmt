import {
  ChangeDetectorRef,
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
  @Input('data') data: BalanceData[][] = [];
  @Output('scopeChange') scopeChange: EventEmitter<number> = new EventEmitter();

  showChart: boolean = false;
  scope: 30;

  constructor(private cdr: ChangeDetectorRef) {
    this.chartOptions = {
      series: this.data?.map((data) => {
        return {
          name: 'BALANCE',
          data: [],
          color: '#673ab7',
        };
      }),
      chart: {
        type: 'area',
        animations: {
          enabled: false,
        },
        toolbar: {
          show: true,
          tools: {
            download: false,
            pan: false,
            reset: true,
            selection: true,
            zoom: true,
          },
        },
        zoom: {
          enabled: true,
          autoScaleYaxis: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'stepline',
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
      labels: [],
      xaxis: {
        type: 'datetime',
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

  ngOnInit(): void {
    this.chart;
  }

  ngAfterViewInit() {}

  updateData() {
    this.chartOptions.series = this.data.map((data) => {
      return {
        name: 'BALANCE',
        data: data.map((x) => x.totalAmount),
        color: '#673ab7',
      };
    });

    this.chartOptions.labels = this.data[0]?.map((x) => x.day.toISOString());

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
