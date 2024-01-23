import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnrollSingleContentComponent } from './enroll-single-content.component';
import { DialogRef } from '../../../services/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../services/dialog/dialog-tokens';
import { AssignmentsService } from '../../../services/assignments/assignments.service';
import { ToastrService } from 'ngx-toastr';
import { ToastrModule } from 'ngx-toastr';
import { LearningPathActionsService } from '../../../state/learning-path/actions/learning-path-actions.service';
import { CourseViewData } from '../../../modules/content/components/learning-path/models/course-view-data';
import { of } from 'rxjs/internal/observable/of';

describe('EnrollSingleContentComponent', () => {
  // Mock all services
  let dialogRefMock: jest.Mocked<DialogRef>;
  let assignmentsServiceMock: jest.Mocked<AssignmentsService>;
  let toastrServiceMock: jest.Mocked<ToastrService>;
  let learningPathActionsServiceMock: jest.Mocked<LearningPathActionsService>;
  let component: EnrollSingleContentComponent;
  let fixture: ComponentFixture<EnrollSingleContentComponent>;

  // Runs before each it block
  beforeEach(async () => {
    // Define all mock service calls
    dialogRefMock = {
      close: jest.fn(),
    } as unknown as jest.Mocked<DialogRef>;
    assignmentsServiceMock = {
      createAssignment: jest.fn(),
    } as unknown as jest.Mocked<AssignmentsService>;
    toastrServiceMock = { success: jest.fn() } as unknown as jest.Mocked<ToastrService>;
    learningPathActionsServiceMock = {
      courseAssigned: jest.fn(),
    } as unknown as jest.Mocked<LearningPathActionsService>;

    await TestBed.configureTestingModule({
      imports: [EnrollSingleContentComponent, ToastrModule.forRoot()],
      // Provide mock services in place of actual services
      providers: [
        { provide: DialogRef, useValue: dialogRefMock },
        {
          provide: DIALOG_DATA,
          useValue: {
            config: {},
            course: {},
          },
        },
        { provide: AssignmentsService, useValue: assignmentsServiceMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: LearningPathActionsService, useValue: learningPathActionsServiceMock },
      ],
    }).compileComponents();

    // Initialize component for testing
    fixture = TestBed.createComponent(EnrollSingleContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Default test
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize contentName in ngOnInit', () => {
    component.data.course = { name: 'Test Course' } as CourseViewData;
    component.ngOnInit(); // Call function from component that is being tested
    expect(component.contentName).toEqual('Test Course');
  });

  it('should display correct title and content', () => {
    // Setup
    component.contentName = 'Test Course';
    fixture.detectChanges();

    // Get the elements from HTML
    const titleElement: HTMLElement = fixture.nativeElement.querySelector('.title');
    const subtitleElement: HTMLElement = fixture.nativeElement.querySelector('.subtitle');

    // Assert values
    expect(titleElement.textContent).toContain('Enroll in Test Course');
    expect(subtitleElement.textContent).toContain('You are about to enroll in Test Course.');
  });

  it('should enroll the course when Enroll button is clicked', () => {
    // Setup
    assignmentsServiceMock.createAssignment.mockReturnValue(
      of({ userContentIdsAdded: [{ assigneeId: null, contentId: '123' }], userContentIdsNotAdded: [] }),
    );
    component.data.course = { courseId: '123' } as CourseViewData;
    component.isAssignDueDate = true;
    component.dueDate = new Date();

    // Get element from HTML and trigger click
    const enrollButton: HTMLButtonElement = fixture.nativeElement.querySelector('.button-container button:last-child');
    enrollButton.click();

    // Assert values
    expect(enrollButton.textContent.trim()).toBe('Enroll');
    expect(assignmentsServiceMock.createAssignment).toHaveBeenCalledWith(['123'], component.dueDate);
    expect(toastrServiceMock.success).toHaveBeenCalled();
    expect(learningPathActionsServiceMock.courseAssigned).toHaveBeenCalledWith(component.data.course);
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });
});
