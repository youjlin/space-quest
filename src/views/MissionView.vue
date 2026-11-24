<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MissionScene from '../components/MissionScene.vue'
import MissionPhoto from '../components/MissionPhoto.vue'
import UiIcon from '../components/UiIcon.vue'
import { useMissionSession } from '../composables/useMissionSession'
import { PHOTO_TARGETS, RULES, canContact, remainingActions } from '../game/mission'
import type { MissionAction } from '../game/mission'
import { ACTION_LABELS, LESSONS, contactMessage, resultAdvice, resultSummary, shortBlocker } from '../game/missionExperience'
import '../styles/mission.css'

const session = useMissionSession()
const { game, tutorialOpen, tutorialStep, started, feedback, rejected, visualAction, animationKey } = session
const lessonHeading = ref<HTMLElement | null>(null)
const controlsHeading = ref<HTMLElement | null>(null)
const resultHeading = ref<HTMLElement | null>(null)
const panelHeading = ref<HTMLElement | null>(null)
const panel = ref<'rules' | 'timeline' | 'log' | 'science' | null>(null)
let returnFocus: HTMLElement | null = null
let actionFocus: HTMLElement | null = null
let returnScroll = 0
const lesson = computed(() => LESSONS[tutorialStep.value])
const skipped = computed(() => tutorialStep.value === LESSONS.length)
const busy = computed(() => visualAction.value !== null)
const contact = computed(() => game.value.status === 'active' && canContact(game.value.turn))
const showWait = computed(() => game.value.status === 'active' && !contact.value)
const actionsLeft = computed(() => remainingActions(game.value))
const stored = computed(() => game.value.photos.filter(photo => photo.location === 'satellite'))
const targets = computed(() => PHOTO_TARGETS.map(target => {
  const photos = game.value.photos.filter(photo => photo.region === target.region)
  const delivered = photos.find(photo => photo.location === 'ground')
  return { ...target, status: delivered ? '已送達' : photos.length ? '衛星內' : '未拍攝', delivered }
}))
const deliveredTargets = computed(() => targets.value.filter(target => target.delivered).length)
const primaryActions = computed(() => ([
  { id: 'charge', label: '充電', icon: 'sun', cost: `電量＋${RULES.chargeGain}` },
  { id: 'capture', label: '拍照', icon: 'camera', cost: `電量－${RULES.captureCost}` },
  { id: 'transmit', label: '傳回地球', icon: 'signal', cost: `電量－${RULES.transmitCost}` },
] as const).map(action => ({ ...action, reason: shortBlocker(game.value, action.id) })))
const turns = computed(() => Array.from({ length: RULES.maxTurns }, (_, index) => {
  const turn = index + 1
  return { turn, contact: canContact(turn), action: game.value.history.find(entry => entry.turn === turn)?.action }
}))
const advice = computed(() => resultAdvice(game.value))
const panelTabs = [{ id: 'rules', label: '操作提示' }, { id: 'timeline', label: '8回合時間軸' }, { id: 'log', label: '操作紀錄' }, { id: 'science', label: '科學說明' }] as const

