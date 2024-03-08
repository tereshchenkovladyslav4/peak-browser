import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookmarksContainerComponent } from './bookmarks-container.component';
import { ActivatedRoute } from '@angular/router';
import { TranslationService } from '../../../../services/translation.service';
import { BookmarksService } from '../../../../services/bookmarks/bookmarks.service';
import { ContentItem, ContentPublisher } from '../../../../resources/models/content';
import { Bookmark } from '../../../../resources/models/content/bookmarks';
import { BookmarksStateService } from '../../../../state/bookmarks/bookmarks-state.service';

describe('BookmarksContainerComponent', () => {
  let component: BookmarksContainerComponent;
  let fixture: ComponentFixture<BookmarksContainerComponent>;
  let translationServiceMock: jest.Mocked<TranslationService>;
  let activatedRouteStub: Partial<ActivatedRoute>;
  let bookmarksStateService: BookmarksStateService;
  let bookmarksServiceMock: jest.Mocked<BookmarksService>;

  beforeEach(async () => {
    translationServiceMock = {
      getTranslationFileData: jest.fn().mockImplementation((key: string) => {
        return key;
      }),
    } as unknown as jest.Mocked<TranslationService>;

    activatedRouteStub = {};

    bookmarksServiceMock = {} as unknown as jest.Mocked<BookmarksService>;

    await TestBed.configureTestingModule({
      declarations: [],
      providers: [
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: BookmarksService, useValue: bookmarksServiceMock },
        BookmarksStateService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookmarksContainerComponent);
    component = fixture.componentInstance;
    bookmarksStateService = TestBed.inject(BookmarksStateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render bookmarks', () => {
    const bookmarks = [
      {
        content: {
          id: '123',
          name: 'Sample Bookmark',
          publisher: { name: 'Sample Publisher' } as ContentPublisher,
        } as ContentItem,
        childCount: 1,
      } as Bookmark,
    ];
    bookmarks.forEach((bookmark) => bookmarksStateService.addBookmark(bookmark));
    fixture.detectChanges();

    const nameElements = fixture.nativeElement.querySelectorAll('.bookmark-title-label');
    expect(nameElements.length).toBe(1);
    expect(nameElements[0].textContent).toContain('Sample Bookmark');
    console.log(fixture.nativeElement.innerHTML);
  });
});
