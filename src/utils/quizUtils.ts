import { QuizQuestion, QuizAttempt } from '../types';

/**
 * Fisher-Yates shuffle algorithm.
 * Does not mutate the original array.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Shuffles the options of a QuizQuestion while keeping the correctOptionId intact.
 * Returns a new object, does not mutate the original question.
 */
export function shuffleQuestionOptions(question: QuizQuestion): QuizQuestion {
  return {
    ...question,
    options: shuffleArray(question.options),
  };
}

/**
 * Shuffles an array of QuizQuestions, and also shuffles the options of each question.
 * Returns a new array of randomized questions.
 */
export function randomizeQuizQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  const shuffledQuestions = shuffleArray(questions);
  return shuffledQuestions.map(shuffleQuestionOptions);
}

/**
 * Reconstructs the questions for a review attempt, preserving the original
 * question order and option order if they exist in the attempt data.
 * If not (old attempt), it falls back to the original bank questions.
 */
export function getReviewQuestions(attempt: QuizAttempt, bankQuestions: QuizQuestion[]): QuizQuestion[] {
  const qMap = new Map<string, QuizQuestion>();
  for (const q of bankQuestions) {
    qMap.set(q.id, q);
  }

  // 1. Determine question order
  let orderedQuestions: QuizQuestion[] = [];
  if (attempt.questionOrder && attempt.questionOrder.length > 0) {
    for (const qId of attempt.questionOrder) {
      const q = qMap.get(qId);
      if (q) {
        orderedQuestions.push(q);
      }
    }
  } else {
    // Fallback for old attempts: try to order by answers
    if (attempt.answers && attempt.answers.length > 0) {
      for (const ans of attempt.answers) {
        const q = qMap.get(ans.questionId);
        if (q) {
          orderedQuestions.push(q);
        }
      }
    } else {
      orderedQuestions = [...bankQuestions];
    }
  }

  // 2. Reconstruct option order for each question
  return orderedQuestions.map((q) => {
    const ansRecord = attempt.answers?.find((a) => a.questionId === q.id);
    if (ansRecord && ansRecord.optionOrder && ansRecord.optionOrder.length > 0) {
      // Create a map of optionId -> option
      const optMap = new Map<string, any>();
      for (const opt of q.options) {
        optMap.set(opt.id, opt);
      }

      const orderedOptions = [];
      for (const optId of ansRecord.optionOrder) {
        const opt = optMap.get(optId);
        if (opt) {
          orderedOptions.push(opt);
        }
      }

      // If some options are missing, just append them
      for (const opt of q.options) {
        if (!orderedOptions.find(o => o.id === opt.id)) {
          orderedOptions.push(opt);
        }
      }

      return {
        ...q,
        options: orderedOptions,
      };
    }
    return q; // Fallback for old attempts (no optionOrder)
  });
}
