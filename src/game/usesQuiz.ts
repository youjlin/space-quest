import { USES_OPTIONS, USES_QUESTIONS } from '../data/satelliteUses.ts'
import type { SatelliteUse } from '../data/satelliteUses.ts'

export interface UsesQuizState {
  readonly questionIndex: number
  readonly answers: readonly (SatelliteUse | null)[]
  readonly selectedAnswer: SatelliteUse | null
  readonly feedback: { readonly kind: 'correct' | 'hint'; readonly text: string } | null
  readonly phase: 'question' | 'complete'
}

export function createUsesQuiz(): UsesQuizState {
  return { questionIndex: 0, answers: USES_QUESTIONS.map(() => null), selectedAnswer: null, feedback: null, phase: 'question' }
}

export function allUsesQuestionsCorrect(state: UsesQuizState): boolean {
  return state.answers.length === USES_QUESTIONS.length && USES_QUESTIONS.every((question, index) => state.answers[index] === question.correctAnswer)
}

/** 帶上題目 ID，讓延遲或重複的舊按鈕事件不會影響下一題。 */
export function answerUsesQuestion(state: UsesQuizState, expectedQuestionId: string, answer: SatelliteUse): UsesQuizState {
  const question = USES_QUESTIONS[state.questionIndex]
  if (state.phase !== 'question' || !question || question.id !== expectedQuestionId || state.answers[state.questionIndex] !== null) return state
  if (!USES_OPTIONS.some(option => option.id === answer)) return state
  const correct = answer === question.correctAnswer
  const answers = [...state.answers]
  if (correct) answers[state.questionIndex] = answer
  return {
    ...state,
    answers,
    selectedAnswer: answer,
    feedback: correct
      ? { kind: 'correct', text: question.explanation }
      : { kind: 'hint', text: question.hints[answer] ?? '再看看這個情境主要要完成什麼事。' },
  }
}

export function nextUsesQuestion(state: UsesQuizState, expectedQuestionId: string): UsesQuizState {
  const question = USES_QUESTIONS[state.questionIndex]
  if (state.phase !== 'question' || !question || question.id !== expectedQuestionId || state.answers[state.questionIndex] !== question.correctAnswer) return state
  if (state.questionIndex === USES_QUESTIONS.length - 1) {
    return allUsesQuestionsCorrect(state) ? { ...state, phase: 'complete' } : state
  }
  return { ...state, questionIndex: state.questionIndex + 1, selectedAnswer: null, feedback: null }
}
