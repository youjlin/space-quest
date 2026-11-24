import test from 'node:test'
import assert from 'node:assert/strict'
import { USES_OPTIONS, USES_QUESTIONS } from '../src/data/satelliteUses.ts'
import { allUsesQuestionsCorrect, answerUsesQuestion, createUsesQuiz, nextUsesQuestion } from '../src/game/usesQuiz.ts'
import { PROGRESS_KEY, readFirstMissionCompleted, saveFirstMissionCompleted } from '../src/game/learningProgress.ts'
import { createLearningProgressStore } from '../src/composables/useLearningProgress.ts'
import { useUsesQuizSession } from '../src/composables/useUsesQuizSession.ts'

function fakeStorage(initial = null) {
  const data = new Map(initial === null ? [] : [[PROGRESS_KEY, initial]])
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), data }
}

function finish(session) {
  for (const question of USES_QUESTIONS) {
    assert.equal(session.question.value.id, question.id)
    session.answer(question.id, question.correctAnswer)
    session.nextQuestion(question.id)
  }
}

test('六題依指定情境排序，每種用途各兩題，且每個錯誤選項都有具體提示', () => {
  assert.deepEqual(USES_QUESTIONS.map(q => q.id), ['storm', 'village', 'phone', 'forest', 'ship', 'hiker'])
  for (const option of USES_OPTIONS) assert.equal(USES_QUESTIONS.filter(q => q.correctAnswer === option.id).length, 2)
  for (const question of USES_QUESTIONS) {
    assert.ok(question.situation.length > 0)
    assert.ok(question.illustrationDescription.length > 0)
    assert.ok(question.explanation.length > 0)
    for (const option of USES_OPTIONS) if (option.id !== question.correctAnswer) assert.ok(question.hints[option.id]?.length > 0)
  }
})

test('每一題的兩個錯誤選項均可重試，只有答對才記錄答案，且不自動跳題', () => {
  let state = createUsesQuiz()
  const optionsBefore = structuredClone(USES_OPTIONS)
  for (let index = 0; index < USES_QUESTIONS.length; index++) {
    const question = USES_QUESTIONS[index]
    for (const wrong of USES_OPTIONS.filter(option => option.id !== question.correctAnswer)) {
      const before = structuredClone(state)
      const next = answerUsesQuestion(state, question.id, wrong.id)
      assert.deepEqual(state, before, '不能修改原狀態')
      state = next
      assert.equal(state.questionIndex, index)
      assert.equal(state.phase, 'question')
      assert.equal(state.answers[index], null)
      assert.equal(state.feedback.kind, 'hint')
      assert.equal(state.feedback.text, question.hints[wrong.id])
      assert.equal(nextUsesQuestion(state, question.id), state)
      assert.equal(allUsesQuestionsCorrect(state), false)
    }
    state = answerUsesQuestion(state, question.id, question.correctAnswer)
    assert.equal(state.questionIndex, index, '答對後保留原題供閱讀解說')
    assert.equal(state.phase, 'question')
    assert.equal(state.feedback.kind, 'correct')
    assert.equal(state.feedback.text, question.explanation)
    assert.equal(state.answers[index], question.correctAnswer)
    state = nextUsesQuestion(state, question.id)
  }
  assert.equal(state.phase, 'complete')
  assert.equal(allUsesQuestionsCorrect(state), true)
  assert.deepEqual(USES_OPTIONS, optionsBefore, '重試及換題不打亂選項')
})

test('重複點擊正確答案與下一題，不會跳過題目或用舊事件作答', () => {
  const first = USES_QUESTIONS[0]
  const answered = answerUsesQuestion(createUsesQuiz(), first.id, first.correctAnswer)
  for (let i = 0; i < 20; i++) assert.equal(answerUsesQuestion(answered, first.id, first.correctAnswer), answered)
  const next = nextUsesQuestion(answered, first.id)
  assert.equal(next.questionIndex, 1)
  for (let i = 0; i < 20; i++) {
    assert.equal(nextUsesQuestion(next, first.id), next)
    assert.equal(nextUsesQuestion(next, USES_QUESTIONS[1].id), next)
    assert.equal(answerUsesQuestion(next, first.id, first.correctAnswer), next)
  }
  assert.deepEqual(next.answers, [first.correctAnswer, null, null, null, null, null])
})

