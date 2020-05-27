import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelCommentsComponent } from './travel-comments.component';

describe('TravelCommentsComponent', () => {
  let component: TravelCommentsComponent;
  let fixture: ComponentFixture<TravelCommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TravelCommentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TravelCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
