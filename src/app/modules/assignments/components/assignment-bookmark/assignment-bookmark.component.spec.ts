import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignmentBookmarkComponent } from './assignment-bookmark.component';
import { BookmarksStateService } from '../../../../state/bookmarks/bookmarks-state.service';
import { of } from 'rxjs';

describe('AssignmentBookmarkComponent', () => {
  let component: AssignmentBookmarkComponent;
  let fixture: ComponentFixture<AssignmentBookmarkComponent>;
  let bookmarksStateServiceMock: jest.Mocked<BookmarksStateService>;

  beforeEach(async () => {
    bookmarksStateServiceMock = {
      bookmarksMap$: of({}),
      isContentBookmarked: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<BookmarksStateService>;

    await TestBed.configureTestingModule({
      declarations: [],
      providers: [{ provide: BookmarksStateService, useValue: bookmarksStateServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentBookmarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the bookmark-wrap div with white class', () => {
    bookmarksStateServiceMock.isContentBookmarked.mockReturnValue(true);
    component.ngOnInit();

    expect(fixture.nativeElement.querySelector('.bookmark-wrap').classList.contains('white')).toBe(true);
    expect(window.getComputedStyle(fixture.nativeElement).display).toBe('block');
  });

  it('should not render the bookmark-wrap', () => {
    bookmarksStateServiceMock.isContentBookmarked.mockReturnValue(false);
    component.ngOnInit();

    expect(window.getComputedStyle(fixture.nativeElement).display).toBe('none');
  });
});
