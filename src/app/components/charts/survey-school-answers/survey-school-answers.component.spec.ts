import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveySchoolAnswersComponent } from './survey-school-answers.component';

describe('SurveySchoolAnswersComponent', () => {
  let component: SurveySchoolAnswersComponent;
  let fixture: ComponentFixture<SurveySchoolAnswersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveySchoolAnswersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveySchoolAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