test('錯誤答案、未作答與未知選項都不會標記完成', () => {
  const state = createUsesQuiz()
  assert.equal(allUsesQuestionsCorrect(state), false)
  assert.equal(nextUsesQuestion(state, USES_QUESTIONS[0].id), state)
  assert.equal(answerUsesQuestion(state, USES_QUESTIONS[0].id, 'unknown'), state)
  const partial = { ...state, answers: ['observe', 'communicate', 'locate', 'observe', 'communicate', 'observe'] }
  assert.equal(allUsesQuestionsCorrect(partial), false)
})

test('第六題答錯不存完成，六題答對才存，重複點擊只寫一次', () => {
  let writes = 0
  const session = useUsesQuizSession(() => { writes++; return true })
  for (const question of USES_QUESTIONS.slice(0, -1)) {
    session.answer(question.id, question.correctAnswer)
    session.nextQuestion(question.id)
  }
  assert.equal(writes, 0)
  const last = USES_QUESTIONS.at(-1)
  session.answer(last.id, 'communicate')
  assert.equal(writes, 0)
  assert.equal(session.saveSucceeded.value, null)
  assert.equal(session.nextQuestion(last.id), false)
  session.answer(last.id, last.correctAnswer)
  assert.equal(writes, 1)
  assert.equal(session.state.value.phase, 'question', '最後一題仍先閱讀解說，不自動跳頁')
  for (let i = 0; i < 20; i++) session.answer(last.id, last.correctAnswer)
  assert.equal(writes, 1)
  assert.equal(session.nextQuestion(last.id), true)
  assert.equal(session.state.value.phase, 'complete')
  assert.equal(session.nextQuestion(last.id), false)
})

test('完成旗標正確寫入，新的進度實例可在重新載入後讀取，且不保存答案或個資', () => {
  const storage = fakeStorage()
  const store = createLearningProgressStore(() => storage)
  const session = useUsesQuizSession(store.markFirstMissionCompleted)
  finish(session)
  assert.equal(store.firstMissionCompleted.value, true)
  assert.equal(session.saveSucceeded.value, true)
  assert.deepEqual(JSON.parse(storage.getItem(PROGRESS_KEY)), { version: 1, firstMissionCompleted: true })
  assert.equal(storage.data.size, 1)
  const reloaded = createLearningProgressStore(() => storage)
  assert.equal(reloaded.firstMissionCompleted.value, true)
})

test('重玩會清空本次狀態，保留曾完成的紀錄與儲存旗標', () => {
  const storage = fakeStorage()
  const store = createLearningProgressStore(() => storage)
  const session = useUsesQuizSession(store.markFirstMissionCompleted)
  finish(session)
  const saved = storage.getItem(PROGRESS_KEY)
  session.restart()
  assert.deepEqual(session.state.value, createUsesQuiz())
  assert.equal(session.question.value.id, USES_QUESTIONS[0].id)
  assert.equal(session.saveSucceeded.value, null)
  assert.equal(store.firstMissionCompleted.value, true)
  assert.equal(storage.getItem(PROGRESS_KEY), saved)
  session.answer(USES_QUESTIONS[0].id, 'communicate')
  assert.equal(session.state.value.feedback.kind, 'hint')
  assert.equal(store.firstMissionCompleted.value, true)
})

test('儲存不存在、取得儲存失敗、讀取失敗、寫入失敗時，六題依然能完成及重玩', () => {
  const brokenAccessors = [
    () => null,
    () => { throw new Error('SecurityError') },
    () => ({ getItem() { throw new Error('read denied') }, setItem() { throw new Error('write denied') } }),
    () => ({ getItem() { return null }, setItem() { throw new Error('QuotaExceededError') } }),
  ]
  for (const getStorage of brokenAccessors) {
    const store = createLearningProgressStore(getStorage)
    assert.equal(store.firstMissionCompleted.value, false)
    const session = useUsesQuizSession(store.markFirstMissionCompleted)
    finish(session)
    assert.equal(session.state.value.phase, 'complete')
    assert.equal(store.firstMissionCompleted.value, true, '本次分頁仍保有完成狀態')
    assert.equal(session.saveSucceeded.value, false)
    session.restart()
    assert.deepEqual(session.state.value, createUsesQuiz())
    assert.equal(store.firstMissionCompleted.value, true)
  }
})

test('損毀、舊版或型別錯誤的儲存資料不會誤判已完成', () => {
  for (const saved of ['{broken', 'null', 'true', '[]', '{}', '{"version":1}', '{"version":2,"firstMissionCompleted":true}', '{"version":1,"firstMissionCompleted":"true"}', '{"version":1,"firstMissionCompleted":false}']) {
    assert.equal(readFirstMissionCompleted(() => fakeStorage(saved)), false, saved)
  }
  assert.equal(saveFirstMissionCompleted(() => null), false)
})
