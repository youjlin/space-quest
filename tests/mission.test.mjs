import test from 'node:test'
import assert from 'node:assert/strict'
import { RULES, createMission, canContact, remainingActions, actionBlockers, performAction, failureAdvice } from '../src/game/mission.ts'

function play(actions, initial = createMission()) {
  return actions.reduce((state, action) => {
    const result = performAction(state, action)
    assert.equal(result.accepted, true, result.message)
    return result.state
  }, initial)
}

function assertRejected(state, action, reason) {
  const before = structuredClone(state)
  const result = performAction(state, action)
  assert.equal(result.accepted, false)
  assert.match(result.message, reason)
  assert.equal(result.state, state, '無效操作應保留整個狀態物件')
  assert.deepEqual(state, before, '不應修改傳入的狀態、紀錄或資源')
}

test('初始參數、回合與通聯機會符合規則', () => {
  assert.deepEqual(createMission(), { energy: 50, pending: 0, delivered: 0, photos: [], turn: 1, status: 'active', history: [] })
  assert.equal(remainingActions(createMission()), 8)
  assert.deepEqual(Array.from({ length: 8 }, (_, i) => canContact(i + 1)), [false, false, true, true, false, false, true, true])
})

test('初始 50 電量無法連續拍攝、拍攝、傳送、傳送：不足時不消耗回合', () => {
  const state = play(['capture', 'capture'])
  assert.equal(state.energy, 10)
  assert.equal(state.turn, 3)
  assertRejected(state, 'transmit', /傳送需要 15 電量，目前只有 10/)
  assertRejected(state, 'transmit', /傳送需要 15 電量，目前只有 10/)
})

test('僅以 70 電量測試夾具驗證四步成功；正式初始設定仍為 50', () => {
  const state = play(['capture', 'capture', 'transmit', 'transmit'], { ...createMission(), energy: 70 })
  assert.equal(state.turn, 4)
  assert.equal(state.status, 'success')
  assert.equal(state.delivered, 2)
  assert.equal(state.energy, 0)
  assert.equal(RULES.initialEnergy, 50)
})

test('包含充電的有效路徑可在第 7 回合完成', () => {
  const state = play(['capture', 'charge', 'transmit', 'capture', 'charge', 'charge', 'transmit'])
  assert.equal(state.status, 'success')
  assert.equal(state.turn, 7)
  assert.equal(state.pending, 0)
  assert.equal(state.delivered, 2)
  assert.equal(state.energy, 70)
  assert.equal(remainingActions(state), 0)
})

test('非通聯回合即使有資料和電量也不能傳送', () => {
  const state = play(['capture'])
  assert.equal(state.turn, 2)
  assertRejected(state, 'transmit', /第 2 回合不可通聯/)
  assert.equal(remainingActions(state), 7)
})

test('電量不足時不能拍攝或傳送；可以充電恢復', () => {
  const state = play(['capture', 'capture'])
  assertRejected(state, 'capture', /拍攝需要 20 電量，目前只有 10/)
  assertRejected(state, 'transmit', /傳送需要 15 電量，目前只有 10/)
  const charged = play(['charge'], state)
  assert.equal(charged.energy, 40)
  assert.equal(charged.turn, 4)
})

test('儲存空間已滿，即使電量足夠也不能拍攝', () => {
  const state = play(['charge', 'capture', 'capture'])
  assert.equal(state.pending, 2)
  assert.equal(state.energy, 40)
  assertRejected(state, 'capture', /儲存空間已滿/)
})

test('通聯回合沒有待傳資料也不能傳送', () => {
  const state = play(['charge', 'charge'])
  assert.equal(state.turn, 3)
  assertRejected(state, 'transmit', /沒有待傳資料/)
})

test('充電最多到 100，已滿時拒絕充電且說明原因', () => {
  const state = play(['charge', 'charge'])
  assert.equal(state.energy, 100)
  assert.equal(state.history[1].after.energy - state.history[1].before.energy, 20)
  assertRejected(state, 'charge', /電量已滿/)
  assert.match(actionBlockers(state, 'charge').join(' '), /不需要充電/)
})

test('第 8 回合達標先判成功，剩餘操作為 0，保留結束回合 8', () => {
  const state = play(['capture', 'charge', 'transmit', 'capture', 'charge', 'charge', 'charge', 'transmit'])
  assert.equal(state.status, 'success')
  assert.equal(state.turn, 8)
  assert.equal(state.delivered, 2)
  assert.equal(state.pending, 0)
  assert.equal(state.history.length, 8)
  assert.equal(remainingActions(state), 0)
})

