import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../../app/services/weather.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

interface Coordinates {
  lat: number;
  lon: number;
}

@Component({
  selector: 'app-weather-forecast',
  imports: [CommonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './weather-forecast.component.html',
  styleUrls: ['./weather-forecast.component.css']
})
export class WeatherForecastComponent implements OnInit {
  unit: 'metric' | 'imperial' = 'metric';

  ngOnInit(): void {
    this.weatherService.unit$.subscribe(unit => {
      this.unit = unit;
    });
  }

  private _coordinates: Coordinates | null = null;

  @Input()
  set coordinates(coords: Coordinates | null) {
    this._coordinates = coords;
    if (coords) {
      this.loadForecast(coords.lat, coords.lon);
    } else {
      // Clear forecast data when coordinates are null
      this.forecastData = null;
    }
  }

  get coordinates(): Coordinates | null {
    return this._coordinates;
  }

  forecastData: any[] | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(private weatherService: WeatherService) { }

  loadForecast(lat: number, lon: number) {
    this.isLoading = true;
    this.error = null;
    this.forecastData = null;

    this.weatherService.getWeatherForecast(lat, lon).subscribe({
      next: (data) => {
        this.forecastData = this.processForecastData(data);
        this.isLoading = false;
        console.log(data)
      },
      error: (err) => {
        this.error = 'Failed to load forecast data';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  onRetry() {
    if (this._coordinates) {
      this.loadForecast(this._coordinates.lat, this._coordinates.lon);
    }
  }

  private processForecastData(data: any): any[] {
    const dailyData: any[] = [];
    const days = new Set<string>();

    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString();

      if (!days.has(day)) {
        days.add(day);
        dailyData.push({
          date: date,
          temp: item.main.temp,
          weather: item.weather[0],
          wind: item.wind.speed
        });
      }
    });

    // console.log(dailyData)
    return dailyData.slice(0, 6);
  }

  // getWeatherIconUrl(iconCode: string): string {
  //   return `https://openweathermap.org/img/wn/${iconCode}.png`;
  // }

  getWeatherIconUrl(iconCode: string): string {
    // Replace 'n' with 'd' to force daytime icons
    const forcedIconCode = iconCode.replace('n', 'd');
    return `https://openweathermap.org/img/wn/${forcedIconCode}@2x.png`;
  }


}