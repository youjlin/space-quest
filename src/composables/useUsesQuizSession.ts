import { computed, ref } from 'vue'
import { USES_QUESTIONS } from '../data/satelliteUses.ts'
import type { SatelliteUse } from '../data/satelliteUses.ts'
import { allUsesQuestionsCorrect, answerUsesQuestion, createUsesQuiz, nextUsesQuestion } from '../game/usesQuiz.ts'
import { useLearningProgress } from './useLearningProgress.ts'

export function useUsesQuizSession(onComplete: () => boolean = useLearningProgress().markFirstMissionCompleted) {
  const state = ref(createUsesQuiz())
  const saveSucceeded = ref<boolean | null>(null)
  const question = computed(() => USES_QUESTIONS[state.value.questionIndex])

  function answer(questionId: string, choice: SatelliteUse): boolean {
    const next = answerUsesQuestion(state.value, questionId, choice)
    if (next === state.value) return false
    state.value = next
    // 只有六題確實都答對才存；重複點擊已答對的選項不會再次寫入。
    if (allUsesQuestionsCorrect(next)) saveSucceeded.value = onComplete()
    return true
  }
  function nextQuestion(questionId: string) {
    const next = nextUsesQuestion(state.value, questionId)
    if (next === state.value) return false
    state.value = next
    return true
  }
  function restart() {
    state.value = createUsesQuiz()
    saveSucceeded.value = null
    // 不刪除曾完成的紀錄。
  }
  return { state, question, saveSucceeded, answer, nextQuestion, restart }
}
