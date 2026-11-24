import test from 'node:test'
import assert from 'node:assert/strict'
import { effectScope } from 'vue'
import { createMission, performAction } from '../src/game/mission.ts'
import { actionFeedback } from '../src/game/missionExperience.ts'
import { useMissionSession } from '../src/composables/useMissionSession.ts'

function play(actions, initial = createMission()) {
  return actions.reduce((state, action) => {
    const next = performAction(state, action)
    assert.equal(next.accepted, true, next.message)
    return next.state
  }, initial)
}
function sessionFor(t, options) {
  const scope = effectScope()
  const session = scope.run(() => useMissionSession(options))
  t.after(() => scope.stop())
  session.startMission()
  return session
}

test('前兩張照片依序為海岸與森林，有不同ID；拍好仍不算送達', () => {
  const state = play(['capture', 'capture'])
  assert.deepEqual(state.photos, [
    { id: 'photo-1', region: 'coast', location: 'satellite' },
    { id: 'photo-2', region: 'forest', location: 'satellite' },
  ])
  assert.equal(state.status, 'active')
  assert.equal(state.delivered, 0)
})

test('有效成功路徑移動實際照片，先傳海岸再傳森林，第7回合成功', () => {
  let state = play(['capture', 'charge', 'transmit'])
  assert.deepEqual(state.photos, [{ id: 'photo-1', region: 'coast', location: 'ground' }])
  const before = structuredClone(state)
  state = play(['capture', 'charge', 'wait', 'transmit'], state)
  assert.equal(state.status, 'success')
  assert.equal(state.history.length, 7)
  assert.deepEqual(state.photos, [
    { id: 'photo-1', region: 'coast', location: 'ground' },
    { id: 'photo-2', region: 'forest', location: 'ground' },
  ])
  assert.equal(state.history.at(-1).photo.id, 'photo-2')
  assert.deepEqual(before.photos, [{ id: 'photo-1', region: 'coast', location: 'ground' }])
})

test('額外照片有獨立ID，重複區域不重複計入目標，未送完仍失敗', () => {
  const state = play(['capture', 'charge', 'capture', 'transmit', 'charge', 'capture', 'charge', 'transmit'])
  assert.deepEqual(state.photos.map(p => p.id), ['photo-1', 'photo-2', 'photo-3'])
  assert.equal(state.photos[2].region, 'coast')
  assert.equal(state.photos[2].location, 'satellite')
  assert.equal(state.status, 'failure')
  assert.match(actionFeedback(state.history[5]), /重複區域/)
  // 防止日後把兩張同區域照片誤算成任務的兩個區域。
  const oneRegion = { ...createMission(), turn: 7, pending: 1, delivered: 1, photos: [
    { id: 'a', region: 'coast', location: 'ground' },
    { id: 'b', region: 'coast', location: 'satellite' },
  ] }
  assert.equal(performAction(oneRegion, 'transmit').state.status, 'active')
})

test('無效操作與等待保留每張照片，資源數量始終符合照片清單', () => {
  const state = play(['capture'])
  const rejected = performAction(state, 'transmit')
  assert.equal(rejected.state, state)
  const waited = play(['wait'], state)
  assert.equal(waited.photos, state.photos)
  const walk = (current) => {
    assert.equal(current.pending, current.photos.filter(p => p.location === 'satellite').length)
    assert.equal(current.delivered, current.photos.filter(p => p.location === 'ground').length)
    assert.equal(new Set(current.photos.map(p => p.id)).size, current.photos.length)
    assert.ok(current.energy >= 0 && current.energy <= 100)
    assert.ok(current.pending <= 2)
    if (current.status !== 'active') return
    for (const action of ['capture', 'charge', 'transmit', 'wait']) {
      const next = performAction(current, action)
      if (next.accepted) walk(next.state)
    }
  }
  walk(createMission())
})

test('動畫期間拒絕連點且不改回饋或回合，結束後立即允許下一次操作', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const session = sessionFor(t, { animationDuration: 650, reducedMotion: () => false })
  assert.equal(session.act('capture'), true)
  const original = session.game.value
  const feedback = session.feedback.value
  assert.equal(session.visualAction.value, 'capture')
  for (const action of ['capture', 'charge', 'transmit', 'wait']) assert.equal(session.act(action), false)
  assert.equal(session.game.value, original)
  assert.equal(session.feedback.value, feedback)
  t.mock.timers.tick(649)
  assert.equal(session.act('charge'), false)
  t.mock.timers.tick(1)
  assert.equal(session.visualAction.value, null)
  assert.equal(session.act('charge'), true)
  assert.equal(session.game.value.history.length, 2)
})

test('減少動畫時不等待計時器，狀態、照片與最後回合成功仍正確', t => {
  const session = sessionFor(t, { animationDuration: 650, reducedMotion: () => true })
  for (const action of ['charge', 'capture', 'charge', 'capture', 'charge', 'wait', 'transmit', 'transmit']) {
    assert.equal(session.act(action), true)
    assert.equal(session.visualAction.value, null)
  }
  assert.equal(session.game.value.status, 'success')
  assert.equal(session.game.value.turn, 8)
  assert.ok(session.game.value.photos.every(p => p.location === 'ground'))
})

test('動畫中重新開始會清空照片、動畫、紀錄、回饋與教學，舊計時器不影響新局', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const session = sessionFor(t, { animationDuration: 650 })
  session.act('capture')
  session.restart()
  t.mock.timers.tick(1000)
  assert.deepEqual(session.game.value, createMission())
  assert.equal(session.visualAction.value, null)
  assert.equal(session.animationKey.value, 0)
  assert.equal(session.tutorialOpen.value, true)
  assert.equal(session.tutorialStep.value, 0)
  assert.equal(session.started.value, false)
  assert.equal(session.feedback.value, '準備好了，選一個動作開始吧！')
})

test('失敗只提供一個具體建議，電力足夠卻錯過通聯時指出實際回合', async () => {
  const { resultAdvice } = await import('../src/game/missionExperience.ts')
  const missed = play(['charge', 'charge', 'capture', 'charge', 'wait', 'wait', 'capture', 'charge'])
  assert.match(resultAdvice(missed), /第 4、7、8 回合可通聯/)
  assert.doesNotMatch(resultAdvice(missed), /不足以傳送/)
  assert.equal(resultAdvice(createMission()), '')
})

test('額外拍攝的獨立照片全送完，第8回合仍可成功，兩種區域不被重複計算', () => {
  const state = play(['capture', 'charge', 'transmit', 'capture', 'charge', 'capture', 'transmit', 'transmit'])
  assert.equal(state.status, 'success')
  assert.equal(state.turn, 8)
  assert.equal(state.delivered, 3)
  assert.equal(state.pending, 0)
  assert.equal(new Set(state.photos.map(photo => photo.region)).size, 2)
  assert.deepEqual(state.photos.map(photo => photo.id), ['photo-1', 'photo-2', 'photo-3'])
  assert.ok(state.photos.every(photo => photo.location === 'ground'))
})