async function focusLesson() { await nextTick(); lessonHeading.value?.focus({ preventScroll: true }) }
async function moveLesson(direction: 'next' | 'previous' | 'skip') {
  if (direction === 'next') session.nextLesson()
  else if (direction === 'previous') session.previousLesson()
  else session.skipLessons()
  await focusLesson()
}
function rememberPosition(event: Event) {
  returnFocus = event.currentTarget as HTMLElement
  returnScroll = window.scrollY
}
async function restorePosition() {
  await nextTick()
  returnFocus?.focus({ preventScroll: true })
  window.scrollTo({ top: returnScroll, behavior: 'instant' })
}
async function enterMission() {
  session.startMission()
  if (returnFocus) await restorePosition()
  else { await nextTick(); controlsHeading.value?.focus({ preventScroll: true }) }
}
async function openTutorial(event: Event) { rememberPosition(event); session.openTutorial(); await focusLesson() }
async function openPanel(event: Event) { rememberPosition(event); panel.value = 'rules'; await nextTick(); panelHeading.value?.focus({ preventScroll: true }) }
async function closePanel() { panel.value = null; await restorePosition() }
async function restart() { panel.value = null; returnFocus = null; session.restart(); await focusLesson() }
function onKey(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  if (panel.value) { event.preventDefault(); void closePanel() }
  else if (tutorialOpen.value && started.value) { event.preventDefault(); void enterMission() }
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
async function act(action: MissionAction) {
  actionFocus = document.activeElement as HTMLElement | null
  if (!session.act(action)) return
  if (busy.value) return
  await nextTick()
  if (game.value.status !== 'active') resultHeading.value?.focus({ preventScroll: true })
}
// 動畫最後一幀之後才顯示成果，照片先完成抵達地面。
watch(busy, async value => {
  if (value) return
  await nextTick()
  if (game.value.status !== 'active') resultHeading.value?.focus({ preventScroll: true })
  else if (game.value.history.at(-1)?.action === 'wait' && !showWait.value) controlsHeading.value?.focus({ preventScroll: true })
  else if (actionFocus?.isConnected) actionFocus.focus({ preventScroll: true })
})
</script>

<template>
  <div class="mission-view mission-screen container">
    <header class="mission-topbar">
      <h1><span>第三關</span>執行衛星任務</h1>
      <div v-show="!tutorialOpen && !panel" class="mission-tools">
        <button type="button" :disabled="busy" @click="openTutorial">操作說明</button>
        <button type="button" :disabled="busy" @click="openPanel">規則與紀錄</button>
        <button type="button" @click="restart">重新開始</button>
      </div>
    </header>

    <section v-if="panel" class="mission-panel" aria-labelledby="panel-heading">
      <header><h2 id="panel-heading" ref="panelHeading" tabindex="-1">任務資訊</h2><button type="button" class="button panel-close" @click="closePanel">關閉，返回任務</button></header>
      <nav aria-label="任務資訊分類"><button v-for="tab in panelTabs" :key="tab.id" type="button" :aria-pressed="panel === tab.id" @click="panel = tab.id">{{ tab.label }}</button></nav>
      <ul v-if="panel === 'rules'" class="panel-rules">
        <li>先拍海岸，再拍森林，兩個區域都送達才達標。拍好但還在衛星裡，不算送達。</li>
        <li>初始電量50，上限100；充電＋30、拍照－20、傳回一張照片－15。衛星最多存2張。</li>
        <li>共8次行動，第3、4、7、8回合地面站可接收。每回合都有日照與拍攝機會。</li>
        <li>等待使用1次行動，不改變電量或照片；無效操作不消耗行動。</li>
        <li>多拍時會交替拍攝海岸與森林，每張都有獨立ID；重複區域不重複計入兩個目標。額外拍下的照片也必須全部送達。</li>
        <li>先想想：拍照之後，還夠電力傳送嗎？地面站能接收時，衛星裡有照片嗎？</li>
        <li>最後一次行動也能成功。重新整理或離開會開始新的一局，本關不儲存進行中的任務。</li>
      </ul>
      <ol v-else-if="panel === 'timeline'" class="compact-timeline"><li v-for="step in turns" :key="step.turn" :class="{ current: step.turn === game.turn, receiving: step.contact }"><strong>第{{ step.turn }}回合</strong><span>{{ step.contact ? '可以傳照片' : '暫時收不到' }}</span><span>{{ step.action ? ACTION_LABELS[step.action] : step.turn === game.turn && game.status === 'active' ? '目前位置' : '未使用' }}</span></li></ol>
      <div v-else-if="panel === 'log'">
        <p v-if="!game.history.length">還沒有操作紀錄。</p>
        <ol v-else class="compact-log"><li v-for="record in game.history" :key="record.turn"><strong>第{{ record.turn }}回合 · {{ ACTION_LABELS[record.action] }}</strong><span v-if="record.photo">{{ record.photo.region === 'coast' ? '海岸' : '森林' }} · {{ record.photo.id }}</span><span>電量 {{ record.before.energy }} → {{ record.after.energy }}</span><span>衛星照片 {{ record.before.pending }} → {{ record.after.pending }} 張</span><span>已送達 {{ record.before.delivered }} → {{ record.after.delivered }} 張</span></li></ol>
      </div>
      <div v-else class="science-copy"><p>這是回合制教學模型，電量與回合數是遊戲設定，並非真實衛星工程數值。本關將操作分開，是為了練習安排資源；真實衛星可能同時執行多項功能。</p><p>通聯時段是預設的教學情境，並未計算真實軌道。場景移動僅為示意，不模擬真實姿態動力學。照片是自行製作的示意插圖，並非真實衛星影像。</p></div>
    </section>

    <section v-else-if="tutorialOpen" class="mission-briefing" aria-labelledby="briefing-title">
      <div class="briefing-goal"><h2 id="briefing-title">替地球觀測站拍下兩張不同區域的照片，並送回地面。</h2><p>你有8次行動機會，記得留電力傳送照片。</p></div>
      <ol class="lesson-progress" aria-label="教學進度"><li v-for="(item, index) in LESSONS" :key="item.action" :class="{ active: !skipped && index === tutorialStep }" :aria-current="!skipped && index === tutorialStep ? 'step' : undefined">{{ index + 1 }} · {{ item.title }}</li></ol>
      <div class="lesson-content">
        <MissionScene :key="tutorialStep" :action="lesson?.action ?? null" />
        <div class="lesson-copy"><p>{{ skipped ? '準備出發' : `操作 ${tutorialStep + 1}／3` }}</p><h3 ref="lessonHeading" tabindex="-1">{{ lesson?.title ?? '準備好了嗎？' }}</h3><p>{{ lesson?.text ?? '海岸和森林都能拍，衛星會依序拍攝，不用另外選目標。' }}</p></div>
      </div>
      <div class="lesson-navigation">
        <button type="button" class="lesson-previous" :disabled="tutorialStep === 0" @click="moveLesson('previous')">上一步</button>
        <button v-if="tutorialStep < LESSONS.length - 1" type="button" class="button button-primary" @click="moveLesson('next')">下一步</button>
        <button v-else type="button" class="button button-primary" @click="enterMission">{{ started ? '繼續任務' : '開始任務' }}</button>
      </div>
      <div class="lesson-skip"><button v-if="!skipped && tutorialStep < LESSONS.length - 1" type="button" @click="moveLesson('skip')">略過圖解</button><button v-if="started" type="button" @click="enterMission">返回目前任務（Esc）</button></div>
    </section>

    <section v-else-if="game.status === 'active' || busy" class="mission-playground" aria-label="衛星任務操作台">
      <div class="play-goal"><h2>拍下海岸與森林，送回地球觀測站。</h2><p>已送達 <strong>{{ deliveredTargets }}／2</strong> 個區域</p><p>還能行動 <strong>{{ actionsLeft }}</strong> 次</p></div>
      <div class="play-scene"><div class="scene-caption"><span>{{ visualAction ? `正在${ACTION_LABELS[visualAction]}` : '衛星 → 地球觀測站' }}</span><span>場景與照片均為示意</span></div><MissionScene :key="animationKey" :action="visualAction" :game="game" :contact="contact" /></div>
      <div class="target-progress" aria-label="兩個照片目標的進度"><div v-for="target in targets" :key="target.region" :class="{ delivered: target.delivered }"><MissionPhoto :region="target.region" /><strong>{{ target.label }}</strong><span>{{ target.status }}</span><span v-if="target.delivered" aria-hidden="true">✓</span></div></div>
      <p class="play-contact" :class="{ receiving: contact }"><UiIcon name="signal" />{{ contactMessage(game) }}</p>
      <div class="play-console">
        <div class="play-resources">
          <div class="simple-battery"><div><span id="battery-label"><UiIcon name="battery" />電量</span><strong>{{ game.energy }}<small>／100</small></strong></div><div class="battery-track" role="meter" aria-labelledby="battery-label" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="game.energy"><span :style="{ width: `${game.energy}%` }"></span></div></div>
          <div class="stored-photos"><p>衛星裡的照片</p><div><div v-for="index in 2" :key="index" class="photo-slot" :class="{ arriving: visualAction === 'capture' && stored[index - 1]?.id === game.history.at(-1)?.photo?.id }"><template v-if="stored[index - 1]"><MissionPhoto :region="stored[index - 1]!.region" /><span>{{ stored[index - 1]!.region === 'coast' ? '海岸' : '森林' }}</span></template><span v-else>空位</span></div></div></div>
        </div>
        <div class="primary-controls"><h3 ref="controlsHeading" tabindex="-1" class="visually-hidden">選擇一個動作</h3><div v-for="action in primaryActions" :key="action.id" class="primary-control"><button type="button" :class="{ unavailable: action.reason }" :disabled="busy || game.status !== 'active' || (action.id === 'charge' && game.energy === 100)" :aria-disabled="Boolean(action.reason)" :aria-describedby="`unavailable-${action.id}`" @click="act(action.id)"><UiIcon :name="action.icon" /><strong>{{ action.label }}</strong><small>{{ action.cost }}</small></button><p :id="`unavailable-${action.id}`" class="unavailable-reason">{{ action.reason || '\u00a0' }}</p></div></div>
      </div>
      <p class="play-feedback" :class="{ rejected }" role="status" aria-live="polite" aria-atomic="true">{{ feedback }}</p>
      <div class="play-wait"><template v-if="showWait"><button type="button" :disabled="busy" @click="act('wait')"><UiIcon name="clock" />等下一回合</button><span>不改變電量與照片，使用1次行動機會</span></template></div>
    </section>

    <section v-else class="simple-result" :class="game.status" aria-labelledby="result-title">
      <h2 id="result-title" ref="resultHeading" tabindex="-1">{{ game.status === 'success' ? '照片送達，任務成功！' : '行動機會用完了' }}</h2>
      <p>{{ resultSummary(game) }}</p>
      <div v-if="game.status === 'success'" class="result-photos"><figure v-for="target in targets" :key="target.region"><MissionPhoto v-if="target.delivered" :region="target.delivered.region" /><figcaption>{{ target.label }} · 已送達</figcaption></figure></div>
      <p v-else class="result-advice">{{ advice }}</p>
      <div class="result-actions"><button type="button" class="button button-primary" @click="restart">再玩一次</button><RouterLink to="/missions" class="text-link">返回任務路線</RouterLink></div>
    </section>
    <div v-if="!panel" class="mission-bottom"><p>這是幫助理解任務安排的簡化遊戲。</p><RouterLink v-if="tutorialOpen || game.status === 'active'" to="/missions" class="text-link">返回任務路線</RouterLink></div>
  </div>
</template>


