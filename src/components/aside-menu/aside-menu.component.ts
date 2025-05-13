import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../../app/services/weather.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';
import { WeatherUnitToggleComponent } from '../weather-unit-toggle/weather-unit-toggle.component';

@Component({
  selector: 'app-aside-menu',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule , WeatherUnitToggleComponent],
  templateUrl: './aside-menu.component.html',
  styleUrls: ['./aside-menu.component.css']
})
export class AsideMenuComponent implements OnInit {
  unit: 'metric' | 'imperial' = 'metric';

  // Declare properties without immediate assignment
  weatherData$!: Observable<any>;

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    // Initialize the observables in ngOnInit
    this.weatherData$ = this.weatherService.currentWeather$;

    this.weatherService.unit$.subscribe(unit => {
      this.unit = unit;
    });
  }

  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  onRetry() {
    if (this.weatherService.lastCoordinates) {
      this.weatherService.getCurrentWeather(
        this.weatherService.lastCoordinates.lat,
        this.weatherService.lastCoordinates.lon
      ).subscribe();
    }
  }
}