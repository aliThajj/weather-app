import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherUnitToggleComponent } from './weather-unit-toggle.component';

describe('WeatherUnitToggleComponent', () => {
  let component: WeatherUnitToggleComponent;
  let fixture: ComponentFixture<WeatherUnitToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherUnitToggleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherUnitToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
