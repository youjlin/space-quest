<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import SituationIllustration from '../components/SituationIllustration.vue'
import UiIcon from '../components/UiIcon.vue'
import { USES_CONTENT, USES_OPTIONS, USES_QUESTIONS } from '../data/satelliteUses'
import { useUsesQuizSession } from '../composables/useUsesQuizSession'
import '../styles/uses-quiz.css'

const session = useUsesQuizSession()
const { state, question, saveSucceeded } = session
const questionHeading = ref<HTMLElement | null>(null)
const completionHeading = ref<HTMLElement | null>(null)
const solved = computed(() => state.value.feedback?.kind === 'correct')

async function nextQuestion(questionId: string) {
  if (!session.nextQuestion(questionId)) return
  await nextTick()
  if (state.value.phase === 'complete') completionHeading.value?.focus()
  else questionHeading.value?.focus()
}
async function restart() {
  session.restart()
  await nextTick()
  questionHeading.value?.focus()
}
</script>

<template>
  <div class="uses-quiz container">
    <header class="uses-heading"><p class="eyebrow">第一關</p><h1>{{ USES_CONTENT.title }}</h1><p v-if="state.phase === 'question'">{{ USES_CONTENT.introduction }}</p></header>

    <section v-if="state.phase === 'question'" :key="question.id" class="uses-question" aria-labelledby="question-title">
      <div class="uses-progress"><p>第<strong>{{ state.questionIndex + 1 }}／{{ USES_QUESTIONS.length }}</strong>題</p><div aria-hidden="true"><span v-for="(item, index) in USES_QUESTIONS" :key="item.id" :class="{ current: index === state.questionIndex, done: state.answers[index] !== null }"></span></div></div>
      <div class="uses-question-body">
        <div class="uses-situation"><h2 id="question-title" ref="questionHeading" tabindex="-1">{{ question.title }}</h2><p>{{ question.situation }}</p><SituationIllustration :scene="question.id" :description="question.illustrationDescription" /></div>
        <fieldset class="uses-choices" :disabled="solved"><legend>{{ USES_CONTENT.prompt }}</legend><button v-for="option in USES_OPTIONS" :key="option.id" type="button" :class="{ 'answer-correct': solved && state.selectedAnswer === option.id, 'answer-retry': state.feedback?.kind === 'hint' && state.selectedAnswer === option.id }" :aria-describedby="state.feedback ? 'uses-feedback' : undefined" @click="session.answer(question.id, option.id)"><UiIcon :name="option.icon" /><span>{{ option.label }}</span><span v-if="state.selectedAnswer === option.id" class="answer-mark" aria-hidden="true">{{ solved ? '✓' : '？' }}</span></button></fieldset>
      </div>
      <div class="uses-response" :class="state.feedback?.kind">
        <div id="uses-feedback" class="uses-feedback" role="status" aria-live="polite" aria-atomic="true"><template v-if="state.feedback"><strong>{{ state.feedback.kind === 'correct' ? '✓ 答對了！' : '再想一想' }}</strong><p>{{ state.feedback.text }}</p></template></div>
        <button v-if="solved" type="button" class="button button-primary uses-next" @click="nextQuestion(question.id)">{{ state.questionIndex === USES_QUESTIONS.length - 1 ? '完成任務' : '下一題' }}</button>
      </div>
    </section>

    <section v-else class="uses-completion" aria-labelledby="uses-completed-title"><span class="uses-completion-symbol" aria-hidden="true">✓</span><h2 id="uses-completed-title" ref="completionHeading" tabindex="-1">{{ USES_CONTENT.completion }}</h2><ul><li v-for="option in USES_OPTIONS" :key="option.id"><UiIcon :name="option.icon" /><p>{{ option.review }}</p></li></ul><p v-if="saveSucceeded === false" class="uses-storage-note">此瀏覽器目前無法保存進度，你仍可繼續遊玩。</p><div class="uses-completion-actions"><RouterLink to="/missions/2" class="button button-primary">前往第二關</RouterLink><button type="button" class="button button-primary" @click="restart">再玩一次</button><RouterLink to="/missions" class="text-link">返回任務路線</RouterLink></div></section>
    <RouterLink v-if="state.phase === 'question'" to="/missions" class="text-link uses-return">返回任務路線</RouterLink>
  </div>
</template>
