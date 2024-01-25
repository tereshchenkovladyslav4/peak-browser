import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { QuizSession, QuizSummary } from '../../../../resources/models/content/quiz';
import { DialogRef } from '../../../../services/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../services/dialog/dialog-tokens';
import { QuizResultsComponent } from './quiz-results.component';
import { QuizStateService } from '../../../../state/quiz/quiz-state.service';
import { TranslationService } from '../../../../services/translation.service';
import { SharedModule } from '../../../shared/shared.module';
import { EnrollmentService } from '../../../../services/enrollment.service';
import { of } from 'rxjs';
import { Quiz, QuizQuestion } from '../../../../resources/models/content';

describe('QuizResultsComponent', () => {
  let component: QuizResultsComponent;
  let fixture: ComponentFixture<QuizResultsComponent>;

  // Mock all services
  let dialogRefMock: jest.Mocked<DialogRef>;
  let quizStateServiceMock: jest.Mocked<QuizStateService>;
  let translationServiceMock: jest.Mocked<TranslationService>;
  let enrollmentServiceMock: jest.Mocked<EnrollmentService>;

  beforeEach(async () => {
    // Define all mock service calls
    dialogRefMock = {
      close: jest.fn(),
    } as unknown as jest.Mocked<DialogRef>;

    translationServiceMock = {
      getTranslationFileData: jest.fn(),
    } as unknown as jest.Mocked<TranslationService>;

    quizStateServiceMock = {
      reset: jest.fn(),
      updateQuiz: jest.fn(),
      updateMappedQuizQuestions: jest.fn(),
      updateQuizSession: jest.fn(),
      updateQuestionIndex: jest.fn(),
    } as unknown as jest.Mocked<QuizStateService>;

    enrollmentServiceMock = {
      getEnrollmentContentItem: jest.fn().mockReturnValue(of({})),
    } as unknown as jest.Mocked<EnrollmentService>;

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [FormsModule, SharedModule, CalendarModule, DropdownModule],
      providers: [
        { provide: DialogRef, useValue: dialogRefMock },
        {
          provide: DIALOG_DATA,
          useValue: {
            config: {},
            quizSummary: {},
            enrollId: '00000000-0000-0000-0000-000000000000',
            courseId: '00000000-0000-0000-0000-000000000000',
          },
        },
        { provide: QuizStateService, useClass: QuizStateService },
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: EnrollmentService, useValue: enrollmentServiceMock },
      ],
    }).compileComponents();

    // Initialize component for testing
    fixture = TestBed.createComponent(QuizResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize state and attempt options on ngOnInit', () => {
    // Mock data for quiz summary
    const quizSummary: QuizSummary = {
      id: '00000000-0000-0000-0000-000000000000',
      courseName: 'Mocked Course Name',
      name: 'Mocked Quiz Name',
      attempts: 1,
      quizAnswersPossible: 1,
      quizAnswersCorrect: 1,
      lastCompletionDate: new Date(),
      sessions: [new QuizSession(), new QuizSession(), new QuizSession()],
    };

    // Provide the mock data to the component
    component.data.enrollId = '00000000-0000-0000-0000-000000000000';
    component.data.courseId = '00000000-0000-0000-0000-000000000000';
    component.data.quizSummary = quizSummary;
    translationServiceMock.getTranslationFileData.mockReturnValue('Attempt');

    // Spy on the necessary methods
    const resetSpy = jest.spyOn(TestBed.inject(QuizStateService), 'reset');

    const quizDetails = new Quiz();
    quizDetails.questions = [new QuizQuestion()];
    const getEnrollmentContentItemSpy = jest
      .spyOn(TestBed.inject(EnrollmentService), 'getEnrollmentContentItem')
      .mockReturnValue(of(quizDetails));

    const updateQuizSpy = jest.spyOn(TestBed.inject(QuizStateService), 'updateQuiz');
    const updateMappedQuizQuestionsSpy = jest.spyOn(TestBed.inject(QuizStateService), 'updateMappedQuizQuestions');
    const updateQuizSessionSpy = jest.spyOn(TestBed.inject(QuizStateService), 'updateQuizSession');
    const updateQuestionIndexSpy = jest.spyOn(TestBed.inject(QuizStateService), 'updateQuestionIndex');
    const updateSessionSpy = jest.spyOn(component, 'updateSession');

    // Trigger ngOnInit
    component.ngOnInit();

    // Assertions
    expect(resetSpy).toHaveBeenCalled();
    expect(getEnrollmentContentItemSpy).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000000',
      '00000000-0000-0000-0000-000000000000',
    );
    expect(updateQuizSpy).toHaveBeenCalledWith(quizDetails);
    expect(updateMappedQuizQuestionsSpy).toHaveBeenCalled();
    expect(updateQuizSessionSpy).toHaveBeenCalledWith(quizSummary.sessions[quizSummary.sessions?.length - 1]);
    expect(updateQuestionIndexSpy).toHaveBeenCalledWith(
      quizSummary.sessions[quizSummary.sessions?.length - 1]?.questions.length,
    );
    expect(updateSessionSpy).toHaveBeenCalled();
    expect(component.attemptOptions).toEqual([
      { label: 'Attempt 3', value: 2 },
      { label: 'Attempt 2', value: 1 },
      { label: 'Attempt 1', value: 0 },
    ]);

    // Set the attempt index to the desired session
    const newAttemptIndex = 1;
    component.attemptIndex = newAttemptIndex;

    // Trigger handleChangeAttempt
    component.handleChangeAttempt();

    // Assertions
    expect(updateQuizSessionSpy).toHaveBeenCalledWith(quizSummary.sessions[newAttemptIndex]);
    expect(updateSessionSpy).toHaveBeenCalled();
  });
});
