import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ApexDataLabels,
  ApexLegend,
  ApexPlotOptions,
  ChartComponent,
} from 'ng-apexcharts';

import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ApexTheme,
  ApexTitleSubtitle,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  theme: ApexTheme;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent implements OnInit {
  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = {
      series: [25, 15, 44, 55, 41, 17],
      chart: {
        width: '100%',
        type: 'donut',
      },
      labels: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ],
      dataLabels: {
        enabled: false,
      },
      theme: {
        monochrome: {
          enabled: true,
          color: '#673ab7',
        },
      },
      title: {
        text: 'Number of leads',
      },
      legend: {
        position: 'bottom',
        show: false,
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

  ngOnInit(): void {}
}
