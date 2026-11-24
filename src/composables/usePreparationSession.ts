import { computed, ref } from 'vue'
import { PREPARATION_STEPS } from '../data/satellitePreparation.ts'
import type { PreparationChoice } from '../data/satellitePreparation.ts'
import { allPreparationCorrect, answerPreparation, createPreparation, nextPreparationStep, preparedFunctions } from '../game/satellitePreparation.ts'
import { useLearningProgress } from './useLearningProgress.ts'

export function usePreparationSession(onComplete: () => boolean = useLearningProgress().markSecondMissionCompleted) {
  const state = ref(createPreparation())
  const saveSucceeded = ref<boolean | null>(null)
  const step = computed(() => PREPARATION_STEPS[state.value.stepIndex])
  // 圖解直接由已答對的步驟推導，不另外累加零件，避免連點產生重複項目。
  const prepared = computed(() => preparedFunctions(state.value))
  function answer(stepId: string, choice: PreparationChoice): boolean {
    const next = answerPreparation(state.value, stepId, choice)
    if (next === state.value) return false
    state.value = next
    if (allPreparationCorrect(next)) saveSucceeded.value = onComplete()
    return true
  }
  function nextStep(stepId: string): boolean {
    const next = nextPreparationStep(state.value, stepId)
    if (next === state.value) return false
    state.value = next
    return true
  }
  function restart() {
    state.value = createPreparation()
    saveSucceeded.value = null
  }
  return { state, step, prepared, saveSucceeded, answer, nextStep, restart }
}
