import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseDropdownMenuComponent } from './course-dropdown-menu.component';

describe('CourseDropdownMenuComponent', () => {
  let component: CourseDropdownMenuComponent;
  let fixture: ComponentFixture<CourseDropdownMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourseDropdownMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseDropdownMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
