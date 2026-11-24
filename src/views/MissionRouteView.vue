<script setup lang="ts">
import { computed } from 'vue'
import UiIcon from '../components/UiIcon.vue'
import { missions } from '../data/missions'
import { useLearningProgress } from '../composables/useLearningProgress'

const { firstMissionCompleted, secondMissionCompleted } = useLearningProgress()
const completed = computed(() => new Set([...(firstMissionCompleted.value ? [1] : []), ...(secondMissionCompleted.value ? [2] : [])]))
</script>

<template>
  <div class="route-view container">
    <header class="page-heading route-heading">
      <div><p class="eyebrow">任務路線</p><h1>先認識，再親手探索。</h1><p class="page-description">從生活裡的線索出發，一步步走向衛星任務控制台。</p></div>
      <span class="route-stamp"><UiIcon name="orbit" /><span>三站探索<br /><strong>一場太空任務</strong></span></span>
    </header>
    <p class="inline-notice"><UiIcon name="info" /> 三個關卡都已開放，可以依序探索，也可以自由試玩。</p>

    <ol class="mission-route">
      <li v-for="mission in missions" :key="mission.id" class="mission-stop" :class="{ 'available-stop': mission.path }">
        <div class="route-marker"><span>{{ String(mission.id).padStart(2, '0') }}</span></div>
        <div class="mission-emblem"><UiIcon :name="mission.icon" /></div>
        <div class="mission-summary">
          <span class="mission-kicker">第 {{ mission.id }} 關<span>／</span>{{ mission.question }}</span>
          <h2>{{ mission.title }}</h2>
          <p>{{ mission.description }}</p>
          <ul class="topic-list" aria-label="學習重點"><li v-for="topic in mission.topics" :key="topic">{{ topic }}</li></ul>
        </div>
        <div class="mission-entry">
          <template v-if="mission.path">
            <span class="availability" :class="completed.has(mission.id) ? 'mission-completed-label' : 'available-availability'">{{ completed.has(mission.id) ? `✓ ${mission.completedLabel}` : '任務已開放' }}</span>
            <RouterLink :to="mission.path" class="button button-primary">{{ completed.has(mission.id) ? mission.replayLabel : mission.entryLabel }}</RouterLink>
          </template>
          <template v-else>
            <span class="availability">即將開放</span>
            <button type="button" class="button button-unavailable" disabled :aria-label="`${mission.title}：功能開發中`">功能開發中</button>
          </template>
        </div>
      </li>
    </ol>
    <aside class="reading-teaser"><span class="reading-mark" aria-hidden="true">＋</span><div><h2>還想知道更多？</h2><p>給高中、大學初學者的衛星系統與太空任務入門閱讀，正在準備中。</p></div><span class="quiet-tag">內容準備中</span></aside>
    <RouterLink to="/" class="text-link page-back">回到出發站</RouterLink>
  </div>
</template>
