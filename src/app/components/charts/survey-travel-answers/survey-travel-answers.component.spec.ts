import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyTravelAnswersComponent } from './survey-travel-answers.component';

describe('SurveyTravelAnswersComponent', () => {
  let component: SurveyTravelAnswersComponent;
  let fixture: ComponentFixture<SurveyTravelAnswersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyTravelAnswersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyTravelAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
