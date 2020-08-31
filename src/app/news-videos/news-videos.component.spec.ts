import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsVideosComponent } from './news-videos.component';

describe('NewsVideosComponent', () => {
  let component: NewsVideosComponent;
  let fixture: ComponentFixture<NewsVideosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewsVideosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
