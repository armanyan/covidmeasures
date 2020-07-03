import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageQuestionComponent } from './page-question.component';

describe('PageQuestionComponent', () => {
  let component: PageQuestionComponent;
  let fixture: ComponentFixture<PageQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
