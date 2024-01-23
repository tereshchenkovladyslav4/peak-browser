import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarkCardIconComponent } from './bookmark-card-icon.component';

describe('BookmarkCardIconComponent', () => {
  let component: BookmarkCardIconComponent;
  let fixture: ComponentFixture<BookmarkCardIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookmarkCardIconComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookmarkCardIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
