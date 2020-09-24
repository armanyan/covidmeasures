import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyAnswersProgressComponent } from './survey-answers-progress.component';

describe('SurveyAnswersProgressComponent', () => {
  let component: SurveyAnswersProgressComponent;
  let fixture: ComponentFixture<SurveyAnswersProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyAnswersProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyAnswersProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
