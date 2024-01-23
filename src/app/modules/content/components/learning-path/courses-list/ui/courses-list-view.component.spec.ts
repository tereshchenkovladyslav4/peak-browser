import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesListViewComponent } from './courses-list-view.component';

describe('CoursesListViewComponent', () => {
  let component: CoursesListViewComponent;
  let fixture: ComponentFixture<CoursesListViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoursesListViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursesListViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
