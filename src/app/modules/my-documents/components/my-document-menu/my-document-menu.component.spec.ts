import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MyDocumentMenuComponent } from './my-document-menu.component';
import { TranslationService } from '../../../../services/translation.service';
import { BookmarksService } from '../../../../services/bookmarks/bookmarks.service';
import { Document } from '../../../../resources/models/content';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('MyDocumentMenuComponent', () => {
  let component: MyDocumentMenuComponent;
  let fixture: ComponentFixture<MyDocumentMenuComponent>;
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
      imports: [CommonModule, NoopAnimationsModule],
      providers: [
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: BookmarksService, useValue: bookmarksServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyDocumentMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize dropdownItems in ngOnInit', () => {
    component.ngOnInit();
    expect(component.dropdownItems.length).toEqual(1);
  });

  it('should navigate to content on goToDocumentView()', () => {
    const router: Router = TestBed.inject(Router);
    const routerSpy = jest.spyOn(router, 'navigate');
    component.document = { id: '123' } as Document;
    component.ngOnInit();
    fixture.detectChanges();

    const dropdownTrigger = fixture.nativeElement.querySelector('.dropdown-container');
    expect(dropdownTrigger).toBeTruthy();
    dropdownTrigger.click();

    fixture.detectChanges();

    const dropdownItems = fixture.nativeElement.querySelectorAll('.dropdown-item');
    expect(dropdownItems.length).toBe(1);

    dropdownItems[0].click();

    expect(routerSpy).toHaveBeenCalledWith(['/content', '123']);
  });
});
