export const PROGRESS_KEY = 'space-quest:progress:v1'

export interface ProgressStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}
export type StorageAccessor = () => ProgressStorage | null

function browserStorage(): ProgressStorage | null {
  return typeof window === 'undefined' ? null : window.localStorage
}

export interface LearningProgress {
  firstMissionCompleted: boolean
  secondMissionCompleted: boolean
}

function parseProgress(saved: string | null): LearningProgress {
  const empty = { firstMissionCompleted: false, secondMissionCompleted: false }
  if (!saved) return empty
  try {
    const parsed: unknown = JSON.parse(saved)
    if (typeof parsed !== 'object' || parsed === null || !('version' in parsed) || parsed.version !== 1) return empty
    return {
      firstMissionCompleted: 'firstMissionCompleted' in parsed && parsed.firstMissionCompleted === true,
      secondMissionCompleted: 'secondMissionCompleted' in parsed && parsed.secondMissionCompleted === true,
    }
  } catch { return empty }
}

export function readLearningProgress(getStorage: StorageAccessor = browserStorage): LearningProgress {
  try {
    return parseProgress(getStorage()?.getItem(PROGRESS_KEY) ?? null)
  } catch {
    // 隱私模式、儲存權限、損毀資料都不應妨礙遊玩。
    return { firstMissionCompleted: false, secondMissionCompleted: false }
  }
}

export function readFirstMissionCompleted(getStorage: StorageAccessor = browserStorage): boolean {
  return readLearningProgress(getStorage).firstMissionCompleted
}

export function readSecondMissionCompleted(getStorage: StorageAccessor = browserStorage): boolean {
  return readLearningProgress(getStorage).secondMissionCompleted
}

/** 只合併已完成旗標，不因重玩或另一關的儲存而清除既有紀錄。 */
export function saveLearningProgress(completed: Partial<LearningProgress>, getStorage: StorageAccessor = browserStorage): boolean {
  try {
    const storage = getStorage()
    if (!storage) return false
    const previous = parseProgress(storage.getItem(PROGRESS_KEY))
    const saved: { version: 1; firstMissionCompleted?: true; secondMissionCompleted?: true } = { version: 1 }
    if (completed.firstMissionCompleted || previous.firstMissionCompleted) saved.firstMissionCompleted = true
    if (completed.secondMissionCompleted || previous.secondMissionCompleted) saved.secondMissionCompleted = true
    storage.setItem(PROGRESS_KEY, JSON.stringify(saved))
    return true
  } catch {
    return false
  }
}

export function saveFirstMissionCompleted(getStorage: StorageAccessor = browserStorage): boolean {
  return saveLearningProgress({ firstMissionCompleted: true }, getStorage)
}

export function saveSecondMissionCompleted(getStorage: StorageAccessor = browserStorage): boolean {
  return saveLearningProgress({ secondMissionCompleted: true }, getStorage)
}
