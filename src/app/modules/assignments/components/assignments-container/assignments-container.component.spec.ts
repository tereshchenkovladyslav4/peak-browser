import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { AssignmentsContainerComponent } from './assignments-container.component';
import { LocalStorageService } from '../../../../services/storage/services/local-storage.service';
import { TranslationService } from '../../../../services/translation.service';
import { AssignmentsState } from '../../../../state/assignments/assignments.state';
import { AssignmentsService } from '../../../../services/assignments/assignments.service';
import { BookmarksService } from '../../../../services/bookmarks/bookmarks.service';
import { ViewMode } from '../../../../resources/enums/view-mode.enum';
import { LocalStorageKey } from '../../../../resources/enums/local-storage-key.enum';
import { AssignmentHistoryService } from '../../../../services/assignment-history/assignment-history.service';
import { EnrollmentService } from '../../../../services/enrollment.service';
import { ContentService } from '../../../../services/content.service';
import { DownloadService } from '../../../../services/download/download.service';

describe('AssignmentsContainerComponent', () => {
  let component: AssignmentsContainerComponent;
  let fixture: ComponentFixture<AssignmentsContainerComponent>;
  let translationServiceMock: jest.Mocked<TranslationService>;
  let localStorageServiceMock: jest.Mocked<LocalStorageService>;
  let assignmentsServiceMock: jest.Mocked<AssignmentsService>;
  let activatedRouteStub: Partial<ActivatedRoute>;
  let bookmarksServiceMock: jest.Mocked<BookmarksService>;
  let toastrServiceMock: jest.Mocked<ToastrService>;
  let assignmentHistoryServiceMock: jest.Mocked<AssignmentHistoryService>;
  let enrollmentServiceMock: jest.Mocked<EnrollmentService>;
  let contentServiceMock: jest.Mocked<ContentService>;
  let downloadServiceMock: jest.Mocked<DownloadService>;

  beforeEach(async () => {
    translationServiceMock = {
      getTranslationFileData: jest.fn().mockImplementation((key: string) => {
        return key;
      }),
    } as unknown as jest.Mocked<TranslationService>;

    localStorageServiceMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    } as unknown as jest.Mocked<LocalStorageService>;

    assignmentsServiceMock = {
      fetchCurrentAssignments: jest.fn().mockReturnValue(of([])),
    } as unknown as jest.Mocked<AssignmentsService>;

    activatedRouteStub = {};

    bookmarksServiceMock = {} as unknown as jest.Mocked<BookmarksService>;

    toastrServiceMock = {} as unknown as jest.Mocked<ToastrService>;

    assignmentHistoryServiceMock = {
      fetchHistoricalAssignments: jest.fn().mockReturnValue(of([])),
    } as unknown as jest.Mocked<AssignmentHistoryService>;

    enrollmentServiceMock = {
      getCourseViewDuration: jest.fn().mockReturnValue(of({})),
      getCertificateAvailable: jest.fn().mockReturnValue(of({})),
    } as unknown as jest.Mocked<EnrollmentService>;

    contentServiceMock = {} as unknown as jest.Mocked<ContentService>;

    downloadServiceMock = {} as unknown as jest.Mocked<DownloadService>;

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [NgxsModule.forRoot([AssignmentsState])],
      providers: [
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock },
        { provide: AssignmentsService, useValue: assignmentsServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: BookmarksService, useValue: bookmarksServiceMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: AssignmentHistoryService, useValue: assignmentHistoryServiceMock },
        { provide: EnrollmentService, useValue: enrollmentServiceMock },
        { provide: ContentService, useValue: contentServiceMock },
        { provide: DownloadService, useValue: downloadServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentsContainerComponent);
    component = fixture.componentInstance;

    // Mock window.scroll method
    window.scroll = jest.fn();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty filter control', () => {
    expect(component.form.get('filter')).toBeTruthy();
    expect(component.form.get('filter').value).toBe(null);
  });

  it('should set formFilter$ to lowercase value of filter control', () => {
    component.form.get('filter').setValue('TEST');
    expect(component.formFilter$).toBeTruthy();
    component.formFilter$.subscribe((value) => {
      expect(value).toBe('test');
    });
  });

  it('should reset form when setCurrentTabKey is called', () => {
    jest.spyOn(component.form, 'reset');
    component.setCurrentTabKey('current');
    expect(component.form.reset).toHaveBeenCalled();
  });

  it('should change viewMode and update localStorage when handleChangeViewMode is called', () => {
    const localStorageService = TestBed.inject(LocalStorageService);
    jest.spyOn(localStorageService, 'setItem');
    component.handleChangeViewMode(ViewMode.LIST);
    expect(component.viewMode).toBe(ViewMode.LIST);
    expect(localStorageService.setItem).toHaveBeenCalledWith(LocalStorageKey.ASSIGNMENT_VIEWMODE, ViewMode.LIST);
  });

  it('should render CurrentlyAssignedComponent when currentTabKey is "current"', () => {
    const historyTabs = fixture.nativeElement.querySelectorAll('.tab');
    historyTabs[0].click();
    fixture.detectChanges();
    expect(component.currentTabKey).toBe('current');
    const currentlyAssignedComponent = fixture.nativeElement.querySelector('.currently-assigned-container');
    const assignmentHistoryComponent = fixture.nativeElement.querySelector('.assignment-history-container');
    expect(currentlyAssignedComponent).toBeTruthy();
    expect(assignmentHistoryComponent).toBeNull();
  });

  it('should render AssignmentHistoryComponent when currentTabKey is "history"', () => {
    const historyTabs = fixture.nativeElement.querySelectorAll('.tab');
    historyTabs[1].click();
    fixture.detectChanges();
    expect(component.currentTabKey).toBe('history');
    const currentlyAssignedComponent = fixture.nativeElement.querySelector('.currently-assigned-container');
    const assignmentHistoryComponent = fixture.nativeElement.querySelector('.assignment-history-container');
    expect(currentlyAssignedComponent).toBeNull();
    expect(assignmentHistoryComponent).toBeTruthy();
  });
});
