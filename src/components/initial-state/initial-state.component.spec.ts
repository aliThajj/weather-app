import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialStateComponent } from './initial-state.component';

describe('InitialStateComponent', () => {
  let component: InitialStateComponent;
  let fixture: ComponentFixture<InitialStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitialStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitialStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
