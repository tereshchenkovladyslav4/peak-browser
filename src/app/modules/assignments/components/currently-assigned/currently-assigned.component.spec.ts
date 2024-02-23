import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrentlyAssignedComponent } from './currently-assigned.component';
import { of } from 'rxjs';
import { NgxsModule } from '@ngxs/store';
import { AssignmentsState } from '../../../../state/assignments/assignments.state';
import { AssignmentsService } from '../../../../services/assignments/assignments.service';
import { TranslationService } from '../../../../services/translation.service';
import { ActivatedRoute } from '@angular/router';
import { Assignment, AssignmentEnrollmentStatus } from '../../../../resources/models/assignment';
import { ViewMode } from '../../../../resources/enums/view-mode.enum';
import { BookmarksService } from '../../../../services/bookmarks/bookmarks.service';
import { ToastrService } from 'ngx-toastr';

describe('CurrentlyAssignedComponent', () => {
  let component: CurrentlyAssignedComponent;
  let fixture: ComponentFixture<CurrentlyAssignedComponent>;
  let translationServiceMock: jest.Mocked<TranslationService>;
  let assignmentsServiceMock: jest.Mocked<AssignmentsService>;
  let activatedRouteStub: Partial<ActivatedRoute>;
  let bookmarksServiceMock: jest.Mocked<BookmarksService>;
  let toastrServiceMock: jest.Mocked<ToastrService>;

  beforeEach(async () => {
    translationServiceMock = {
      getTranslationFileData: jest.fn().mockImplementation((key: string) => {
        return key;
      }),
    } as unknown as jest.Mocked<TranslationService>;

    assignmentsServiceMock = {
      fetchCurrentAssignments: jest.fn().mockReturnValue(of([])),
    } as unknown as jest.Mocked<AssignmentsService>;

    activatedRouteStub = {};

    bookmarksServiceMock = {} as unknown as jest.Mocked<BookmarksService>;

    toastrServiceMock = {} as unknown as jest.Mocked<ToastrService>;

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [NgxsModule.forRoot([AssignmentsState])],
      providers: [
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: AssignmentsService, useValue: assignmentsServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: BookmarksService, useValue: bookmarksServiceMock },
        { provide: ToastrService, useValue: toastrServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentlyAssignedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check grid view', () => {
    const assignments = [
      { learningPath: { id: '1', name: 'LP 2', courses: [{}] }, course: { name: 'Course 1' } } as Assignment,
    ];
    assignmentsServiceMock.fetchCurrentAssignments = jest.fn().mockReturnValue(of(assignments));
    component.viewMode = ViewMode.GRID;
    component.ngOnInit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.assignment-subtitle').length).toBe(1);
  });

  it('should check list view', () => {
    const assignments = [
      { learningPath: { id: '1', name: 'LP 2', courses: [{}] }, course: { name: 'Course 1' } } as Assignment,
    ];
    assignmentsServiceMock.fetchCurrentAssignments = jest.fn().mockReturnValue(of(assignments));
    component.viewMode = ViewMode.LIST;
    component.ngOnInit();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.name-wrap').length).toBe(1);
  });

  it('should sort assignments by due date', () => {
    const assignments = [
      {
        learningPath: { id: '1', name: 'LP 1', courses: [{}] },
        dueDate: '2024-01-03',
        course: { name: 'Course 1' },
      } as Assignment,
      {
        learningPath: { id: '2', name: 'LP 2', courses: [{}] },
        dueDate: '2024-01-02',
        course: { name: 'Course 2' },
      } as Assignment,
      {
        learningPath: { id: '3', name: 'LP 3', courses: [{}] },
        dueDate: '2024-01-02',
        course: { name: 'Course 3' },
      } as Assignment,
    ];
    assignmentsServiceMock.fetchCurrentAssignments = jest.fn().mockReturnValue(of(assignments));
    component.viewMode = ViewMode.LIST;
    component.ngOnInit();

    component.getData({ sortField: 'dueDate', sortOrder: 1 });

    fixture.detectChanges();

    const nameElements = fixture.nativeElement.querySelectorAll('.name-wrap');
    expect(nameElements.length).toBe(3);
    expect(nameElements[0].textContent).toContain('Course 2');
    expect(nameElements[1].textContent).toContain('Course 3');
    expect(nameElements[2].textContent).toContain('Course 1');
  });

  it('should sort assignments by content type', () => {
    const assignments = [
      {
        learningPath: { id: '1', name: 'LP 1', courses: [{}] },
        contentType: 'BBB',
        course: { name: 'Course 1' },
      } as Assignment,
      {
        learningPath: { id: '2', name: 'LP 2', courses: [{}] },
        contentType: 'AAA',
        course: { name: 'Course 2' },
      } as Assignment,
      {
        learningPath: { id: '3', name: 'LP 3', courses: [{}] },
        contentType: 'BBB',
        course: { name: 'Course 3' },
      } as Assignment,
    ];
    assignmentsServiceMock.fetchCurrentAssignments = jest.fn().mockReturnValue(of(assignments));
    component.ngOnInit();

    component.getData({ sortField: 'content-type', sortOrder: 1 });

    fixture.detectChanges();

    const nameElements = fixture.nativeElement.querySelectorAll('.name-wrap');
    expect(nameElements.length).toBe(3);
    expect(nameElements[0].textContent).toContain('Course 2');
    expect(nameElements[1].textContent).toContain('Course 1');
    expect(nameElements[2].textContent).toContain('Course 3');
  });

  it('should sort assignments by status', () => {
    const assignments = [
      {
        learningPath: { id: '1', name: 'LP 1', courses: [{}] },
        progress: 75,
        course: { name: 'Course 1' },
      } as Assignment,
      {
        learningPath: { id: '2', name: 'LP 2', courses: [{}] },
        progress: 90,
        course: { name: 'Course 2' },
      } as Assignment,
      {
        learningPath: { id: '3', name: 'LP 3', courses: [{}] },
        progress: 75,
        course: { name: 'Course 3' },
      } as Assignment,
    ];
    assignmentsServiceMock.fetchCurrentAssignments = jest.fn().mockReturnValue(of(assignments));
    component.ngOnInit();

    component.getData({ sortField: 'status', sortOrder: 1 });

    fixture.detectChanges();

    const nameElements = fixture.nativeElement.querySelectorAll('.name-wrap');
    expect(nameElements.length).toBe(3);
    expect(nameElements[0].textContent).toContain('Course 2');
    expect(nameElements[1].textContent).toContain('Course 1');
    expect(nameElements[2].textContent).toContain('Course 3');
  });

  it('should sort assignments by learning path', () => {
    const assignments = [
      { learningPath: { id: '1', name: 'LP 2', courses: [{}] }, course: { name: 'Course 1' } } as Assignment,
      { learningPath: { id: '2', name: 'LP 1', courses: [{}] }, course: { name: 'Course 2' } } as Assignment,
      { learningPath: { id: '3', name: 'LP 2', courses: [{}] }, course: { name: 'Course 3' } } as Assignment,
    ];
    assignmentsServiceMock.fetchCurrentAssignments = jest.fn().mockReturnValue(of(assignments));
    component.ngOnInit();

    component.getData({ sortField: 'learning-path', sortOrder: 1 });

    fixture.detectChanges();

    const nameElements = fixture.nativeElement.querySelectorAll('.name-wrap');
    expect(nameElements.length).toBe(3);
    expect(nameElements[0].textContent).toContain('Course 2');
    expect(nameElements[1].textContent).toContain('Course 1');
    expect(nameElements[2].textContent).toContain('Course 3');
  });

  it('should sort assignments by course', () => {
    const assignments = [
      { learningPath: { id: '1', name: 'LP 2', courses: [{}] }, course: { name: 'Course 1' } } as Assignment,
      { learningPath: { id: '2', name: 'LP 1', courses: [{}] }, course: { name: 'Course 2' } } as Assignment,
      { learningPath: { id: '3', name: 'LP 2', courses: [{}] }, course: { name: 'Course 3' } } as Assignment,
    ];
    assignmentsServiceMock.fetchCurrentAssignments = jest.fn().mockReturnValue(of(assignments));
    component.ngOnInit();

    component.getData({ sortField: 'course', sortOrder: 1 });

    fixture.detectChanges();

    const nameElements = fixture.nativeElement.querySelectorAll('.name-wrap');
    expect(nameElements.length).toBe(3);
    expect(nameElements[0].textContent).toContain('Course 1');
    expect(nameElements[1].textContent).toContain('Course 2');
    expect(nameElements[2].textContent).toContain('Course 3');
  });

  it('should check active assignments', () => {
    const assignments = [
      {
        learningPath: { id: '1', courses: [{}] },
        status: AssignmentEnrollmentStatus.Not_Started as unknown as string,
        course: { name: 'Course 1' },
      } as Assignment,
      {
        learningPath: { id: '2', courses: [{}] },
        status: AssignmentEnrollmentStatus.In_Progress as unknown as string,
        course: { name: 'Course 2' },
      } as Assignment,
      {
        learningPath: { id: '3', courses: [{}] },
        status: AssignmentEnrollmentStatus.Completed as unknown as string,
        course: { name: 'Course 3' },
      } as Assignment,
      {
        learningPath: { id: '4', courses: [{}] },
        status: AssignmentEnrollmentStatus.Dropped as unknown as string,
        course: { name: 'Course 4' },
      } as Assignment,
      {
        learningPath: { id: '5', courses: [{}] },
        status: AssignmentEnrollmentStatus.Expired as unknown as string,
        course: { name: 'Course 5' },
      } as Assignment,
      {
        learningPath: { id: '5', courses: [{}] },
        status: AssignmentEnrollmentStatus.Enrolled as unknown as string,
        course: { name: 'Course 6' },
      } as Assignment,
    ];
    assignmentsServiceMock.fetchCurrentAssignments = jest.fn().mockReturnValue(of(assignments));
    component.ngOnInit();

    fixture.detectChanges();

    const nameElements = fixture.nativeElement.querySelectorAll('.name-wrap');
    expect(nameElements.length).toBe(3);
  });
});
