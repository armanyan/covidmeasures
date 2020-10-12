import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyGatheringsAnswersComponent } from './survey-gatherings-answers.component';

describe('SurveyGatheringsAnswersComponent', () => {
  let component: SurveyGatheringsAnswersComponent;
  let fixture: ComponentFixture<SurveyGatheringsAnswersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyGatheringsAnswersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyGatheringsAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
