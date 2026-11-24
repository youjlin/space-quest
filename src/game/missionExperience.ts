import { PHOTO_TARGETS, RULES, actionBlockers, canContact, failureAdvice } from './mission.ts'
import type { ActionRecord, MissionAction, MissionState } from './mission.ts'

// 教學與白話文案獨立於核心規則；不更新任何遊戲狀態。
export const LESSONS = [
  { action: 'charge', title: '充電', text: '電池不夠時，先補充電力。' },
  { action: 'capture', title: '拍照', text: '拍下照片，先存在衛星裡。' },
  { action: 'transmit', title: '傳回地球', text: '等地面站可以接收時，把照片送回來。' },
] as const

export const ACTION_LABELS: Record<MissionAction, string> = {
  charge: '充電', capture: '拍照', transmit: '傳回地球', wait: '等下一回合',
}

export function actionsUntilContact(turn: number): number | null {
  if (canContact(turn)) return 0
  const next = RULES.contactTurns.find((opportunity) => opportunity > turn)
  return next === undefined ? null : next - turn
}

export function contactMessage(state: MissionState): string {
  if (state.status !== 'active') return '任務已結束。'
  const distance = actionsUntilContact(state.turn)
  if (distance === 0) return '現在可以傳照片'
  if (distance === null) return '地面站暫時收不到，已沒有下一次接收機會。'
  return `地面站暫時收不到，還有 ${distance} 次行動後可以傳送`
}

/** 按鈕旁只顯示最相關的一個原因，避免把完整規則塞回操作區。 */
export function shortBlocker(state: MissionState, action: MissionAction): string {
  if (actionBlockers(state, action).length === 0) return ''
  if (state.status !== 'active') return '任務已結束'
  if (action === 'charge') return '電池已充滿'
  if (action === 'capture') return state.pending >= RULES.maxPending ? '照片已存滿' : '電力不足'
  if (action === 'transmit') {
    if (state.pending === 0) return '還沒有照片'
    if (!canContact(state.turn)) return '地面站暫時收不到'
    return '電力不足'
  }
  return ''
}

export function actionFeedback(record: ActionRecord): string {
  if (record.action === 'charge') return `電力補好了！這次增加 ${record.after.energy - record.before.energy} 電量。`
  const region = PHOTO_TARGETS.find(target => target.region === record.photo?.region)?.label ?? ''
  if (record.action === 'capture') return `${region}拍好了！照片已存在衛星裡，等待傳回地面。${Number(record.photo?.id.split('-')[1]) > 2 ? '這是重複區域，不增加任務目標。' : ''}`
  if (record.action === 'wait') return '等到下一回合了，電量和照片都沒有改變。'
  if (record.after.delivered >= RULES.targetImages && record.after.pending === 0) return '照片全部送達，任務完成！'
  const missing = Math.max(0, RULES.targetImages - record.after.delivered)
  return missing > 0
    ? `${region}照片送達觀測站！再送回 ${missing} 個區域就完成任務。`
    : `送達 1 張照片！把衛星裡剩下的 ${record.after.pending} 張也送回來。`
}

export function resultSummary(state: MissionState): string {
  if (state.status === 'success') return `你用了 ${state.history.length} 次行動，將 ${state.delivered} 張照片全部送回地球！`
  if (state.pending > 0) return `行動機會用完了，還有 ${state.pending} 張照片沒送回來；下次記得留電力和接收時機。`
  return `行動機會用完了，只送達 ${state.delivered} 張照片；下次記得安排拍照和傳送。`
}

/** 只選一個最能解釋本次紀錄的建議，優先指出未利用的接收時機。 */
export function resultAdvice(state: MissionState): string {
  const tips = failureAdvice(state)
  return tips.find(tip => tip.includes('不足以傳送'))
    ?? tips.find(tip => tip.includes('回合可通聯'))
    ?? tips[0] ?? ''
}
