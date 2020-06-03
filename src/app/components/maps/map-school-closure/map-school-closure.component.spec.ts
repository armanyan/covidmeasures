import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapSchoolClosureComponent } from './map-school-closure.component';

describe('MapSchoolClosureComponent', () => {
  let component: MapSchoolClosureComponent;
  let fixture: ComponentFixture<MapSchoolClosureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapSchoolClosureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapSchoolClosureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
