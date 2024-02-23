import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignmentCardComponent } from './assignment-card.component';
import { TranslationService } from '../../../../services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { BookmarksService } from '../../../../services/bookmarks/bookmarks.service';
import { Router } from '@angular/router';
import { Assignment } from '../../../../resources/models/assignment';
import {AssignmentsService} from "../../../../services/assignments/assignments.service";

describe('AssignmentCardComponent', () => {
  let component: AssignmentCardComponent;
  let fixture: ComponentFixture<AssignmentCardComponent>;
  let translationServiceMock: jest.Mocked<TranslationService>;
  let toastrServiceMock: jest.Mocked<ToastrService>;
  let storeMock: jest.Mocked<Store>;
  let bookmarksServiceMock: jest.Mocked<BookmarksService>;
  let assignmentsServiceMock: jest.Mocked<AssignmentsService>;

  beforeEach(async () => {
    translationServiceMock = {
      getTranslationFileData: jest.fn().mockImplementation((key: string) => {
        return key;
      }),
    } as unknown as jest.Mocked<TranslationService>;

    storeMock = { dispatch: jest.fn().mockReturnValue(of({})) } as unknown as jest.Mocked<Store>;

    toastrServiceMock = {} as unknown as jest.Mocked<ToastrService>;

    bookmarksServiceMock = {} as unknown as jest.Mocked<BookmarksService>;

    assignmentsServiceMock = {} as unknown as jest.Mocked<AssignmentsService>;

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [CommonModule, SharedModule],
      providers: [
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: Store, useValue: storeMock },
        { provide: BookmarksService, useValue: bookmarksServiceMock },
        { provide: AssignmentsService, useValue: assignmentsServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate on assignment click', () => {
    const router: Router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.assignment = { learningPath: { id: '1' } } as Assignment;
    component.onAssignmentClick();

    expect(navigateSpy).toHaveBeenCalledWith(['/content/learning-path', '1'], { queryParams: { r: true } });
  });

  it('should set pastDue correctly', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    component.assignment = { dueDate: yesterday.toISOString() } as Assignment;
    component.ngOnInit();
    expect(component.pastDue).toBe(true);

    component.assignment = { dueDate: tomorrow.toISOString() } as Assignment;
    component.ngOnInit();
    expect(component.pastDue).toBe(false);
  });

  it('should set image correctly', () => {
    component.assignment = { course: { imageUrl: 'course-image-url' } } as Assignment;
    component.ngOnInit();
    expect(component.image).toBe('course-image-url');

    component.assignment = { learningPath: { imageUrl: 'learning-path-image-url' } } as Assignment;
    component.ngOnInit();
    expect(component.image).toBe('learning-path-image-url');

    component.assignment = {} as Assignment;
    component.ngOnInit();
    expect(component.image).toBe(undefined);
  });

  it('should display the assignment name in the template', () => {
    component.assignment = { learningPath: { name: 'Test Learning Path' } } as Assignment;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.assignment-title').textContent).toContain('Test Learning Path');
  });

  it('should display the assignment content type and due date in the template', () => {
    component.assignment = {
      contentType: 'Test Content Type',
      dueDate: new Date().toISOString(),
      learningPath: {},
    } as Assignment;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.assignment-content-type-label').textContent).toContain('Test Content Type');
    expect(compiled.querySelector('.assignment-due-label').textContent).toContain('Due');
  });

  it('should display the assignment image in the template', () => {
    const assignment: Assignment = {
      course: { imageUrl: 'course-image-url' },
      learningPath: { imageUrl: 'learning-path-image-url' },
    } as Assignment;
    component.assignment = assignment;
    component.ngOnInit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    console.log(fixture.nativeElement.innerHTML);
    expect(compiled.querySelector('.assignment-image').getAttribute('src')).toContain('course-image-url');

    assignment.course = null;
    component.ngOnInit();
    fixture.detectChanges();
    expect(compiled.querySelector('.assignment-image').getAttribute('src')).toContain('learning-path-image-url');
  });
});
