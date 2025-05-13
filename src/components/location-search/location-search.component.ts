import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { CountryService } from '../../app/services/country.service';
import { Country, State, City } from '../../app/interfaces/location';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    AutoCompleteModule,
    DropdownModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    NgSelectModule,
  ],
  templateUrl: './location-search.component.html',
  styleUrls: ['./location-search.component.css']
})
export class LocationSearchComponent implements OnInit, OnChanges {
  @Output() locationSelected = new EventEmitter<{
    coords: { lat: number; lon: number };
    locationData: {
      country: Country;
      state: State;
      city: City;
    }
  }>();

  @Input() selectedCountry: Country | null = null;
  @Input() selectedState: State | null = null;
  @Input() selectedCity: City | null = null;

  @Input() currentState!: 'initial' | 'loading' | 'error' | 'success';

  countries: Country[] = [];
  availableStates: State[] = [];
  availableCities: City[] = [];

  filteredCountries: Country[] = [];
  filteredStates: State[] = [];
  filteredCities: City[] = [];

  isLoading = false;

  waitLoad = false;
  constructor(private countryService: CountryService) { }

  ngOnInit() {
    console.log('loading', this.isLoading);

    console.log(this.currentState)

    this.isLoading = true;
    this.loadCountries();

    const savedCountry = localStorage.getItem('selectedCountry');
    const savedState = localStorage.getItem('selectedState');
    const savedCity = localStorage.getItem('selectedCity');

    if (savedCountry) {
      this.selectedCountry = JSON.parse(savedCountry);
      if (this.selectedCountry) {
        this.loadStatesForCountry(this.selectedCountry);
      }
    }

    if (savedCountry && savedState) {
      this.selectedState = JSON.parse(savedState);

      if (this.selectedCountry && this.selectedState) {
        this.loadCitiesForStateAndSearch(
          this.selectedCountry.iso2,
          this.selectedState,
          savedCity
        );
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('loading', this.isLoading)

    if (this.selectedCountry && !this.availableStates.length) {
      this.loadStatesForCountry(this.selectedCountry);
    }

    if (this.selectedCountry && this.selectedState && !this.availableCities.length) {
      this.loadCitiesForState(this.selectedCountry.iso2, this.selectedState);
    }
  }

  loadCountries(): void {
    this.isLoading = true;
    this.countryService.getCountries()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (countries) => {
          this.countries = countries;
          this.filteredCountries = countries;
        },
        error: (err) => console.error('Failed to load countries', err)
      });
  }

  private loadStatesForCountry(country: Country) {
    this.isLoading = true;
    this.countryService.getStates(country.iso2)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (states) => {
          this.availableStates = states;
          this.filteredStates = states;
        },
        error: (err) => console.error('Failed to load states', err)
      });
  }

  private loadCitiesForState(countryCode: string, state: State) {
    this.isLoading = true;
    this.countryService.getCities(countryCode, state.iso2)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (cities) => {
          this.availableCities = cities;
          this.filteredCities = cities;
        },
        error: (err) => console.error('Failed to load cities', err)
      });
  }

  private loadCitiesForStateAndSearch(countryCode: string, state: State, savedCityStr: string | null) {
    this.isLoading = true;
    this.countryService.getCities(countryCode, state.iso2)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (cities) => {
          this.availableCities = cities;
          this.filteredCities = cities;

          if (savedCityStr) {
            this.selectedCity = JSON.parse(savedCityStr);
            this.onSearchLocation();
          }
        },
        error: (err) => console.error('Failed to load cities', err)
      });
  }

  onCountrySelect(event: AutoCompleteSelectEvent): void {
    const country = event.value as Country;
    this.selectedCountry = country;
    this.selectedState = null;
    this.selectedCity = null;
    this.availableCities = [];
    this.filteredCities = [];

    localStorage.setItem('selectedCountry', JSON.stringify(country));
    localStorage.removeItem('selectedState');
    localStorage.removeItem('selectedCity');

    this.loadStatesForCountry(country);
  }

  onStateSelect(event: AutoCompleteSelectEvent): void {
    const state = event.value as State;
    this.selectedState = state;
    this.selectedCity = null;

    localStorage.setItem('selectedState', JSON.stringify(state));
    localStorage.removeItem('selectedCity');

    if (this.selectedCountry) {
      this.loadCitiesForState(this.selectedCountry.iso2, state);
    }
  }

  onCitySelect(event: AutoCompleteSelectEvent): void {
    const city = event.value as City;
    this.selectedCity = city;
    localStorage.setItem('selectedCity', JSON.stringify(city));
    this.onSearchLocation(); // fetch Data
  }

  onSearchLocation(): void {
    console.log('onSearchLoc')
    this.isLoading = true;
    if (this.selectedCountry && this.selectedState && this.selectedCity) {
      this.waitLoad = true; // show load msg
      this.countryService.getCityCoordinates(
        this.selectedCity.name,
        this.selectedState.name,
        this.selectedCountry.name
      ).pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (res) => {
            console.log('loading', this.isLoading)
            if (res?.length) {
              this.waitLoad = false // remove load msg
              this.locationSelected.emit({
                coords: { lat: res[0].lat, lon: res[0].lon },
                locationData: {
                  country: this.selectedCountry!,
                  state: this.selectedState!,
                  city: this.selectedCity!
                }
              });
            } else {
              console.warn('Coordinates not found');
            }
          },
          error: (err) => console.error('Failed to fetch coordinates', err)
        });
    } else {
      console.error('Error: Country, state, and city must be selected!');
    }
  }

  // ### Filter Search
  filterCountries(event: { query: string }) {
    this.filteredCountries = this.countries.filter(country =>
      country.name.toLowerCase().includes(event.query.toLowerCase())
    );
  }

  filterStates(event: { query: string }) {
    this.filteredStates = this.availableStates.filter(state =>
      state.name.toLowerCase().includes(event.query.toLowerCase())
    );
  }

  filterCities(event: { query: string }) {
    this.filteredCities = this.availableCities.filter(city =>
      city.name.toLowerCase().includes(event.query.toLowerCase())
    );
  }
}
