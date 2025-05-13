import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsCoreOption } from 'echarts/core';
import { WeatherService } from '../../app/services/weather.service';
import { ForecastItem } from '../../app/interfaces/forecastitem';

// Tree-shakable ECharts imports
echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
  DataZoomComponent,
  CanvasRenderer
]);

@Component({
  selector: 'app-temperature-chart',
  templateUrl: './temperature-chart.component.html',
  styleUrls: ['./temperature-chart.component.css'],
  imports: [CommonModule, NgxEchartsDirective],
  providers: [
    provideEchartsCore({ echarts })
  ]
})
export class TemperatureChartComponent implements OnInit {
  chartOption: EChartsCoreOption = {};
  isLoading = true;
  unitSymbol = '°C';
  unit = 'metric';

  originalTemperatureData: { timestamp: number; tempC: number; icon?: string }[] = [];

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    this.weatherService.unit$.subscribe(unit => {
      this.unit = unit;
      this.unitSymbol = unit === 'metric' ? '°C' : '°F';
      this.updateChartOptions(); // triggers re-conversion and re-render
    });

    this.weatherService.forecast$.subscribe({
      next: forecast => {
        if (forecast?.list) {
          // Save raw °C values
          this.originalTemperatureData = (forecast.list as ForecastItem[]).map(item => ({ // Using Interface
            timestamp: item.dt * 1000,
            tempC: item.main.temp,
            icon: item.weather[0]?.icon
          }));

          // this.originalTemperatureData = forecast.list.map((item: any) => ({
          //   timestamp: item.dt * 1000,
          //   tempC: item.main.temp,
          //   icon: item.weather[0]?.icon
          // }));

          this.updateChartOptions();
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // handleToggle 
  toggleUnit() {
    this.unit = this.unit === 'metric' ? 'imperial' : 'metric';
    this.unitSymbol = this.unit === 'metric' ? '°C' : '°F';
    this.updateChartOptions();
  }

  // °C to °F
  private convertTemp(tempC: number): number {
    return this.unit === 'imperial'
      ? (tempC * 9) / 5 + 32
      : tempC;
  }

  private updateChartOptions() {
    const convertedData = this.originalTemperatureData.map(item => ({
      name: new Date(item.timestamp).toISOString(),
      // value: [new Date(item.timestamp), this.convertTemp(item.tempC), item.icon]
      value: [
        new Date(item.timestamp),
        this.unit === 'metric' ? item.tempC : ((item.tempC * 9) / 5 + 32),
        item.icon
      ]

    }));

    this.chartOption = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const date = new Date(params[0].value[0]);
          const temp = params[0].value[1];
          return `
            <div class="tooltip-title">${date.toLocaleString()}</div>
            <div class="tooltip-content">
              <span class="temp-indicator"></span>
              Temperature: <b>${temp.toFixed(1)}${this.unitSymbol}</b>
            </div>
          `;
        }
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: (value: number) => {
            return echarts.time.format(value, '{MM}/{dd} {HH}:{mm}', false);
          }
        }
      },
      yAxis: {
        name: `Temperature (${this.unitSymbol})`,
        type: 'value',
        axisLabel: {
          formatter: `{value} ${this.unitSymbol}`
        }
      },
      series: [{
        name: 'Temperature',
        type: 'line',
        showSymbol: false,
        data: convertedData,
        lineStyle: {
          width: 3,
          color: '#FF4560'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 69, 96, 0.5)' },
            { offset: 1, color: 'rgba(255, 69, 96, 0.1)' }
          ])
        },
        markLine: {
          silent: true,
          data: [{
            yAxis: 0,
            lineStyle: { color: '#FFA500', type: 'dashed' },
            label: { show: false }
          }]
        }
      }],
      dataZoom: [{
        type: 'inside',
        start: 0,
        end: 100,
        zoomLock: true
      }],
      visualMap: {
        top: 10,
        right: 10,
        pieces: [{
          gt: 30,
          color: '#c23531' // Red for hot
        }, {
          gt: 10,
          lte: 30,
          color: '#2f4554' // Blue for moderate
        }, {
          lte: 10,
          color: '#61a0a8' // Light blue for cold
        }],
        outOfRange: {
          color: '#999'
        }
      }
    };
  }
}
