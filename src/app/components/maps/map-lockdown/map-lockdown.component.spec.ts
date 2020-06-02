import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapLockdownComponent } from './map-lockdown.component';

describe('MapLockdownComponent', () => {
  let component: MapLockdownComponent;
  let fixture: ComponentFixture<MapLockdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapLockdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapLockdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
