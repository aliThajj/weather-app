import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, finalize, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { DateTime } from 'luxon';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private openWeatherApiKey = environment.openWeatherApiKey;

  // Default unit is metric (Celsius)
  private unitSubject = new BehaviorSubject<'metric' | 'imperial'>('metric');
  public unit$ = this.unitSubject.asObservable();

  // Current Weather Subjects
  private currentWeatherSubject = new BehaviorSubject<any>(null);
  public currentWeather$ = this.currentWeatherSubject.asObservable();
  public currentLoading$ = new BehaviorSubject<boolean>(false);
  public currentError$ = new BehaviorSubject<string | null>(null);

  // Forecast Subjects
  private forecastSubject = new BehaviorSubject<any>(null);
  public forecast$ = this.forecastSubject.asObservable();
  public forecastLoading$ = new BehaviorSubject<boolean>(false);
  public forecastError$ = new BehaviorSubject<string | null>(null);

  public lastCoordinates: { lat: number; lon: number } | null = null;


  constructor(private http: HttpClient) { }


  setUnit(unit: 'metric' | 'imperial') {
    this.unitSubject.next(unit);
  }

  // Fetch current weather with state management
  getCurrentWeather(lat: number, lon: number): Observable<any> {
    const unit = this.unitSubject.value;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.openWeatherApiKey}&units=${unit}`;

    this.currentLoading$.next(true);
    this.currentError$.next(null);

    return this.http.get<any>(url).pipe(
      tap((data) => {
        if (data && data.dt && data.timezone) {
          const date = DateTime.fromSeconds(data.dt).setZone('utc').plus({ seconds: data.timezone });
          data.day = date.toFormat('cccc'); // e.g. Monday
          data.time = date.toFormat('h:mm a'); // e.g. 3:45 PM
        }
        this.currentWeatherSubject.next(data);
      }),
      catchError(err => {
        this.currentError$.next('Failed to load current weather');
        console.error('Current weather error:', err);
        return of(null);
      }),
      finalize(() => this.currentLoading$.next(false))
    );
  }

  // Fetch forecast with state management
  getWeatherForecast(lat: number, lon: number): Observable<any> {
    const unit = this.unitSubject.value;
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.openWeatherApiKey}&units=${unit}`;

    this.forecastLoading$.next(true);
    this.forecastError$.next(null);

    return this.http.get(url).pipe(
      tap((data) => {
        this.forecastSubject.next(data);
      }),
      catchError(err => {
        this.forecastError$.next('Failed to load forecast');
        console.error('Forecast error:', err);
        return of(null);
      }),
      finalize(() => this.forecastLoading$.next(false))
    );
  }

  // Get Unit 
  get currentUnit(): 'metric' | 'imperial' {
    return this.unitSubject.value;
  }

  // Clear Current Weather
  clearCurrentWeather(): void {
    this.currentWeatherSubject.next(null);
    this.currentError$.next(null);
  }

  // Clear Forecast Weather
  clearForecast(): void {
    this.forecastSubject.next(null);
    this.forecastError$.next(null);
  }
}