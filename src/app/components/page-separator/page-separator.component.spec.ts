import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageSeparatorComponent } from './page-separator.component';

describe('PageSeparatorComponent', () => {
  let component: PageSeparatorComponent;
  let fixture: ComponentFixture<PageSeparatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageSeparatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageSeparatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
