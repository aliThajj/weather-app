import { Component } from '@angular/core';
import { WeatherService } from '../../app/services/weather.service';

@Component({
  selector: 'app-weather-unit-toggle',
  imports: [],
  templateUrl: './weather-unit-toggle.component.html',
  styleUrl: './weather-unit-toggle.component.css'
})
export class WeatherUnitToggleComponent {
  unit: 'metric' | 'imperial' = 'metric';

  constructor(private weatherService: WeatherService) {
    this.weatherService.unit$.subscribe(u => this.unit = u);
  }

  toggleUnit() {
    this.unit = this.unit === 'metric' ? 'imperial' : 'metric';
    this.weatherService.setUnit(this.unit);

    const coords = this.weatherService.lastCoordinates;
    if (coords) {
      this.weatherService.getCurrentWeather(coords.lat, coords.lon).subscribe();
      this.weatherService.getWeatherForecast(coords.lat, coords.lon).subscribe();
    }
  }
}
