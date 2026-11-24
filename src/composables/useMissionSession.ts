import { onScopeDispose, ref } from 'vue'
import { createMission, performAction } from '../game/mission.ts'
import type { MissionAction } from '../game/mission.ts'
import { LESSONS, actionFeedback, shortBlocker } from '../game/missionExperience.ts'

/** 管理教學與畫面狀態；回合與資源仍完全由 mission.ts 決定。 */
export function useMissionSession(options: { animationDuration?: number; reducedMotion?: () => boolean } = {}) {
  const game = ref(createMission())
  const tutorialOpen = ref(true)
  const tutorialStep = ref(0)
  const started = ref(false)
  const feedback = ref('準備好了，選一個動作開始吧！')
  const rejected = ref(false)
  const visualAction = ref<MissionAction | null>(null)
  const animationKey = ref(0)
  let animationTimer: ReturnType<typeof setTimeout> | undefined

  function clearAnimation() {
    clearTimeout(animationTimer)
    visualAction.value = null
  }

  function nextLesson() { tutorialStep.value = Math.min(LESSONS.length - 1, tutorialStep.value + 1) }
  function previousLesson() { tutorialStep.value = Math.max(0, tutorialStep.value - 1) }
  // 略過圖解後仍由「開始任務」進場，不會偷偷使用任何回合。
  function skipLessons() { tutorialStep.value = LESSONS.length }
  function startMission() { started.value = true; tutorialOpen.value = false }
  function openTutorial() { clearAnimation(); tutorialStep.value = 0; tutorialOpen.value = true }

  function act(action: MissionAction): boolean {
    if (!started.value || tutorialOpen.value || visualAction.value !== null) return false
    const result = performAction(game.value, action)
    rejected.value = !result.accepted
    if (!result.accepted) {
      feedback.value = `${shortBlocker(game.value, action)}，這次沒有使用行動機會。`
      return false
    }
    game.value = result.state
    feedback.value = actionFeedback(result.state.history.at(-1)!)
    clearAnimation()
    animationKey.value += 1
    const reduced = options.reducedMotion?.() ?? (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    const duration = reduced ? 0 : options.animationDuration ?? (typeof window === 'undefined' ? 0 : 650)
    if (duration > 0) {
      visualAction.value = action
      animationTimer = setTimeout(clearAnimation, duration)
    }
    return true
  }

  function restart() {
    clearAnimation()
    game.value = createMission()
    tutorialOpen.value = true
    tutorialStep.value = 0
    started.value = false
    feedback.value = '準備好了，選一個動作開始吧！'
    rejected.value = false
    animationKey.value = 0
  }

  onScopeDispose(clearAnimation)
  return { game, tutorialOpen, tutorialStep, started, feedback, rejected, visualAction, animationKey, nextLesson, previousLesson, skipLessons, startMission, openTutorial, act, restart }
}
