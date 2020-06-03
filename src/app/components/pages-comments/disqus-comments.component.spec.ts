import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisqusCommentsComponent } from './disqus-comments.component';

describe('DisqusCommentsComponent', () => {
  let component: DisqusCommentsComponent;
  let fixture: ComponentFixture<DisqusCommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisqusCommentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisqusCommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
