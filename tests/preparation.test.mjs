import test from 'node:test'
import assert from 'node:assert/strict'
import { PREPARATION_STEPS } from '../src/data/satellitePreparation.ts'
import { allPreparationCorrect, answerPreparation, createPreparation, nextPreparationStep, preparedFunctions } from '../src/game/satellitePreparation.ts'
import { PROGRESS_KEY, readLearningProgress, readFirstMissionCompleted, readSecondMissionCompleted, saveFirstMissionCompleted, saveSecondMissionCompleted } from '../src/game/learningProgress.ts'
import { createLearningProgressStore } from '../src/composables/useLearningProgress.ts'
import { usePreparationSession } from '../src/composables/usePreparationSession.ts'
import { createMission, performAction } from '../src/game/mission.ts'

function fakeStorage(initial = null) {
  const data = new Map(initial === null ? [] : [[PROGRESS_KEY, initial]])
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), data }
}
function finish(session, retry = false) {
  for (const step of PREPARATION_STEPS) {
    assert.equal(session.step.value.id, step.id)
    if (retry) for (const option of step.options.filter(option => option.id !== step.correctAnswer)) session.answer(step.id, option.id)
    session.answer(step.id, step.correctAnswer)
    session.nextStep(step.id)
  }
}

test('五步順序正確，每步三個有效選項及兩個具體提示，正解分布三種位置', () => {
  assert.deepEqual(PREPARATION_STEPS.map(step => step.id), ['camera', 'power', 'storage', 'communication', 'attitude'])
  const positions = new Set()
  for (const step of PREPARATION_STEPS) {
    assert.equal(step.options.length, 3)
    assert.equal(new Set(step.options.map(option => option.id)).size, 3)
    assert.equal(step.options.filter(option => option.id === step.correctAnswer).length, 1)
    positions.add(step.options.findIndex(option => option.id === step.correctAnswer))
    for (const option of step.options) if (option.id !== step.correctAnswer) assert.ok(option.hint?.length > 0)
    assert.ok(step.explanation.length > 0)
  }
  assert.deepEqual([...positions].sort(), [0, 1, 2])
})

test('每一步兩個錯誤選項都能重試，不加入功能、不跳步，也不變更選項順序', () => {
  let state = createPreparation()
  const dataBefore = structuredClone(PREPARATION_STEPS)
  for (let index = 0; index < PREPARATION_STEPS.length; index++) {
    const step = PREPARATION_STEPS[index]
    for (const option of step.options.filter(option => option.id !== step.correctAnswer)) {
      const before = structuredClone(state)
      const next = answerPreparation(state, step.id, option.id)
      assert.deepEqual(state, before)
      state = next
      assert.equal(state.stepIndex, index)
      assert.equal(state.feedback.kind, 'hint')
      assert.equal(state.feedback.text, option.hint)
      assert.equal(state.answers[index], null)
      assert.equal(preparedFunctions(state).length, index)
      assert.equal(allPreparationCorrect(state), false)
      assert.equal(nextPreparationStep(state, step.id), state)
    }
    state = answerPreparation(state, step.id, step.correctAnswer)
    assert.equal(state.stepIndex, index, '答對後仍保留問題與解說')
    assert.equal(state.phase, 'step')
    assert.equal(state.feedback.text, step.explanation)
    assert.deepEqual(preparedFunctions(state), PREPARATION_STEPS.slice(0, index + 1).map(item => item.id))
    state = nextPreparationStep(state, step.id)
  }
  assert.equal(state.phase, 'complete')
  assert.equal(allPreparationCorrect(state), true)
  assert.deepEqual(PREPARATION_STEPS, dataBefore)
})

test('連點正解不重複加入功能，連點下一步與舊事件不會跳過新問題', () => {
  const first = PREPARATION_STEPS[0]
  const state = answerPreparation(createPreparation(), first.id, first.correctAnswer)
  for (let i = 0; i < 20; i++) assert.equal(answerPreparation(state, first.id, first.correctAnswer), state)
  assert.deepEqual(preparedFunctions(state), ['camera'])
  const next = nextPreparationStep(state, first.id)
  for (let i = 0; i < 20; i++) {
    assert.equal(nextPreparationStep(next, first.id), next)
    assert.equal(nextPreparationStep(next, PREPARATION_STEPS[1].id), next)
    assert.equal(answerPreparation(next, first.id, first.correctAnswer), next)
  }
  assert.equal(next.stepIndex, 1)
  assert.deepEqual(preparedFunctions(next), ['camera'])
})

test('未作答、未知選項與不屬於當前步驟的選項都不能繼續或完成', () => {
  const state = createPreparation()
  assert.equal(nextPreparationStep(state, 'camera'), state)
  assert.equal(answerPreparation(state, 'camera', 'unknown'), state)
  assert.equal(answerPreparation(state, 'camera', 'attitude'), state)
  assert.equal(allPreparationCorrect(state), false)
  assert.deepEqual(preparedFunctions(state), [])
})

