<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import PreparationDiagram from '../components/PreparationDiagram.vue'
import UiIcon from '../components/UiIcon.vue'
import { PREPARATION_CONTENT, PREPARATION_STEPS } from '../data/satellitePreparation'
import { usePreparationSession } from '../composables/usePreparationSession'
import '../styles/uses-quiz.css'
import '../styles/preparation.css'

const session = usePreparationSession()
const { state, step, prepared, saveSucceeded } = session
const stepHeading = ref<HTMLElement | null>(null)
const completionHeading = ref<HTMLElement | null>(null)
const solved = computed(() => state.value.feedback?.kind === 'correct')

async function nextStep(stepId: string) {
  if (!session.nextStep(stepId)) return
  await nextTick()
  if (state.value.phase === 'complete') completionHeading.value?.focus()
  else stepHeading.value?.focus()
}
async function restart() {
  session.restart()
  await nextTick()
  stepHeading.value?.focus()
}
</script>

<template>
  <div class="uses-quiz preparation-quiz container">
    <header class="uses-heading"><p class="eyebrow">第二關</p><h1>{{ PREPARATION_CONTENT.title }}</h1><p>{{ PREPARATION_CONTENT.goal }}</p></header>
    <section v-if="state.phase === 'step'" :key="step.id" class="uses-question" aria-labelledby="preparation-question">
      <div class="uses-progress"><p>第<strong>{{ state.stepIndex + 1 }}／{{ PREPARATION_STEPS.length }}</strong>步</p><div aria-hidden="true"><span v-for="(item, index) in PREPARATION_STEPS" :key="item.id" :class="{ current: index === state.stepIndex, done: state.answers[index] !== null }"></span></div></div>
      <div class="uses-question-body preparation-body">
        <figure class="preparation-figure"><PreparationDiagram :prepared="prepared" /><figcaption><span>✓ 亮起的功能已準備好；淡色輪廓尚未介紹。</span><span>內部功能與朝向箭線為教學示意。</span></figcaption></figure>
        <fieldset class="uses-choices" :disabled="solved"><legend id="preparation-question" ref="stepHeading" tabindex="-1">{{ step.question }}</legend><button v-for="option in step.options" :key="option.id" type="button" :class="{ 'answer-correct': solved && state.selectedAnswer === option.id, 'answer-retry': state.feedback?.kind === 'hint' && state.selectedAnswer === option.id }" :aria-describedby="state.feedback ? 'preparation-feedback' : undefined" @click="session.answer(step.id, option.id)"><span>{{ option.label }}</span><span v-if="state.selectedAnswer === option.id" class="answer-mark" aria-hidden="true">{{ solved ? '✓' : '？' }}</span></button></fieldset>
      </div>
      <div class="uses-response" :class="state.feedback?.kind"><div id="preparation-feedback" class="uses-feedback" role="status" aria-live="polite" aria-atomic="true"><template v-if="state.feedback"><strong>{{ solved ? '✓ 準備好了！' : '再想一想' }}</strong><p>{{ state.feedback.text }}</p></template></div><button v-if="solved" type="button" class="button button-primary uses-next" @click="nextStep(step.id)">{{ state.stepIndex === PREPARATION_STEPS.length - 1 ? '完成準備' : '下一步' }}</button></div>
    </section>

    <section v-else class="preparation-completion" aria-labelledby="preparation-completed">
      <h2 id="preparation-completed" ref="completionHeading" tabindex="-1">{{ PREPARATION_CONTENT.completion }}</h2>
      <div class="preparation-review"><PreparationDiagram :prepared="prepared" /><div><ol class="preparation-flow" aria-label="照片任務的工作順序"><li v-for="(item, index) in PREPARATION_CONTENT.flow" :key="item.label"><UiIcon :name="item.icon" /><span>{{ item.label }}</span><span v-if="index < PREPARATION_CONTENT.flow.length - 1" class="flow-connector" aria-hidden="true">→</span></li></ol><p class="preparation-support">{{ PREPARATION_CONTENT.support }}</p></div></div>
      <p class="preparation-limitation">{{ PREPARATION_CONTENT.limitation }}</p><p class="preparation-next-note">{{ PREPARATION_CONTENT.nextMission }}</p>
      <p v-if="saveSucceeded === false" class="uses-storage-note">此瀏覽器目前無法保存進度，你仍可繼續遊玩。</p>
      <div class="preparation-completion-actions"><RouterLink to="/missions/3" class="button button-primary">開始第三關</RouterLink><button type="button" class="button preparation-replay" @click="restart">再看一次</button><RouterLink to="/missions" class="text-link">返回任務路線</RouterLink></div>
    </section>
    <RouterLink v-if="state.phase === 'step'" to="/missions" class="text-link uses-return">返回任務路線</RouterLink>
  </div>
</template>
