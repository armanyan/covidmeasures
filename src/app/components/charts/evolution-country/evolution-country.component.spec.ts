import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvolutionCountryComponent } from './evolution-country.component';

describe('EvolutionCountryComponent', () => {
  let component: EvolutionCountryComponent;
  let fixture: ComponentFixture<EvolutionCountryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvolutionCountryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvolutionCountryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
