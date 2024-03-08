import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { BookmarkCardComponent } from './bookmark-card.component';
import { TranslationService } from '../../../../services/translation.service';
import { BookmarksService } from '../../../../services/bookmarks/bookmarks.service';
import { ContentDocumentType, ContentItem, ContentPublisher, ContentType } from '../../../../resources/models/content';
import { Bookmark } from '../../../../resources/models/content/bookmarks';

describe('BookmarkCardComponent', () => {
  let component: BookmarkCardComponent;
  let fixture: ComponentFixture<BookmarkCardComponent>;
  let translationServiceMock: jest.Mocked<TranslationService>;
  let bookmarksServiceMock: jest.Mocked<BookmarksService>;

  beforeEach(async () => {
    translationServiceMock = {
      getTranslationFileData: jest.fn().mockImplementation((key: string) => {
        return key;
      }),
    } as unknown as jest.Mocked<TranslationService>;

    bookmarksServiceMock = {} as unknown as jest.Mocked<BookmarksService>;

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [CommonModule],
      providers: [
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: BookmarksService, useValue: bookmarksServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookmarkCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display bookmark content name', () => {
    component.bookmark = {
      content: {
        id: '123',
        name: 'Sample Bookmark',
        publisher: { name: 'Sample Publisher' } as ContentPublisher,
      } as ContentItem,
      childCount: 1,
    } as Bookmark;

    component.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.bookmark-title-label').textContent).toContain('Sample Bookmark');
  });

  it('should display bookmark content publisher', () => {
    component.bookmark = {
      content: {
        id: '123',
        name: 'Sample Bookmark',
        publisher: { name: 'Sample Publisher' } as ContentPublisher,
      } as ContentItem,
      childCount: 1,
    } as Bookmark;

    component.ngOnInit();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.bookmark-subtitle-label').textContent).toContain('Sample Publisher');
  });

  it('should set content summary for document type Custom', () => {
    component.bookmark = {
      content: {
        id: '123',
        type: ContentType.Document,
        documentType: ContentDocumentType.Custom,
      } as ContentItem,
      childCount: 1,
    } as Bookmark;

    component.ngOnInit();
    fixture.detectChanges();
    expect(component.contentSummary).toBe('bookmark-card.summary-document-native');
  });

  it('should set content summary for learning path', () => {
    component.bookmark = {
      content: {
        id: '123',
        type: ContentType.LearningPath,
      } as ContentItem,
      childCount: 1,
    } as Bookmark;

    component.ngOnInit();
    fixture.detectChanges();
    expect(component.contentSummary).toBe('1bookmark-card.summary-courses');
  });

  it('should set content summary for learning course', () => {
    component.bookmark = {
      content: {
        id: '123',
        type: ContentType.Course,
      } as ContentItem,
      childCount: 1,
    } as Bookmark;

    component.ngOnInit();
    fixture.detectChanges();
    expect(component.contentSummary).toBe('1bookmark-card.summary-content-items');
  });

  it('should set content summary for learning scrom package', () => {
    component.bookmark = {
      content: {
        id: '123',
        type: ContentType.ScormPackage,
      } as ContentItem,
      childCount: 1,
    } as Bookmark;

    component.ngOnInit();
    fixture.detectChanges();
    expect(component.contentSummary).toBe('1bookmark-card.summary-content-items');
  });

  it('should set content summary for learning workflow', () => {
    component.bookmark = {
      content: {
        id: '123',
        type: ContentType.Workflow,
      } as ContentItem,
      childCount: 1,
    } as Bookmark;

    component.ngOnInit();
    fixture.detectChanges();
    expect(component.contentSummary).toBe('1bookmark-card.summary-processes');
  });

  it('should set content summary for process', () => {
    component.bookmark = {
      content: {
        id: '123',
        type: ContentType.Process,
      } as ContentItem,
      childCount: 1,
    } as Bookmark;

    component.ngOnInit();
    fixture.detectChanges();
    expect(component.contentSummary).toBe('1bookmark-card.summary-tasks');
  });

  it('should set content summary for video', () => {
    component.bookmark = {
      content: {
        id: '123',
        type: ContentType.Video,
      } as ContentItem,
      childCount: 1,
      durationInSeconds: 150,
    } as Bookmark;

    component.ngOnInit();
    fixture.detectChanges();
    expect(component.contentSummary).toBe('2 min 30 sec');
  });

  it('should set content summary for live event', () => {
    component.bookmark = {
      content: {
        id: '123',
        type: ContentType.LiveEvent,
      } as ContentItem,
      childCount: 1,
    } as Bookmark;

    component.ngOnInit();
    fixture.detectChanges();
    expect(component.contentSummary).toBe('content-type.live-event');
  });
});
