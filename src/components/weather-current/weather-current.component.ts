import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../../app/services/weather.service';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-weather-current',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './weather-current.component.html',
  styleUrls: ['./weather-current.component.css']
})
export class WeatherCurrentComponent implements OnDestroy {
  private _coordinates: { lat: number; lon: number } | null = null;
  private weatherSub: Subscription = new Subscription();

  // @Input()
  // set coordinates(coords: { lat: number; lon: number } | null) {
  //   this._coordinates = coords;
  //   if (coords) {
  //     this.weatherService.getCurrentWeather(coords.lat, coords.lon).subscribe();
  //   } else {
  //     this.weatherService.clearCurrentWeather();
  //   }
  // }

  @Input()
  set coordinates(coords: { lat: number; lon: number } | null) {
    this._coordinates = coords;
    if (coords) {
      this.weatherSub = this.weatherService.getCurrentWeather(coords.lat, coords.lon)
        .subscribe({
          next: (data) => {
            console.log('Fetched weather data:', data);
          },
          error: (err) => {
            console.error('Error fetching weather data:', err);
          }
        });
    } else {
      this.weatherService.clearCurrentWeather();
    }
  }

  // Expose service observables directly to template
  get weatherData$() {
    console.log(this.weatherService.currentWeather$)
    return this.weatherService.currentWeather$;
  }

  constructor(public weatherService: WeatherService) { }

  ngOnDestroy() {
    this.weatherSub.unsubscribe();
  }

  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  onRetry() {
    if (this._coordinates) {
      this.weatherService.getCurrentWeather(this._coordinates.lat, this._coordinates.lon).subscribe();
    }
  }
}