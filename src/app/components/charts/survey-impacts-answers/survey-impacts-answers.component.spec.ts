import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyImpactsAnswersComponent } from './survey-impacts-answers.component';

describe('SurveyImpactsAnswersComponent', () => {
  let component: SurveyImpactsAnswersComponent;
  let fixture: ComponentFixture<SurveyImpactsAnswersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyImpactsAnswersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyImpactsAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
