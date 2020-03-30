import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeathRatesComponent } from './death-rates.component';

describe('TableListComponent', () => {
  let component: DeathRatesComponent;
  let fixture: ComponentFixture<DeathRatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeathRatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeathRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
