import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarkCardIconComponent } from './bookmark-card-icon.component';
import { BookmarksStateService } from '../../../../state/bookmarks/bookmarks-state.service';
import { of } from 'rxjs';

describe('BookmarkCardIconComponent', () => {
  let component: BookmarkCardIconComponent;
  let fixture: ComponentFixture<BookmarkCardIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
    }).compileComponents();

    fixture = TestBed.createComponent(BookmarkCardIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the bookmark-wrap div with white class', () => {
    component.isWhite = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.bookmark-wrap').classList.contains('white')).toBe(true);
  });

  it('should render the bookmark-wrap div without white class', () => {
    component.isWhite = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.bookmark-wrap').classList.contains('white')).toBe(false);
  });
});
