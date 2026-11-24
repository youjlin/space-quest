<script setup lang="ts">
import { computed } from 'vue'
import { missions } from '../data/missions'
import { useLearningProgress } from '../composables/useLearningProgress'

const { firstMissionCompleted, secondMissionCompleted } = useLearningProgress()
const completed = computed(() => new Set([...(firstMissionCompleted.value ? [1] : []), ...(secondMissionCompleted.value ? [2] : [])]))
</script>

<template>
  <div class="station-route container">
    <header class="station-route-heading"><h1>任務路線</h1><p>可以依序探索，也可以直接選一關試玩。</p></header>
    <ol class="station-stops">
      <li v-for="mission in missions" :key="mission.id">
        <span class="station-number">第 {{ mission.id }} 關</span>
        <h2>{{ mission.title }}</h2>
        <p class="station-topics">{{ mission.topics.join(' · ') }}</p>
        <div class="station-entry">
          <p :class="{ 'mission-completed-label': completed.has(mission.id) }">{{ completed.has(mission.id) ? `✓ ${mission.completedLabel}` : '任務已開放' }}</p>
          <RouterLink v-if="mission.path" :to="mission.path" class="button button-primary">{{ completed.has(mission.id) ? mission.replayLabel : mission.entryLabel }}</RouterLink>
        </div>
      </li>
    </ol>
    <RouterLink to="/" class="text-link station-back">回到出發站</RouterLink>
  </div>
</template>

