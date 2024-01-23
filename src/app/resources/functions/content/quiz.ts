import { QuizAnswer, QuizQuestionType } from "../../models/content";

export function getCorrectAnswerFormatted(answers: QuizAnswer[]): string {
  return answers?.reduce((answerStr, answer, index) => {
    if (!answer?.isCorrectAnswer) {
      return answerStr;
    } else {
      const answerText = getAnswerTextFormatted(answer, index);
      return answerStr + (answerStr ? '|' : '') + answerText;
    }
  }, '');
}

/**
 * Converts QuizAnswer to proper text value
 * @param answer quiz answer
 * @param answerIndex index of answer within it's parent question
 * @returns QuizAnswer formatted as string
 */
function getAnswerTextFormatted(answer: QuizAnswer, answerIndex: number): string {
  return answer?.imageUrl ? `Image${Number(answerIndex) + 1}` : answer?.answerText.trim();
}

export function isChosenAnswerCorrect(chosenAnswer: string, answers: QuizAnswer[], questionType: QuizQuestionType): boolean {
  if (chosenAnswer === undefined || chosenAnswer === null || chosenAnswer === '') {
    return false;
  }

  // MULTI CHOICE
  switch(questionType) {
    case QuizQuestionType.ChooseMultipleAnswers:
      return chosenAnswer === getCorrectAnswerFormatted(answers);
    case QuizQuestionType.ChooseSingleAnswer:
    case QuizQuestionType.TrueFalse:
    case QuizQuestionType.FillInText:
      return isSingleAnswerCorrect(chosenAnswer, answers);
  }
}

function isSingleAnswerCorrect(chosenAnswer: string, answers: QuizAnswer[]): boolean {
  for (let i = 0; i < answers.length; i++) {
    const answer = answers[i];
    if (!answer?.isCorrectAnswer) continue;

    const correctAnswerModified = getAnswerTextFormatted(answer, i).toLocaleLowerCase();
    const chosenAnswerModified = chosenAnswer.trim().toLocaleLowerCase();

    if (chosenAnswerModified === correctAnswerModified) {
      return true;
    }
  }

  return false;
}

export function isAnswerSelectedByUser(chosenAnswer: string, answer: QuizAnswer, answerIndex: number): boolean {
  const answerText = getAnswerTextFormatted(answer, answerIndex);
  if (!answerText) return false;

  // possible chosenAnswer states
  // multi-choice: Answer1|Answer3|Image4
  // single-choice/fill-in-text/TF: SingleText
  return chosenAnswer.includes('|')
    ? chosenAnswer
        .split('|')
        .includes(answerText)
    : chosenAnswer === answerText;
}

