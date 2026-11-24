import test from 'node:test'
import assert from 'node:assert/strict'
import { effectScope } from 'vue'
import { createMission, performAction } from '../src/game/mission.ts'
import { LESSONS, actionsUntilContact, contactMessage, shortBlocker, actionFeedback, resultSummary } from '../src/game/missionExperience.ts'
import { useMissionSession } from '../src/composables/useMissionSession.ts'

function sessionFor(t) {
  const scope = effectScope()
  const session = scope.run(useMissionSession)
  t.after(() => scope.stop())
  return session
}

test('教學上一步、下一步及略過都不消耗行動，開始前也不能操作遊戲', t => {
  const session = sessionFor(t)
  const original = session.game.value
  assert.equal(session.tutorialOpen.value, true)
  assert.equal(session.started.value, false)
  session.previousLesson()
  assert.equal(session.tutorialStep.value, 0)
  session.nextLesson()
  session.nextLesson()
  session.nextLesson()
  assert.equal(session.tutorialStep.value, LESSONS.length - 1)
  session.previousLesson()
  assert.equal(session.tutorialStep.value, 1)
  assert.equal(session.act('capture'), false)
  session.skipLessons()
  assert.equal(session.tutorialStep.value, LESSONS.length)
  assert.equal(session.tutorialOpen.value, true, '略過後仍要按開始任務')
  assert.equal(session.started.value, false)
  assert.equal(session.game.value, original)
  session.startMission()
  assert.equal(session.tutorialOpen.value, false)
  assert.equal(session.started.value, true)
  assert.deepEqual(session.game.value, createMission())
})

test('遊戲中重開教學、略過並返回，保留目前電量、照片、回合與紀錄', t => {
  const session = sessionFor(t)
  session.startMission()
  session.act('capture')
  const original = session.game.value
  session.openTutorial()
  assert.equal(session.tutorialOpen.value, true)
  assert.equal(session.tutorialStep.value, 0)
  assert.equal(session.started.value, true)
  assert.equal(session.visualAction.value, null)
  assert.equal(session.act('charge'), false)
  session.nextLesson()
  session.skipLessons()
  session.startMission()
  assert.equal(session.game.value, original)
  assert.equal(session.game.value.turn, 2)
  assert.equal(session.game.value.energy, 30)
  assert.equal(session.game.value.pending, 1)
  assert.equal(session.game.value.history.length, 1)
})

test('重新開始同時重設遊戲、回饋、動畫與教學流程', t => {
  const session = sessionFor(t)
  session.startMission()
  session.act('capture')
  session.act('transmit')
  assert.equal(session.rejected.value, true)
  assert.equal(session.game.value.history.length, 1)
  session.openTutorial()
  session.skipLessons()
  session.restart()
  assert.deepEqual(session.game.value, createMission())
  assert.equal(session.tutorialOpen.value, true)
  assert.equal(session.tutorialStep.value, 0)
  assert.equal(session.started.value, false)
  assert.equal(session.rejected.value, false)
  assert.equal(session.visualAction.value, null)
  assert.equal(session.animationKey.value, 0)
  assert.equal(session.feedback.value, '準備好了，選一個動作開始吧！')
})

test('接收倒數使用實際回合，沒有下一次機會時回傳 null', () => {
  assert.deepEqual(Array.from({ length: 10 }, (_, index) => actionsUntilContact(index + 1)), [2, 1, 0, 0, 2, 1, 0, 0, null, null])
  assert.equal(contactMessage(createMission()), '地面站暫時收不到，還有 2 次行動後可以傳送')
  assert.equal(contactMessage({ ...createMission(), turn: 3 }), '現在可以傳照片')
  assert.equal(contactMessage({ ...createMission(), turn: 9 }), '地面站暫時收不到，已沒有下一次接收機會。')
  assert.equal(contactMessage({ ...createMission(), turn: 8, status: 'failure' }), '任務已結束。')
})

test('不可用原因使用簡短白話，並涵蓋電池、照片與地面接收限制', () => {
  const state = createMission()
  assert.equal(shortBlocker(state, 'charge'), '')
  assert.equal(shortBlocker({ ...state, energy: 100 }, 'charge'), '電池已充滿')
  assert.equal(shortBlocker({ ...state, energy: 10 }, 'capture'), '電力不足')
  assert.equal(shortBlocker({ ...state, pending: 2 }, 'capture'), '照片已存滿')
  assert.equal(shortBlocker({ ...state, turn: 3 }, 'transmit'), '還沒有照片')
  assert.equal(shortBlocker({ ...state, pending: 1 }, 'transmit'), '地面站暫時收不到')
  assert.equal(shortBlocker({ ...state, pending: 1, turn: 3, energy: 10 }, 'transmit'), '電力不足')
})

test('畫面操作層保留原成功路徑，無效操作不扣回合或寫入紀錄', t => {
  const session = sessionFor(t)
  session.startMission()
  session.act('capture')
  const before = session.game.value
  assert.equal(session.act('transmit'), false)
  assert.equal(session.game.value, before)
  assert.equal(session.game.value.turn, 2)
  assert.match(session.feedback.value, /這次沒有使用行動機會/)
  for (const action of ['charge', 'transmit', 'capture', 'charge', 'charge', 'transmit']) assert.equal(session.act(action), true)
  assert.equal(session.game.value.status, 'success')
  assert.equal(session.game.value.turn, 7)
  assert.equal(session.game.value.delivered, 2)
  assert.equal(session.feedback.value, '照片全部送達，任務完成！')
  assert.match(resultSummary(session.game.value), /用了 7 次行動/)
})

test('操作層等待可推進到接收回合，最後一次行動仍能成功', t => {
  const session = sessionFor(t)
  session.startMission()
  for (const action of ['charge', 'capture', 'charge', 'capture', 'charge', 'wait', 'transmit', 'transmit']) assert.equal(session.act(action), true)
  assert.equal(session.game.value.status, 'success')
  assert.equal(session.game.value.turn, 8)
  assert.equal(session.game.value.history[5].action, 'wait')
  session.restart()
  assert.equal(session.tutorialOpen.value, true)
  assert.equal(session.tutorialStep.value, 0)
  assert.deepEqual(session.game.value, createMission())
})

test('充電回饋採實際增加的電量，不會把受上限限制的充電說成 +30', () => {
  const charged = performAction(performAction(createMission(), 'charge').state, 'charge').state
  assert.equal(actionFeedback(charged.history.at(-1)), '電力補好了！這次增加 20 電量。')
})

test('失敗結果簡短說明尚未送達的照片，任務結束不再宣告下次接收機會', t => {
  const session = sessionFor(t)
  session.startMission()
  for (const action of ['capture', 'charge', 'capture', 'transmit', 'charge', 'capture', 'charge', 'transmit']) session.act(action)
  assert.equal(session.game.value.status, 'failure')
  assert.match(resultSummary(session.game.value), /還有 1 張照片沒送回來/)
  assert.equal(contactMessage(session.game.value), '任務已結束。')
})
