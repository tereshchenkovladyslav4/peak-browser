import { getCorrectAnswerFormatted, isChosenAnswerCorrect, isAnswerSelectedByUser } from './quiz';
import { QuizAnswer, QuizQuestionType } from '../../models/content';

describe('getCorrectAnswerFormatted function', () => {
  test('returns correct formatted answer text', () => {
    const answers: QuizAnswer[] = [
      { answerId: null, imageUrl: null, sequence: null, answerText: 'Option A', isCorrectAnswer: true },
      { answerId: null, imageUrl: null, sequence: null, answerText: 'Option B', isCorrectAnswer: false },
    ];
    const result = getCorrectAnswerFormatted(answers);
    expect(result).toBe('Option A');
  });

  test('handles empty answers array', () => {
    const result = getCorrectAnswerFormatted([]);
    expect(result).toBe('');
  });
});

describe('isChosenAnswerCorrect function', () => {
  test('returns true for correct single choice answer', () => {
    const chosenAnswer = 'Option A';
    const answers: QuizAnswer[] = [
      { answerId: null, imageUrl: null, sequence: null, answerText: 'Option A', isCorrectAnswer: true },
      { answerId: null, imageUrl: null, sequence: null, answerText: 'Option B', isCorrectAnswer: false },
    ];
    const questionType = QuizQuestionType.ChooseSingleAnswer;
    const result = isChosenAnswerCorrect(chosenAnswer, answers, questionType);
    expect(result).toBe(true);
  });

  test('returns true for correct multiple choice answer', () => {
    const chosenAnswer = 'Option A|Option C';
    const answers: QuizAnswer[] = [
      { answerId: null, imageUrl: null, sequence: null, answerText: 'Option A', isCorrectAnswer: true },
      { answerId: null, imageUrl: null, sequence: null, answerText: 'Option B', isCorrectAnswer: false },
      { answerId: null, imageUrl: null, sequence: null, answerText: 'Option C', isCorrectAnswer: true },
    ];
    const questionType = QuizQuestionType.ChooseMultipleAnswers;
    const result = isChosenAnswerCorrect(chosenAnswer, answers, questionType);
    expect(result).toBe(true);
  });

  test('returns false for incorrect answer', () => {
    const chosenAnswer = 'Option C';
    const answers: QuizAnswer[] = [
      { answerId: null, imageUrl: null, sequence: null, answerText: 'Option A', isCorrectAnswer: true },
      { answerId: null, imageUrl: null, sequence: null, answerText: 'Option B', isCorrectAnswer: false },
    ];
    const questionType = QuizQuestionType.ChooseSingleAnswer;
    const result = isChosenAnswerCorrect(chosenAnswer, answers, questionType);
    expect(result).toBe(false);
  });

  test('returns false for null', () => {
    const chosenAnswer = null;
    const answers: QuizAnswer[] = [
      { answerId: null, imageUrl: null, sequence: null, answerText: 'Option A', isCorrectAnswer: true },
      { answerId: null, imageUrl: null, sequence: null, answerText: 'Option B', isCorrectAnswer: false },
    ];
    const questionType = QuizQuestionType.ChooseSingleAnswer;
    const result = isChosenAnswerCorrect(chosenAnswer, answers, questionType);
    expect(result).toBe(false);
  });
});

describe('isAnswerSelectedByUser function', () => {
  test('returns true for selected answer in multi-choice question', () => {
    const chosenAnswer = 'Option A|Option B';
    const answer: QuizAnswer = {
      answerId: null,
      imageUrl: null,
      sequence: null,
      answerText: 'Option B',
      isCorrectAnswer: true,
    };
    const answerIndex = 1;
    const result = isAnswerSelectedByUser(chosenAnswer, answer, answerIndex);
    expect(result).toBe(true);
  });

  test('returns true for selected answer in single-choice question', () => {
    const chosenAnswer = 'Option A';
    const answer: QuizAnswer = {
      answerId: null,
      imageUrl: null,
      sequence: null,
      answerText: 'Option A',
      isCorrectAnswer: true,
    };
    const answerIndex = 0;
    const result = isAnswerSelectedByUser(chosenAnswer, answer, answerIndex);
    expect(result).toBe(true);
  });

  test('returns false for unselected answer', () => {
    const chosenAnswer = 'Option A';
    const answer: QuizAnswer = {
      answerId: null,
      imageUrl: null,
      sequence: null,
      answerText: 'Option B',
      isCorrectAnswer: true,
    };
    const answerIndex = 1;
    const result = isAnswerSelectedByUser(chosenAnswer, answer, answerIndex);
    expect(result).toBe(false);
  });
});
