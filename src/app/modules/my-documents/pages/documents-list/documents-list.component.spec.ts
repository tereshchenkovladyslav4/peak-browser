import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentsListComponent } from './documents-list.component';
import { MyDocumentsService } from '../../../../services/my-documents/my-documents.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Document } from '../../../../resources/models/content';
import { TranslationService } from '../../../../services/translation.service';
import { BookmarksService } from '../../../../services/bookmarks/bookmarks.service';

describe('DocumentsListComponent', () => {
  let component: DocumentsListComponent;
  let fixture: ComponentFixture<DocumentsListComponent>;
  let translationServiceMock: jest.Mocked<TranslationService>;
  let myDocumentsServiceMock: jest.Mocked<MyDocumentsService>;
  let activatedRouteStub: Partial<ActivatedRoute>;
  let bookmarksServiceMock: jest.Mocked<BookmarksService>;

  const documents = [
    { id: '1', name: 'Document 1' } as Document,
    { id: '2', name: 'Document B' } as Document,
    { id: '3', name: 'Document A' } as Document,
  ];

  beforeEach(async () => {
    translationServiceMock = {
      getTranslationFileData: jest.fn().mockImplementation((key: string) => {
        return key;
      }),
    } as unknown as jest.Mocked<TranslationService>;

    myDocumentsServiceMock = {
      fetchMyDocuments: jest.fn().mockReturnValue(of(documents)),
    } as unknown as jest.Mocked<MyDocumentsService>;

    activatedRouteStub = {};

    bookmarksServiceMock = {} as unknown as jest.Mocked<BookmarksService>;

    await TestBed.configureTestingModule({
      declarations: [],
      providers: [
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: MyDocumentsService, useValue: myDocumentsServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: BookmarksService, useValue: bookmarksServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sort documents by name', () => {
    const nameElements = fixture.nativeElement.querySelectorAll('.document-name');
    expect(nameElements.length).toBe(3);
    expect(nameElements[0].textContent).toContain('Document 1');
    expect(nameElements[1].textContent).toContain('Document A');
    expect(nameElements[2].textContent).toContain('Document B');
  });
});
