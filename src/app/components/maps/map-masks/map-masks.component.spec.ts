import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapMasksComponent } from './map-masks.component';

describe('MapMasksComponent', () => {
  let component: MapMasksComponent;
  let fixture: ComponentFixture<MapMasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapMasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapMasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
