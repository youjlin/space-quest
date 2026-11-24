/** 純遊戲規則：不依賴 Vue、計時器、瀏覽器或儲存空間。 */
export const RULES = Object.freeze({
  maxTurns: 8,
  initialEnergy: 50,
  maxEnergy: 100,
  maxPending: 2,
  targetImages: 2,
  chargeGain: 30,
  captureCost: 20,
  transmitCost: 15,
  contactTurns: Object.freeze([3, 4, 7, 8] as const),
})

export type MissionAction = 'charge' | 'capture' | 'transmit' | 'wait'
export type MissionStatus = 'active' | 'success' | 'failure'
export type PhotoRegion = 'coast' | 'forest'
export interface MissionPhoto {
  readonly id: string
  readonly region: PhotoRegion
  readonly location: 'satellite' | 'ground'
}
export const PHOTO_TARGETS = [
  { region: 'coast', label: '海岸' },
  { region: 'forest', label: '森林' },
] as const

export interface Resources {
  readonly energy: number
  readonly pending: number
  readonly delivered: number
}

export interface ActionRecord {
  readonly turn: number
  readonly action: MissionAction
  readonly before: Resources
  readonly after: Resources
  readonly photo?: MissionPhoto
}

export interface MissionState extends Resources {
  readonly photos: readonly MissionPhoto[]
  /** 進行中為待操作的回合；結束後保留最後操作的回合。 */
  readonly turn: number
  readonly status: MissionStatus
  readonly history: readonly ActionRecord[]
}

export const ACTIONS = [
  { id: 'charge', label: '充電', icon: 'sun', effect: `電量 +${RULES.chargeGain}，上限 ${RULES.maxEnergy}` },
  { id: 'capture', label: '拍攝', icon: 'camera', effect: `電量 −${RULES.captureCost}，待傳資料 +1 份` },
  { id: 'transmit', label: '傳送', icon: 'signal', effect: `電量 −${RULES.transmitCost}，傳回 1 份資料` },
  { id: 'wait', label: '等待', icon: 'clock', effect: '資源不變，前進 1 回合' },
] as const

export function createMission(): MissionState {
  return { energy: RULES.initialEnergy, pending: 0, delivered: 0, photos: [], turn: 1, status: 'active', history: [] }
}

export function canContact(turn: number): boolean {
  return RULES.contactTurns.some((contactTurn) => contactTurn === turn)
}

export function remainingActions(state: MissionState): number {
  return state.status === 'active' ? RULES.maxTurns - state.turn + 1 : 0
}

/** 一次列出所有限制，讓操作前就能看見具體原因。 */
export function actionBlockers(state: MissionState, action: MissionAction): string[] {
  if (state.status !== 'active') return ['任務已結束，請重新開始。']

  const reasons: string[] = []
  if (action === 'charge') {
    if (state.energy === RULES.maxEnergy) reasons.push(`電量已滿（${RULES.maxEnergy}），不需要充電。`)
  } else if (action === 'capture') {
    if (state.energy < RULES.captureCost) reasons.push(`拍攝需要 ${RULES.captureCost} 電量，目前只有 ${state.energy}。`)
    if (state.pending >= RULES.maxPending) reasons.push(`儲存空間已滿（${state.pending}/${RULES.maxPending} 份），請先傳送。`)
  } else if (action === 'transmit') {
    if (!canContact(state.turn)) reasons.push(`第 ${state.turn} 回合不可通聯；通聯機會為第 ${RULES.contactTurns.join('、')} 回合。`)
    if (state.pending === 0) reasons.push('沒有待傳資料，請先拍攝地球影像。')
    if (state.energy < RULES.transmitCost) reasons.push(`傳送需要 ${RULES.transmitCost} 電量，目前只有 ${state.energy}。`)
  }
  return reasons
}

export interface ActionResult {
  readonly accepted: boolean
  readonly state: MissionState
  readonly message: string
}

function snapshot(state: Resources): Resources {
  return { energy: state.energy, pending: state.pending, delivered: state.delivered }
}

