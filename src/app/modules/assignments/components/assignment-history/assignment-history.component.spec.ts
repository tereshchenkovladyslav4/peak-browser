import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignmentHistoryComponent } from './assignment-history.component';
import { TranslationService } from '../../../../services/translation.service';
import { AssignmentHistoryService } from '../../../../services/assignment-history/assignment-history.service';
import { of } from 'rxjs';
import { BookmarksService } from '../../../../services/bookmarks/bookmarks.service';
import { EnrollmentService } from '../../../../services/enrollment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Assignment, AssignmentEnrollmentStatus } from '../../../../resources/models/assignment';
import { ContentType } from '../../../../resources/models/content';
import { ContentService } from '../../../../services/content.service';
import { DownloadService } from '../../../../services/download/download.service';
import { Store } from '@ngxs/store';
import { CertificateUnavailableReason } from '../../../../resources/models/certificate';

describe('AssignmentHistoryComponent', () => {
  let component: AssignmentHistoryComponent;
  let fixture: ComponentFixture<AssignmentHistoryComponent>;
  let translationServiceMock: jest.Mocked<TranslationService>;
  let assignmentHistoryServiceMock: jest.Mocked<AssignmentHistoryService>;
  let bookmarksServiceMock: jest.Mocked<BookmarksService>;
  let enrollmentServiceMock: jest.Mocked<EnrollmentService>;
  let contentServiceMock: jest.Mocked<ContentService>;
  let downloadServiceMock: jest.Mocked<DownloadService>;
  let activatedRouteStub: Partial<ActivatedRoute>;
  let storeMock: jest.Mocked<Store>;

  const assignments = [
    {
      enrollmentId: '1',
      learningPath: { id: '1', name: 'LP 1', courses: [{}] },
      dueDate: '2024-01-03',
      assignedDate: '2024-01-03',
      course: { id: '1', name: 'Course 1', duration: 0, type: ContentType.Course },
      status: AssignmentEnrollmentStatus.Dropped as unknown as string,
    } as Assignment,
    {
      enrollmentId: '2',
      learningPath: { id: '2', name: 'LP 2', courses: [{}] },
      dueDate: '2024-01-02',
      assignedDate: '2024-01-03',
      course: { id: '2', name: 'Course 2', duration: 0, type: ContentType.Course },
      status: AssignmentEnrollmentStatus.Completed as unknown as string,
    } as Assignment,
    {
      enrollmentId: '3',
      learningPath: { id: '3', name: 'LP 3', courses: [{}] },
      dueDate: '2024-01-02',
      assignedDate: '2024-01-03',
      course: { id: '3', name: 'Course 3', duration: 0, type: ContentType.Course },
      status: AssignmentEnrollmentStatus.Dropped as unknown as string,
    } as Assignment,
  ];

  beforeEach(async () => {
    translationServiceMock = {
      getTranslationFileData: jest.fn().mockImplementation((key: string) => {
        return key;
      }),
    } as unknown as jest.Mocked<TranslationService>;

    assignmentHistoryServiceMock = {
      fetchHistoricalAssignments: jest.fn().mockReturnValue(of(assignments)),
    } as unknown as jest.Mocked<AssignmentHistoryService>;

    bookmarksServiceMock = {} as unknown as jest.Mocked<BookmarksService>;

    enrollmentServiceMock = {
      getCourseViewDuration: jest.fn().mockReturnValue(of({})),
      getCertificateAvailable: jest.fn().mockReturnValue(of({})),
    } as unknown as jest.Mocked<EnrollmentService>;

    contentServiceMock = {} as unknown as jest.Mocked<ContentService>;

    downloadServiceMock = {} as unknown as jest.Mocked<DownloadService>;

    activatedRouteStub = {};

    storeMock = { dispatch: jest.fn().mockReturnValue(of({})) } as unknown as jest.Mocked<Store>;

    await TestBed.configureTestingModule({
      declarations: [],
      providers: [
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: AssignmentHistoryService, useValue: assignmentHistoryServiceMock },
        { provide: BookmarksService, useValue: bookmarksServiceMock },
        { provide: EnrollmentService, useValue: enrollmentServiceMock },
        { provide: ContentService, useValue: contentServiceMock },
        { provide: DownloadService, useValue: downloadServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Store, useValue: storeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentHistoryComponent);
    component = fixture.componentInstance;
    component.formFilter$ = of('');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sort assignments by status date', () => {
    component.getData({ sortField: 'statusDate', sortOrder: -1 });

    fixture.detectChanges();

    const nameElements = fixture.nativeElement.querySelectorAll('.name-wrap');
    expect(nameElements.length).toBe(3);
    expect(nameElements[0].textContent).toContain('Course 3');
    expect(nameElements[1].textContent).toContain('Course 2');
    expect(nameElements[2].textContent).toContain('Course 1');
  });

  it('should sort assignments by content type', () => {
    component.getData({ sortField: 'content-type', sortOrder: -1 });

    fixture.detectChanges();

    const nameElements = fixture.nativeElement.querySelectorAll('.name-wrap');
    expect(nameElements.length).toBe(3);
    expect(nameElements[0].textContent).toContain('Course 3');
    expect(nameElements[1].textContent).toContain('Course 2');
    expect(nameElements[2].textContent).toContain('Course 1');
  });

  it('should sort assignments by learning path', () => {
    component.getData({ sortField: 'learningPathName', sortOrder: -1 });

    fixture.detectChanges();

    const nameElements = fixture.nativeElement.querySelectorAll('.name-wrap');
    expect(nameElements.length).toBe(3);
    expect(nameElements[0].textContent).toContain('Course 3');
    expect(nameElements[1].textContent).toContain('Course 2');
    expect(nameElements[2].textContent).toContain('Course 1');
  });

  it('should sort assignments by course', () => {
    component.getData({ sortField: 'course', sortOrder: -1 });

    fixture.detectChanges();

    const nameElements = fixture.nativeElement.querySelectorAll('.name-wrap');
    expect(nameElements.length).toBe(3);
    expect(nameElements[0].textContent).toContain('Course 3');
    expect(nameElements[1].textContent).toContain('Course 2');
    expect(nameElements[2].textContent).toContain('Course 1');
  });

  it('should sort assignments by status', () => {
    component.getData({ sortField: 'statusLabel', sortOrder: -1 });

    fixture.detectChanges();

    const nameElements = fixture.nativeElement.querySelectorAll('.name-wrap');
    expect(nameElements.length).toBe(3);
    expect(nameElements[0].textContent).toContain('Course 3');
    expect(nameElements[1].textContent).toContain('Course 1');
    expect(nameElements[2].textContent).toContain('Course 2');
  });

  it('should call openCompleteDialog', () => {
    const openEnrollmentDetailsSpy = jest.spyOn(component as any, 'openEnrollmentDetails');
    fixture.detectChanges();
    const dropdownAction = component.dropdownMenusMap.get(assignments[0].enrollmentId)?.[0]?.action;
    dropdownAction();
    expect(openEnrollmentDetailsSpy).toHaveBeenCalled();
  });

  it('should call goToLearningPath', () => {
    const router: Router = TestBed.inject(Router);
    const routerSpy = jest.spyOn(router, 'navigate');
    fixture.detectChanges();
    const dropdownAction = component.dropdownMenusMap.get(assignments[0].enrollmentId)?.[1]?.action;
    dropdownAction();
    expect(routerSpy).toHaveBeenCalledWith(['/content', '1']);
  });

  it('should call reenrollInCourse', () => {
    const reenrollInCourseSpy = jest.spyOn(component as any, 'reenrollInCourse');
    fixture.detectChanges();
    const dropdownAction = component.dropdownMenusMap.get(assignments[0].enrollmentId)?.[2]?.action;
    dropdownAction();
    expect(reenrollInCourseSpy).toHaveBeenCalled();
  });

  it('should call showNoCertificateDialog', () => {
    const openCertificateSpy = jest.spyOn(component as any, 'openCertificate');
    fixture.detectChanges();
    const dropdownAction = component.dropdownMenusMap.get(assignments[0].enrollmentId)?.[5]?.action;
    dropdownAction();
    expect(openCertificateSpy).toHaveBeenCalled();
  });

  it('should call showNoCertificateCourseDroppedDialog', () => {
    const showNoCertificateCourseDroppedDialogSpy = jest.spyOn(
      component as any,
      'showNoCertificateCourseDroppedDialog',
    );
    fixture.detectChanges();
    const dropdownAction = component.dropdownMenusMap.get(assignments[0].enrollmentId)?.[5]?.action;
    dropdownAction();
    expect(showNoCertificateCourseDroppedDialogSpy).toHaveBeenCalled();
  });

  it('should call showNoCertificateDialog', () => {
    const showNoCertificateDialogSpy = jest.spyOn(component as any, 'showNoCertificateDialog');
    fixture.detectChanges();
    const dropdownAction = component.dropdownMenusMap.get(assignments[1].enrollmentId)?.[5]?.action;
    dropdownAction();
    expect(showNoCertificateDialogSpy).toHaveBeenCalled();
  });

  it('should call showNoCertificateCourseIncompleteDialog', () => {
    enrollmentServiceMock.getCertificateAvailable = jest
      .fn()
      .mockReturnValue(of({ reasonUnavailable: CertificateUnavailableReason.NOT_COMPLETE }));
    const showNoCertificateCourseIncompleteDialogSpy = jest.spyOn(
      component as any,
      'showNoCertificateCourseIncompleteDialog',
    );
    fixture.detectChanges();
    const dropdownAction = component.dropdownMenusMap.get(assignments[1].enrollmentId)?.[5]?.action;
    dropdownAction();
    expect(showNoCertificateCourseIncompleteDialogSpy).toHaveBeenCalled();
  });

  it('should call showCertificateDialog', () => {
    enrollmentServiceMock.getCertificateAvailable = jest.fn().mockReturnValue(of({ useAsDefault: true }));
    const showCertificateDialogSpy = jest.spyOn(component as any, 'showCertificateDialog');
    fixture.detectChanges();
    const dropdownAction = component.dropdownMenusMap.get(assignments[1].enrollmentId)?.[5]?.action;
    dropdownAction();
    expect(showCertificateDialogSpy).toHaveBeenCalled();
  });
});
