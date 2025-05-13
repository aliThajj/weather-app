import { Component, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexStroke,
  ApexTooltip,
  ApexYAxis,
  ApexGrid,
  ApexMarkers,
  ApexPlotOptions,
  NgApexchartsModule
} from 'ng-apexcharts';
import { WeatherService } from '../../app/services/weather.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';

export type ChartOptions = {
  series: ApexAxisChartSeries | any;
  chart: ApexChart | any;
  xaxis: ApexXAxis | any;
  yaxis: ApexYAxis | ApexYAxis[] | any;
  title: ApexTitleSubtitle | any;
  stroke: ApexStroke | any;
  tooltip: ApexTooltip | any;
  colors: string[] | any;
  grid: ApexGrid | any;
  markers: ApexMarkers | any;
  plotOptions: ApexPlotOptions | any;
};

@Component({
  standalone: true,
  selector: 'app-weather-chart',
  imports: [CommonModule, NgApexchartsModule, MatProgressSpinnerModule, MatIcon],
  templateUrl: './weather-chart.component.html',
  styleUrls: ['./weather-chart.component.css']
})
export class WeatherChartComponent implements OnInit {
  public chartOptions: Partial<ChartOptions> = {}; // Initialize with empty object
  public isLoading = true;
  public hasError = false;
  public unitSymbol = '°C';

  constructor(private weatherService: WeatherService) {
    this.initializeChart();

    this.weatherService.unit$.subscribe(unit => {
      this.unitSymbol = unit === 'metric' ? '°C' : '°F';
      // this.updateTemperatureAxis();
    });
  }

  ngOnInit() {
    this.weatherService.forecast$.subscribe({
      next: (forecast) => {
        if (forecast?.list) {
          this.updateChartData(forecast.list);
        }
        this.isLoading = false;
        this.hasError = false;
      },
      error: () => {
        this.isLoading = false;
        this.hasError = true;
      }
    });
  }

