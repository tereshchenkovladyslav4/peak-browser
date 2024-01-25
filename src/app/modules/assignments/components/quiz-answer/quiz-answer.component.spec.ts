import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizAnswerComponent } from './quiz-answer.component';
import { QuizQuestionType } from '../../../../resources/models/content';
import { QuizResultsQuestion } from '../../../content/components/quiz/ui/quiz-results/quiz-results.component';
import { TranslationService } from '../../../../services/translation.service';

describe('QuizAnswerComponent', () => {
  let component: QuizAnswerComponent;
  let fixture: ComponentFixture<QuizAnswerComponent>;
  let translationServiceMock: jest.Mocked<TranslationService>;

  beforeEach(async () => {
    translationServiceMock = {
      getTranslationFileData: jest.fn(),
    } as unknown as jest.Mocked<TranslationService>;

    await TestBed.configureTestingModule({
      declarations: [],
      providers: [{ provide: TranslationService, useValue: translationServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct answer text for single answer question', () => {
    const question: QuizResultsQuestion = {
      type: QuizQuestionType.ChooseSingleAnswer,
      text: '',
      imageUrl: '',
      userAnsweredCorrectly: false,
      givenAnswer: '',
      answers: [
        { rowId: '1', answerText: 'Option A', selectedByUser: true, answerImgUrl: '', isCorrect: false },
        { rowId: '2', answerText: 'Option B', selectedByUser: false, answerImgUrl: '', isCorrect: true },
      ],
    };
    component.question = question;
    fixture.detectChanges();

    const answerElements = fixture.nativeElement.querySelectorAll('.answers .answer');
    expect(answerElements.length).toBe(2); // Assuming there are two answers

    // Asserting the rendered text for each answer
    expect(answerElements[0].textContent).toContain('Option A');
    expect(answerElements[1].textContent).toContain('Option B');

    // Asserting the presence of selected text for the correct answer
    expect(answerElements[1].querySelector('.text-correct-answer')).toBeTruthy();

    // Asserting the presence of your answer text
    expect(answerElements[1].querySelector('.row-id.selected-text').textContent).toContain('2');
  });

  it('should display correct answer text for multiple answer question', () => {
    const question: QuizResultsQuestion = {
      type: QuizQuestionType.ChooseMultipleAnswers,
      text: '',
      imageUrl: '',
      userAnsweredCorrectly: false,
      givenAnswer: '',
      answers: [
        { rowId: '1', answerText: 'Option A', selectedByUser: false, answerImgUrl: '', isCorrect: true },
        { rowId: '2', answerText: 'Option B', selectedByUser: true, answerImgUrl: '', isCorrect: true },
        { rowId: '3', answerText: 'Option C', selectedByUser: true, answerImgUrl: '', isCorrect: false },
      ],
    };
    component.question = question;
    fixture.detectChanges();

    const answerElements = fixture.nativeElement.querySelectorAll('.answers .answer');
    expect(answerElements.length).toBe(3); // Assuming there are three answers

    // Asserting the rendered text for each answer
    expect(answerElements[0].textContent).toContain('Option A');
    expect(answerElements[1].textContent).toContain('Option B');
    expect(answerElements[2].textContent).toContain('Option C');

    // Asserting the presence of selected text for the correct answers
    expect(answerElements[0].querySelector('.text-correct-answer')).toBeTruthy();

    // Asserting the presence of your answer text
    expect(answerElements[1].querySelector('.row-id.selected-text').textContent).toContain('2');
    expect(answerElements[2].querySelector('.row-id.selected-text').textContent).toContain('3');
  });

  it('should display acceptable answers and user answer for FillInText question', () => {
    const question: QuizResultsQuestion = {
      type: QuizQuestionType.FillInText,
      answers: [
        { answerText: 'Answer 1', rowId: '', selectedByUser: false, answerImgUrl: '', isCorrect: false },
        { answerText: 'Answer 2', rowId: '', selectedByUser: false, answerImgUrl: '', isCorrect: false },
      ],
      userAnsweredCorrectly: true,
      givenAnswer: 'User Answer',
      text: '',
      imageUrl: '',
    };
    component.question = question;
    fixture.detectChanges();

    const acceptableAnswersElement = fixture.nativeElement.querySelector('.fill-text-acceptable');
    expect(acceptableAnswersElement.textContent).toContain('Answer 1');
    expect(acceptableAnswersElement.textContent).toContain('Answer 2');

    const userAnswerElement = fixture.nativeElement.querySelector('.fill-text-given-answer');
    expect(userAnswerElement.textContent).toContain('User Answer');
  });

  it('should display True/False answers correctly for TrueFalse question', () => {
    const question: QuizResultsQuestion = {
      type: QuizQuestionType.TrueFalse,
      text: '',
      imageUrl: '',
      userAnsweredCorrectly: false,
      givenAnswer: '',
      answers: [
        { answerText: 'True', isCorrect: true, rowId: '', selectedByUser: false, answerImgUrl: '' },
        { answerText: 'False', isCorrect: false, rowId: '', selectedByUser: false, answerImgUrl: '' },
      ],
    };
    component.question = question;
    fixture.detectChanges();

    const answerElements = fixture.nativeElement.querySelectorAll('.answers .answer');
    expect(answerElements.length).toBe(2); // Assuming there are two answers

    // Asserting the rendered text for each answer
    expect(answerElements[0].textContent).toContain('True');
    expect(answerElements[1].textContent).toContain('False');
  });
});
