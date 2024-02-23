import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { QuizButtonsComponent } from './quiz-buttons.component';
import { LearningPathActionsService } from '../../../../../../state/learning-path/actions/learning-path-actions.service';
import { QuizActionsService } from '../../../../../../state/quiz/actions/quiz-actions.service';
import { QuizStateService } from '../../../../../../state/quiz/quiz-state.service';
import { CourseNavButtonsViewComponent } from '../../../learning-path/course-nav-buttons/ui/course-nav-buttons-view.component';
import { LearningPathStateService } from '../../../../../../state/learning-path/learning-path-state.service';
import { QuizSession, TrackedQuestion } from '../../../../../../resources/models/content/quiz';

describe('QuizButtonsComponent', () => {
  let component: QuizButtonsComponent;
  let fixture: ComponentFixture<QuizButtonsComponent>;
  let learningPathActionsServiceMock: jest.Mocked<LearningPathActionsService>;
  let quizActionsServiceMock: jest.Mocked<QuizActionsService>;
  let learningPathStateServiceMock: jest.Mocked<LearningPathStateService>;
  let quizState: QuizStateService;

  beforeEach(async () => {
    learningPathActionsServiceMock = {} as unknown as jest.Mocked<LearningPathActionsService>;
    quizActionsServiceMock = {} as unknown as jest.Mocked<QuizActionsService>;
    learningPathStateServiceMock = {} as unknown as jest.Mocked<LearningPathStateService>;

    await TestBed.configureTestingModule({
      declarations: [QuizButtonsComponent, CourseNavButtonsViewComponent],
      imports: [CommonModule],
      providers: [
        {
          provide: LearningPathActionsService,
          useValue: learningPathActionsServiceMock,
        },
        { provide: QuizActionsService, useValue: quizActionsServiceMock },
        { provide: LearningPathStateService, useValue: learningPathStateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizButtonsComponent);
    component = fixture.componentInstance;
    quizState = TestBed.inject(QuizStateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show SubmitQuizBtn when quizIndex is last', () => {
    const handleSubmitQuizBtnClickSpy = jest.spyOn(component, 'handleSubmitQuizBtnClick');
    quizState.updateIsQuizOpen(true);
    quizState.updateQuizSession({
      questions: [
        { questionId: '1' } as TrackedQuestion,
        { questionId: '2' } as TrackedQuestion,
        { questionId: '3' } as TrackedQuestion,
      ],
    } as QuizSession);
    quizState.updateQuestionIndex(2);
    quizState.updateAnswerActivelySelected(true);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons?.length).toBe(1);
    expect(buttons[0].textContent).toContain('Finish Quiz');

    buttons[0].click();
    expect(handleSubmitQuizBtnClickSpy).toHaveBeenCalled();
  });

  it('should show NextQuestionButton when quizIndex is not last', () => {
    const handleNextQuestionClickSpy = jest.spyOn(component, 'handleNextQuestionClick');
    quizState.updateIsQuizOpen(true);
    quizState.updateQuizSession({
      questions: [
        { questionId: '1' } as TrackedQuestion,
        { questionId: '2' } as TrackedQuestion,
        { questionId: '3' } as TrackedQuestion,
      ],
    } as QuizSession);
    quizState.updateQuestionIndex(1);
    quizState.updateAnswerActivelySelected(true);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons?.length).toBe(1);
    expect(buttons[0].textContent).toContain('Next Question');

    buttons[0].click();
    expect(handleNextQuestionClickSpy).toHaveBeenCalled();
  });

  it('should disable the button when answer is not selected', () => {
    const handleNextQuestionClickSpy = jest.spyOn(component, 'handleNextQuestionClick');
    quizState.updateIsQuizOpen(true);
    quizState.updateQuizSession({
      questions: [
        { questionId: '1' } as TrackedQuestion,
        { questionId: '2' } as TrackedQuestion,
        { questionId: '3' } as TrackedQuestion,
      ],
    } as QuizSession);
    quizState.updateQuestionIndex(1);
    quizState.updateAnswerActivelySelected(false);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons?.length).toBe(1);
    expect(buttons[0].disabled).toBeTruthy();
    buttons[0].click();
    expect(handleNextQuestionClickSpy).not.toHaveBeenCalled();
  });
});
