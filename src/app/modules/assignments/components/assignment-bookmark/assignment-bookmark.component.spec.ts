import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentBookmarkComponent } from './assignment-bookmark.component';

describe('AssignmentBookmarkComponent', () => {
  let component: AssignmentBookmarkComponent;
  let fixture: ComponentFixture<AssignmentBookmarkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignmentBookmarkComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentBookmarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
