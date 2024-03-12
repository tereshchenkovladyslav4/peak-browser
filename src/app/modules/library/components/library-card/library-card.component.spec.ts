import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryCardComponent } from './library-card.component';
import { Router } from '@angular/router';
import { Library } from '../../../../resources/models/library';
import { By } from '@angular/platform-browser';
import { NAVIGATION_ROUTES } from '../../../../resources/constants/app-routes';
import { CommonModule } from '@angular/common';
import { TextTruncateDirective } from '../../../../directives/text-truncate.directive';

describe('LibraryCardComponent', () => {
  let component: LibraryCardComponent;
  let fixture: ComponentFixture<LibraryCardComponent>;

  const library = {
    libraryId: '1',
    name: 'Test Library',
    contentCount: 5,
    imageUrl: 'test.jpg',
    publishDate: new Date(),
  } as Library;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [CommonModule, TextTruncateDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryCardComponent);
    component = fixture.componentInstance;
    component.library = library;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render library title', () => {
    const titleElement = fixture.debugElement.query(By.css('.library-title-label'));
    expect(titleElement.nativeElement.textContent).toContain('Test Library');
  });

  it('should render library content count', () => {
    const contentElement = fixture.debugElement.query(By.css('.library-content-label'));
    expect(contentElement.nativeElement.textContent).toContain('5 Content Items');
  });

  it('should navigate to library details on click', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate');

    const library = {
      libraryId: '1',
      name: 'Test Library',
      contentCount: 5,
      imageUrl: 'test.jpg',
      publishDate: new Date(),
    } as Library;

    component.library = library;
    component.ngOnInit();
    fixture.detectChanges();

    const cardElement = fixture.debugElement.query(By.css('.library-card-container'));
    cardElement.triggerEventHandler('click', null);

    expect(navigateSpy).toHaveBeenCalledWith([NAVIGATION_ROUTES.libraries, '1']);
  });

  it('should set isNew to false if library is not new', () => {
    const library = {
      libraryId: '1',
      name: 'Test Library',
      contentCount: 5,
      imageUrl: 'test.jpg',
      publishDate: new Date(new Date().setDate(new Date().getDate() - 31)),
    } as Library;

    component.library = library;
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.isNew).toBe(false);
    // Html should not be updated since changeDetection is OnPush
    expect(fixture.nativeElement.querySelector('.library-banner-label')).toBeTruthy();
  });

  it('should set isNew to true if library is new', () => {
    const library = {
      libraryId: '2',
      name: 'Test Library',
      contentCount: 5,
      imageUrl: 'test.jpg',
      publishDate: new Date(new Date().setDate(new Date().getDate() - 29)),
    } as Library;

    component.library = library;
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.isNew).toBe(true);
    // Html should not be updated since changeDetection is OnPush
    expect(fixture.nativeElement.querySelector('.library-banner-label')).toBeTruthy();
  });
});