/** 回傳新狀態；無效操作保留原物件，任何資源、回合與紀錄皆不改動。 */
export function performAction(state: MissionState, action: MissionAction): ActionResult {
  const reasons = actionBlockers(state, action)
  if (reasons.length > 0) return { accepted: false, state, message: reasons.join(' ') }

  const before = snapshot(state)
  let { energy, pending, delivered } = state
  let photos = state.photos
  let photo: MissionPhoto | undefined
  if (action === 'charge') energy = Math.min(RULES.maxEnergy, energy + RULES.chargeGain)
  if (action === 'capture') {
    energy -= RULES.captureCost
    photo = { id: `photo-${photos.length + 1}`, region: PHOTO_TARGETS[photos.length % PHOTO_TARGETS.length]!.region, location: 'satellite' }
    photos = [...photos, photo]
  }
  if (action === 'transmit') {
    energy -= RULES.transmitCost
    const stored = photos.find(item => item.location === 'satellite')!
    photo = { ...stored, location: 'ground' }
    photos = photos.map(item => item.id === stored.id ? photo! : item)
  }
  // 數量由實際照片推導；傳送依拍攝順序移動照片，不另外製造計數。
  pending = photos.filter(item => item.location === 'satellite').length
  delivered = photos.filter(item => item.location === 'ground').length
  const deliveredRegions = new Set(photos.filter(item => item.location === 'ground').map(item => item.region))

  // 先檢查成功，再檢查第八回合耗盡；所有已拍攝資料都必須傳回。
  const status: MissionStatus = PHOTO_TARGETS.every(target => deliveredRegions.has(target.region)) && pending === 0
    ? 'success'
    : state.turn === RULES.maxTurns ? 'failure' : 'active'
  const record: ActionRecord = { turn: state.turn, action, before, after: { energy, pending, delivered }, ...(photo ? { photo } : {}) }
  const next: MissionState = {
    ...record.after,
    photos,
    turn: status === 'active' ? state.turn + 1 : state.turn,
    status,
    history: [...state.history, record],
  }
  const label = ACTIONS.find((item) => item.id === action)!.label
  return { accepted: true, state: next, message: `第 ${state.turn} 回合${label}完成。電量 ${before.energy} → ${energy}，待傳 ${pending} 份，已傳回 ${delivered} 份。` }
}

/** 依本次有效操作紀錄說明可改善之處，不預設公布完整解法。 */
export function failureAdvice(state: MissionState): string[] {
  if (state.status !== 'failure') return []
  const advice: string[] = []
  const captured = state.history.filter((record) => record.action === 'capture').length
  if (captured < RULES.targetImages) {
    advice.push(`這次拍攝了 ${captured} 份影像，距離目標還差 ${RULES.targetImages - captured} 份。下次記得為拍攝保留操作次數。`)
  }
  if (state.pending > 0) {
    advice.push(`結束時還有 ${state.pending} 份資料留在衛星上，至少需要 ${state.pending} 次傳送及 ${state.pending * RULES.transmitCost} 電量。請在通聯前準備好資料與電量。`)
  }
  const missed = state.history.filter((record) => canContact(record.turn) && record.action !== 'transmit' && record.before.pending > 0 && record.before.energy >= RULES.transmitCost)
  if (missed.length > 0) {
    advice.push(`第 ${missed.map((record) => record.turn).join('、')} 回合可通聯，當時有待傳資料且電量足夠，但選擇了其他動作。下次可以優先利用這些傳送機會。`)
  }
  const lowEnergy = state.history.filter((record) => canContact(record.turn) && record.before.pending > 0 && record.before.energy < RULES.transmitCost)
  if (lowEnergy.length > 0) {
    advice.push(`第 ${lowEnergy.map((record) => `${record.turn} 回合只有 ${record.before.energy} 電量`).join('、')}，不足以傳送。試著在通聯回合到來前先充電。`)
  }
  const limitedCharge = state.history.filter((record) => record.action === 'charge' && record.after.energy - record.before.energy < RULES.chargeGain)
  if (limitedCharge.length > 0) {
    advice.push(`第 ${limitedCharge.map((record) => record.turn).join('、')} 回合充電受到上限限制，未補滿 ${RULES.chargeGain} 電量。可以調整充電時機，讓每回合更有效率。`)
  }
  return advice
}
