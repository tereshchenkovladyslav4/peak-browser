import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseNavButtonsViewComponent } from './course-nav-buttons-view.component';

describe('CourseNavButtonsViewComponent', () => {
  let component: CourseNavButtonsViewComponent;
  let fixture: ComponentFixture<CourseNavButtonsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourseNavButtonsViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseNavButtonsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
