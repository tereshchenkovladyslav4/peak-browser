import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizMenuComponent } from './quiz-menu.component';
import { DropdownMenuService } from '../../../../services/dropdown-menu.service';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { QuizResultsComponent } from '../quiz-results/quiz-results.component';
import { TranslationService } from '../../../../services/translation.service';
import { BookmarksService } from '../../../../services/bookmarks/bookmarks.service';
import { EnrollmentService } from '../../../../services/enrollment.service';

describe('QuizMenuComponent', () => {
  let component: QuizMenuComponent;
  let fixture: ComponentFixture<QuizMenuComponent>;
  let dialogService: DialogService;
  let translationServiceMock: jest.Mocked<TranslationService>;
  let bookmarksServiceMock: jest.Mocked<BookmarksService>;
  let enrollmentServiceMock: jest.Mocked<EnrollmentService>;

  beforeEach(async () => {
    translationServiceMock = {
      getTranslationFileData: jest.fn(),
    } as unknown as jest.Mocked<TranslationService>;

    bookmarksServiceMock = {} as unknown as jest.Mocked<BookmarksService>;

    enrollmentServiceMock = {} as unknown as jest.Mocked<EnrollmentService>;

    await TestBed.configureTestingModule({
      declarations: [],
      providers: [
        DropdownMenuService,
        DialogService,
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: BookmarksService, useValue: bookmarksServiceMock },
        { provide: EnrollmentService, useValue: enrollmentServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizMenuComponent);
    component = fixture.componentInstance;
    dialogService = TestBed.inject(DialogService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize dropdownItems in ngOnInit', () => {
    component.ngOnInit();
    expect(component.dropdownItems.length).toEqual(1);
  });

  it('should call openQuizResults when addReviewQuizResults action is executed', () => {
    const openQuizResultsSpy = jest.spyOn(component as any, 'openQuizResults');

    component.ngOnInit();

    const addAction = component.dropdownItems?.[0]?.action;
    addAction();

    expect(openQuizResultsSpy).toHaveBeenCalled();
  });

  it('should open QuizResultsComponent when openQuizResults is called', () => {
    const openSpy = jest.spyOn(dialogService, 'open');

    const addAction = component.dropdownItems?.[0]?.action;
    addAction();

    expect(openSpy).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalledWith(QuizResultsComponent, {
      data: {
        config: {
          containerStyles: {
            width: '1100px',
          },
        },
        quizSummary: component.quizSummary,
        enrollId: component.enrollId,
        courseId: component.courseId,
      },
    });
  });
});
