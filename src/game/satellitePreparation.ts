import { PREPARATION_STEPS } from '../data/satellitePreparation.ts'
import type { PreparationChoice, PreparedFunction } from '../data/satellitePreparation.ts'

export interface PreparationState {
  readonly stepIndex: number
  readonly answers: readonly (PreparationChoice | null)[]
  readonly selectedAnswer: PreparationChoice | null
  readonly feedback: { readonly kind: 'correct' | 'hint'; readonly text: string } | null
  readonly phase: 'step' | 'complete'
}

export function createPreparation(): PreparationState {
  return { stepIndex: 0, answers: PREPARATION_STEPS.map(() => null), selectedAnswer: null, feedback: null, phase: 'step' }
}

export function preparedFunctions(state: PreparationState): PreparedFunction[] {
  return PREPARATION_STEPS.filter((step, index) => state.answers[index] === step.correctAnswer).map(step => step.id)
}

export function allPreparationCorrect(state: PreparationState): boolean {
  return state.answers.length === PREPARATION_STEPS.length && PREPARATION_STEPS.every((step, index) => state.answers[index] === step.correctAnswer)
}

export function answerPreparation(state: PreparationState, expectedStepId: string, choice: PreparationChoice): PreparationState {
  const step = PREPARATION_STEPS[state.stepIndex]
  if (state.phase !== 'step' || !step || step.id !== expectedStepId || state.answers[state.stepIndex] !== null) return state
  const option = step.options.find(item => item.id === choice)
  if (!option) return state
  const correct = choice === step.correctAnswer
  const answers = [...state.answers]
  if (correct) answers[state.stepIndex] = choice
  return {
    ...state, answers, selectedAnswer: choice,
    feedback: correct
      ? { kind: 'correct', text: step.explanation }
      : { kind: 'hint', text: option.hint ?? '想想這一步主要要完成什麼工作。' },
  }
}

export function nextPreparationStep(state: PreparationState, expectedStepId: string): PreparationState {
  const step = PREPARATION_STEPS[state.stepIndex]
  if (state.phase !== 'step' || !step || step.id !== expectedStepId || state.answers[state.stepIndex] !== step.correctAnswer) return state
  if (state.stepIndex === PREPARATION_STEPS.length - 1) return allPreparationCorrect(state) ? { ...state, phase: 'complete' } : state
  return { ...state, stepIndex: state.stepIndex + 1, selectedAnswer: null, feedback: null }
}
