import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Country, State, City } from '../interfaces/location';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  private baseUrl = environment.countryStateCityBaseUrl;
  private headers = new HttpHeaders({
    'X-CSCAPI-KEY': environment.countrystatecityApiKey
  });

  constructor(private http: HttpClient) { }

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.baseUrl}/countries`, { headers: this.headers });
  }

  getStates(countryCode: string): Observable<State[]> {
    return this.http.get<State[]>(`${this.baseUrl}/countries/${countryCode}/states`, { headers: this.headers });
  }

  getCities(countryCode: string, stateCode: string): Observable<City[]> {
    return this.http.get<City[]>(`${this.baseUrl}/countries/${countryCode}/states/${stateCode}/cities`, { headers: this.headers });
  }

  // Get coordinates using OpenWeather
  getCityCoordinates(city: string, state?: string, country?: string): Observable<any> {
    const query = [city, state, country].filter(Boolean).join(',');
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${environment.openWeatherApiKey}`;
    return this.http.get<any>(url);
  }
}
