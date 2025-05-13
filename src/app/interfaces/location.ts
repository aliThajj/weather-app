export interface Country {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
}

export interface State {
  id: number;
  name: string;
  country_id: number;
  country_code: string;
  iso2: string;
  type: string;
}

export interface City {
  id: number;
  name: string;
  state_id: number;
}