test('第 8 回合未達標則失敗，並依本次紀錄提供具體建議', () => {
  const state = play(['capture', 'charge', 'capture', 'transmit', 'charge', 'capture', 'charge', 'transmit'])
  assert.equal(state.turn, 8)
  assert.equal(state.status, 'failure')
  assert.equal(state.delivered, 2)
  assert.equal(state.pending, 1, '仍有未傳回的額外影像時不得宣告全部傳回')
  assert.equal(remainingActions(state), 0)
  const advice = failureAdvice(state).join(' ')
  assert.match(advice, /還有 1 份資料/)
  assert.match(advice, /第 3、7 回合可通聯/)
})

test('成功或失敗後，四種操作都不能改變狀態', () => {
  const success = play(['capture', 'charge', 'transmit', 'capture', 'charge', 'charge', 'transmit'])
  const failure = play(['capture', 'charge', 'capture', 'transmit', 'charge', 'capture', 'charge', 'transmit'])
  for (const state of [success, failure]) {
    for (const action of ['charge', 'capture', 'transmit', 'wait']) assertRejected(state, action, /任務已結束/)
  }
})

test('電量與儲存皆滿又不可通聯時，可以等待推進回合，並於第 8 回合完成', () => {
  const state = play(['charge', 'capture', 'charge', 'capture', 'charge'])
  assert.equal(state.turn, 6)
  assert.equal(state.energy, 100)
  assert.equal(state.pending, 2)
  assert.equal(state.status, 'active')
  for (const action of ['charge', 'capture', 'transmit']) assert.ok(actionBlockers(state, action).length > 0)
  const waited = play(['wait'], state)
  assert.equal(waited.turn, 7)
  assert.equal(waited.energy, 100)
  assert.equal(waited.pending, 2)
  assert.equal(waited.delivered, 0)
  assert.equal(waited.history.length, 6)
  assert.equal(waited.history.at(-1).action, 'wait')
  const final = play(['transmit', 'transmit'], waited)
  assert.equal(final.status, 'success')
  assert.equal(final.turn, 8)
  assert.equal(final.delivered, 2)
  assert.equal(final.pending, 0)
})

test('等待只消耗回合且留下資源不變的紀錄；等待到第 8 回合未達標則失敗', () => {
  const state = play(Array(8).fill('wait'))
  assert.equal(state.status, 'failure')
  assert.equal(state.turn, 8)
  assert.equal(state.history.length, 8)
  assert.equal(state.energy, 50)
  assert.equal(state.pending, 0)
  assert.equal(state.delivered, 0)
  assert.equal(remainingActions(state), 0)
  for (const record of state.history) assert.deepEqual(record.before, record.after)
  assert.match(failureAdvice(state).join(' '), /拍攝了 0 份影像/)
})

test('重新開始回復所有初始資源、狀態與空紀錄，且各局紀錄互不共用', () => {
  const previous = play(['capture', 'charge', 'transmit', 'capture', 'charge', 'charge', 'transmit'])
  const reset = createMission()
  assert.deepEqual(reset, { energy: 50, pending: 0, delivered: 0, photos: [], turn: 1, status: 'active', history: [] })
  assert.notEqual(reset.history, previous.history)
  assert.notEqual(reset.history, createMission().history)
  assert.equal(previous.history.length, 7)
})

test('有效操作不修改舊狀態，紀錄包含操作當回合與資源前後值', () => {
  const initial = createMission()
  const before = structuredClone(initial)
  const result = performAction(initial, 'capture')
  assert.deepEqual(initial, before)
  assert.notEqual(result.state, initial)
  assert.deepEqual(result.state.history, [{ turn: 1, action: 'capture', before: { energy: 50, pending: 0, delivered: 0 }, after: { energy: 30, pending: 1, delivered: 0 }, photo: { id: 'photo-1', region: 'coast', location: 'satellite' } }])
  assert.equal(result.state.turn, 2)
})

test('遍歷所有可達狀態：電量、容量、回合、影像守恆與結束後不可操作', () => {
  const visited = new Set()
  const walk = (state) => {
    const key = [state.energy, state.pending, state.delivered, state.turn, state.status].join(',')
    if (visited.has(key)) return
    visited.add(key)
    assert.ok(state.energy >= 0 && state.energy <= 100)
    assert.ok(state.pending >= 0 && state.pending <= 2)
    assert.ok(state.turn >= 1 && state.turn <= 8)
    const captured = state.history.filter((record) => record.action === 'capture').length
    assert.equal(captured, state.pending + state.delivered)
    for (const action of ['charge', 'capture', 'transmit', 'wait']) {
      const result = performAction(state, action)
      if (!result.accepted) assert.equal(result.state, state)
      else {
        assert.equal(result.state.history.length, state.history.length + 1)
        assert.equal(state.status, 'active')
        walk(result.state)
      }
    }
  }
  walk(createMission())
  assert.ok(visited.size > 50)
})

