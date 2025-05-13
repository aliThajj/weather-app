import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationSearchComponent } from '../components/location-search/location-search.component';
import { WeatherCurrentComponent } from '../components/weather-current/weather-current.component';
import { WeatherForecastComponent } from '../components/weather-forecast/weather-forecast.component';
import { AsideMenuComponent } from '../components/aside-menu/aside-menu.component';
import { InitialStateComponent } from '../components/initial-state/initial-state.component';
import { LoadingStateComponent } from '../components/loading-state/loading-state.component';
import { ErrorStateComponent } from '../components/error-state/error-state.component';
import { Country, State, City } from '../app/interfaces/location';
import { WeatherService } from './services/weather.service';
import { Subscription } from 'rxjs';
import { WeatherChartComponent } from "../components/weather-chart/weather-chart.component";
import { TemperatureChartComponent } from '../components/temperature-chart/temperature-chart.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    LocationSearchComponent,
    AsideMenuComponent,
    WeatherCurrentComponent,
    WeatherForecastComponent,
    InitialStateComponent,
    LoadingStateComponent,
    ErrorStateComponent,
    WeatherCurrentComponent,
    WeatherChartComponent,
    TemperatureChartComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  selectedLocation: { lat: number; lon: number } | null = null;
  currentState: 'initial' | 'loading' | 'error' | 'success' = 'initial';
  errorMessage = '';

  selectedCountry: Country | null = null;
  selectedState: State | null = null;
  selectedCity: City | null = null;

  private subs = new Subscription();

  constructor(private weatherService: WeatherService) {
    this.setupErrorHandling();
    this.setupUnitListener();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private setupUnitListener() {
    this.subs.add(
      this.weatherService.unit$.subscribe(() => {
        if (this.selectedLocation) {
          this.fetchWeather(this.selectedLocation);
        }
      })
    );
  }

  private setupErrorHandling() {
    this.subs.add(
      this.weatherService.currentError$.subscribe(error => {
        if (error) this.handleError(error);
      })
    );

    this.subs.add(
      this.weatherService.forecastError$.subscribe(error => {
        if (error) this.handleError(error);
      })
    );
  }

  private handleError(error: string) {
    this.currentState = 'error';
    this.errorMessage = error;
  }

  onLocationSelected(
    coords: { lat: number; lon: number },
    locationData?: { country: Country; state: State; city: City }
  ) {
    // Avoid re-fetching if same location
    if (
      this.selectedLocation &&
      this.selectedLocation.lat === coords.lat &&
      this.selectedLocation.lon === coords.lon
    ) {
      return;
    }

    this.selectedLocation = coords;

    if (locationData) {
      this.selectedCountry = locationData.country;
      this.selectedState = locationData.state;
      this.selectedCity = locationData.city;
    }

    this.fetchWeather(coords);
  }

  private fetchWeather(coords: { lat: number; lon: number }) {
    this.currentState = 'loading';
    this.errorMessage = '';

    let currentCompleted = false;
    let forecastCompleted = false;

    const checkCompletion = () => {
      if (currentCompleted && forecastCompleted && this.currentState !== 'error') {
        this.currentState = 'success';
      }
    };

    this.subs.add(
      this.weatherService.getCurrentWeather(coords.lat, coords.lon).subscribe({
        complete: () => {
          currentCompleted = true;
          checkCompletion();
        }
      })
    );

    this.subs.add(
      this.weatherService.getWeatherForecast(coords.lat, coords.lon).subscribe({
        complete: () => {
          forecastCompleted = true;
          checkCompletion();
        }
      })
    );
  }

  retryLoading() {
    if (this.selectedLocation) {
      this.fetchWeather(this.selectedLocation);
    }
  }
}