  private initializeChart() {
    this.chartOptions = {
      series: [],
      chart: {
        type: 'line',
        height: 350,
        zoom: { enabled: false },
        toolbar: { show: true },
        animations: { enabled: true },
        stacked: false
      },
      colors: ['#fca5a5', '#008FFB'],
      // colors: ['#FF4560', '#fca5a5', '#008FFB'],
      // stroke: {
      //   curve: 'smooth',
      //   width: [3, 0, 2],
      //   dashArray: [0, 0, 3]
      // },
      stroke: {
        curve: 'smooth',
        width: [0, 2],  // First is humidity (column, width = 0), second is precip (line)
        dashArray: [0, 3]
      },
      plotOptions: {
        bar: {
          columnWidth: '60%',
          borderRadius: 4
        }
      },
      title: {
        text: 'Humidity & Precipitation (%)',
        align: 'left',
        style: { fontSize: '16px', fontWeight: 'bold' }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          format: 'dd MMM HH:mm',
          datetimeUTC: false
        },
        tooltip: {
          formatter: (val: any) => new Date(val).toLocaleString()
        }
      },
      // yaxis: [
      //   {
      //     title: { text: `Temperature (${this.unitSymbol})` },
      //     labels: {
      //       formatter: (val: any) => `${Math.round(val)}${this.unitSymbol}`
      //     },
      //     forceNiceScale: true,
      //     tickAmount: 5
      //   },
      //   {
      //     opposite: true,
      //     title: { text: 'Humidity & Precipitation (%)' },
      //     min: 0,
      //     max: 100,
      //     labels: {
      //       formatter: (val: any) => `${Math.round(val)}%`
      //     }
      //   }
      // ],

      yaxis: [
        {
          opposite: true,
          // title: { text: 'Humidity & Precipitation (%)' },
          min: 0,
          max: 100,
          labels: {
            formatter: (val: any) => `${Math.round(val)}%`
          }
        }
      ],

      grid: {
        borderColor: '#f1f1f1',
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5
        }
      },
      markers: {
        size: 5,
        hover: { size: 7 }
      },
      // tooltip: {
      //   enabled: true,
      //   shared: true,
      //   intersect: false,
      //   x: { format: 'dd MMM yyyy HH:mm' },
      //   custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
      //     const date = new Date(w.globals.categoryLabels[dataPointIndex]);
      //     return `
      //       <div class="custom-tooltip p-2">
      //         <div class="tooltip-item">
      //           <span class="color-indicator" style="background:${w.globals.colors[0]}"></span>
      //           Temperature: <b>${Math.round(series[0][dataPointIndex])}${this.unitSymbol}</b>
      //         </div>
      //         <div class="tooltip-item">
      //           <span class="color-indicator" style="background:${w.globals.colors[1]}"></span>
      //           Humidity: <b>${Math.round(series[1][dataPointIndex])}%</b>
      //         </div>
      //         <div class="tooltip-item">
      //           <span class="color-indicator" style="background:${w.globals.colors[2]}"></span>
      //           Precipitation: <b>${Math.round(series[2][dataPointIndex])}%</b>
      //         </div>
      //       </div>
      //     `;
      //   }
      // }

      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        x: { format: 'dd MMM yyyy HH:mm' },
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          return `
      <div class="custom-tooltip p-2">
        <div class="tooltip-item">
          <span class="color-indicator" style="background:${w.globals.colors[0]}"></span>
          Humidity: <b>${Math.round(series[0][dataPointIndex])}%</b>
        </div>
        <div class="tooltip-item">
          <span class="color-indicator" style="background:${w.globals.colors[1]}"></span>
          Precipitation: <b>${Math.round(series[1][dataPointIndex])}%</b>
        </div>
      </div>
    `;
        }
      }
    };
  }

  // private updateTemperatureAxis() {
  //   if (this.chartOptions.yaxis && Array.isArray(this.chartOptions.yaxis)) {
  //     this.chartOptions.yaxis[0].title.text = `Temperature (${this.unitSymbol})`;
  //     this.chartOptions.yaxis[0].labels.formatter = (val: any) => `${Math.round(val)}${this.unitSymbol}`;

  //     if (this.chartOptions.series?.length) {
  //       this.chartOptions = { ...this.chartOptions };
  //     }
  //   }
  // }

  // private updateChartData(forecastList: any[]) {
  //   const temperatureData = forecastList.map(item => ({
  //     x: new Date(item.dt * 1000).getTime(),
  //     y: item.main.temp
  //   }));

  //   const humidityData = forecastList.map(item => ({
  //     x: new Date(item.dt * 1000).getTime(),
  //     y: item.main.humidity
  //   }));

  //   const precipitationData = forecastList.map(item => ({
  //     x: new Date(item.dt * 1000).getTime(),
  //     y: item.pop ? item.pop * 100 : 0
  //   }));

  //   this.chartOptions.series = [
  //     {
  //       name: `Temperature (${this.unitSymbol})`,
  //       type: 'line',
  //       data: temperatureData
  //     },
  //     {
  //       name: 'Humidity (%)',
  //       type: 'column',
  //       data: humidityData
  //     },
  //     {
  //       name: 'Precipitation (%)',
  //       type: 'line',
  //       data: precipitationData
  //     }
  //   ];

  //   if (this.chartOptions.yaxis && Array.isArray(this.chartOptions.yaxis)) {
  //     this.chartOptions.yaxis[0] = {
  //       ...this.chartOptions.yaxis[0],
  //       min: Math.min(...temperatureData.map(d => Math.floor(d.y))) - 2,
  //       max: Math.max(...temperatureData.map(d => Math.ceil(d.y))) + 2
  //     };
  //   }
  // }

  private updateChartData(forecastList: any[]) {
    const humidityData = forecastList.map(item => ({
      x: new Date(item.dt * 1000).getTime(),
      y: item.main.humidity
    }));

    const precipitationData = forecastList.map(item => ({
      x: new Date(item.dt * 1000).getTime(),
      y: item.pop ? item.pop * 100 : 0
    }));

    this.chartOptions.series = [
      {
        name: 'Humidity (%)',
        type: 'column',
        data: humidityData
      },
      {
        name: 'Precipitation (%)',
        type: 'line',
        data: precipitationData
      }
    ];
  }

}