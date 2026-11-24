import { readonly, ref } from 'vue'
import { readLearningProgress, saveLearningProgress } from '../game/learningProgress.ts'
import type { StorageAccessor } from '../game/learningProgress.ts'

export function createLearningProgressStore(getStorage?: StorageAccessor) {
  const saved = readLearningProgress(getStorage)
  const first = ref(saved.firstMissionCompleted)
  const second = ref(saved.secondMissionCompleted)
  function save(): boolean {
    return saveLearningProgress({ firstMissionCompleted: first.value, secondMissionCompleted: second.value }, getStorage)
  }
  function markFirstMissionCompleted(): boolean {
    first.value = true
    return save()
  }
  function markSecondMissionCompleted(): boolean {
    second.value = true
    return save()
  }
  return { firstMissionCompleted: readonly(first), secondMissionCompleted: readonly(second), markFirstMissionCompleted, markSecondMissionCompleted }
}

// 同一分頁的兩關與任務路線共用；儲存失敗時仍保留本次工作階段的完成狀態。
const progress = createLearningProgressStore()
export function useLearningProgress() { return progress }
