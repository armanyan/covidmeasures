import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageLoadersComponent } from './page-loaders.component';

describe('PageLoadersComponent', () => {
  let component: PageLoadersComponent;
  let fixture: ComponentFixture<PageLoadersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageLoadersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageLoadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