test('只在五步全答對後保存一次，最後一步先顯示解說而不自動跳完成畫面', () => {
  let writes = 0
  const session = usePreparationSession(() => { writes++; return true })
  for (const step of PREPARATION_STEPS.slice(0, -1)) {
    session.answer(step.id, step.correctAnswer)
    session.nextStep(step.id)
  }
  const last = PREPARATION_STEPS.at(-1)
  session.answer(last.id, 'power')
  assert.equal(writes, 0)
  assert.equal(session.nextStep(last.id), false)
  session.answer(last.id, last.correctAnswer)
  assert.equal(writes, 1)
  assert.equal(session.state.value.phase, 'step')
  assert.equal(session.prepared.value.length, 5)
  for (let i = 0; i < 20; i++) session.answer(last.id, last.correctAnswer)
  assert.equal(writes, 1)
  assert.equal(session.nextStep(last.id), true)
  assert.equal(session.state.value.phase, 'complete')
  assert.equal(session.nextStep(last.id), false)
})

test('讀取既有第一關紀錄，完成第二關後兩個旗標都能在重新載入後保留', () => {
  const storage = fakeStorage(JSON.stringify({ version: 1, firstMissionCompleted: true }))
  const store = createLearningProgressStore(() => storage)
  assert.equal(store.firstMissionCompleted.value, true)
  assert.equal(store.secondMissionCompleted.value, false)
  const session = usePreparationSession(store.markSecondMissionCompleted)
  finish(session)
  assert.equal(store.firstMissionCompleted.value, true)
  assert.equal(store.secondMissionCompleted.value, true)
  assert.equal(session.saveSucceeded.value, true)
  assert.deepEqual(JSON.parse(storage.getItem(PROGRESS_KEY)), { version: 1, firstMissionCompleted: true, secondMissionCompleted: true })
  const reloaded = createLearningProgressStore(() => storage)
  assert.equal(reloaded.firstMissionCompleted.value, true)
  assert.equal(reloaded.secondMissionCompleted.value, true)
  assert.equal(storage.data.size, 1, '仍只保存一份旗標資料，不新增個資或作答紀錄')
})

test('可以直接完成第二關，之後完成或重玩第一關不會覆寫第二關旗標', () => {
  const storage = fakeStorage()
  assert.equal(saveSecondMissionCompleted(() => storage), true)
  assert.equal(readFirstMissionCompleted(() => storage), false)
  assert.equal(readSecondMissionCompleted(() => storage), true)
  assert.equal(saveFirstMissionCompleted(() => storage), true)
  assert.equal(saveFirstMissionCompleted(() => storage), true)
  assert.deepEqual(readLearningProgress(() => storage), { firstMissionCompleted: true, secondMissionCompleted: true })
})

test('較早建立的進度實例寫入時，會合併儲存中的另一關完成紀錄', () => {
  const storage = fakeStorage()
  const firstTab = createLearningProgressStore(() => storage)
  const secondTab = createLearningProgressStore(() => storage)
  firstTab.markFirstMissionCompleted()
  secondTab.markSecondMissionCompleted()
  assert.deepEqual(readLearningProgress(() => storage), { firstMissionCompleted: true, secondMissionCompleted: true })
})

test('再看一次重設本次選擇、圖解與回饋，但不清除曾完成的兩關紀錄', () => {
  const storage = fakeStorage(JSON.stringify({ version: 1, firstMissionCompleted: true }))
  const store = createLearningProgressStore(() => storage)
  const session = usePreparationSession(store.markSecondMissionCompleted)
  finish(session)
  const saved = storage.getItem(PROGRESS_KEY)
  session.restart()
  assert.deepEqual(session.state.value, createPreparation())
  assert.deepEqual(session.prepared.value, [])
  assert.equal(session.saveSucceeded.value, null)
  assert.equal(store.firstMissionCompleted.value, true)
  assert.equal(store.secondMissionCompleted.value, true)
  assert.equal(storage.getItem(PROGRESS_KEY), saved)
})

test('localStorage 不存在、被拒或寫入失敗，仍能完成第二關及重玩', () => {
  const accessors = [
    () => null,
    () => { throw new Error('SecurityError') },
    () => ({ getItem() { throw new Error('read denied') }, setItem() { throw new Error('write denied') } }),
    () => ({ getItem() { return null }, setItem() { throw new Error('QuotaExceededError') } }),
  ]
  for (const getStorage of accessors) {
    const store = createLearningProgressStore(getStorage)
    const session = usePreparationSession(store.markSecondMissionCompleted)
    finish(session, true)
    assert.equal(session.state.value.phase, 'complete')
    assert.equal(store.secondMissionCompleted.value, true)
    assert.equal(session.saveSucceeded.value, false)
    session.restart()
    assert.deepEqual(session.state.value, createPreparation())
    assert.equal(store.secondMissionCompleted.value, true)
  }
})

test('第二關旗標也驗證版本與型別，損毀資料不會造成誤判或阻擋完成', () => {
  for (const saved of ['null', 'broken', '{"version":2,"secondMissionCompleted":true}', '{"version":1,"secondMissionCompleted":"true"}']) {
    const storage = fakeStorage(saved)
    assert.equal(readSecondMissionCompleted(() => storage), false)
    assert.equal(saveSecondMissionCompleted(() => storage), true)
    assert.equal(readSecondMissionCompleted(() => storage), true)
  }
})

test('第二關多次答錯不改變第三關初始狀態、參數或成功路徑', () => {
  const initial = createMission()
  const session = usePreparationSession(() => true)
  finish(session, true)
  assert.deepEqual(createMission(), initial)
  let mission = createMission()
  for (const action of ['capture', 'charge', 'transmit', 'capture', 'charge', 'charge', 'transmit']) {
    const result = performAction(mission, action)
    assert.equal(result.accepted, true)
    mission = result.state
  }
  assert.equal(mission.status, 'success')
  assert.equal(mission.turn, 7)
})
