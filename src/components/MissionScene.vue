<script setup lang="ts">
import { computed } from 'vue'
import MissionPhoto from './MissionPhoto.vue'
import type { MissionAction, MissionState } from '../game/mission'

const props = defineProps<{ action?: MissionAction | null; game?: MissionState; contact?: boolean }>()
const record = computed(() => props.game?.history.at(-1))
const movingRegion = computed(() => record.value?.photo?.region ?? 'coast')
const waits = computed(() => props.game?.history.filter(item => item.action === 'wait').length ?? 0)
const offset = computed(() => Math.min(60, waits.value * 12))
const groundPhotos = computed(() => props.game?.photos.filter(photo => photo.location === 'ground' && !(props.action === 'transmit' && photo.id === record.value?.photo?.id)) ?? [])
</script>

<template>
  <svg class="mission-scene" viewBox="0 0 1000 280" role="img" aria-label="衛星觀察海岸與森林，將照片傳至地球觀測站；照片、移動與路徑皆為教學示意">
    <g fill="#b7d3df" opacity=".6"><circle cx="100" cy="110" r="2" /><circle cx="420" cy="34" r="2" /><circle cx="730" cy="57" r="2" /><circle cx="900" cy="30" r="1.5" /></g>
    <g transform="translate(62 45)" fill="#f0cf8c" stroke="#f0cf8c" stroke-width="3"><circle r="15" /><path d="M-25 0h-9m59 0h9M0-25v-9m0 59v9M-18-18l-7-7m43 43 7 7m-7-43 7-7m-43 43-7 7" /></g>
    <path d="M95 145Q410-20 734 112" stroke="#385e73" stroke-dasharray="4 9" fill="none" />
    <path d="M332 280Q560 55 825 228L852 280Z" fill="#174864" stroke="#5791a7" stroke-width="2" />
    <path d="m405 233 75-63 48 7 7 25-38 16-9 37-59 9Z" fill="#579075" />
    <path d="m480 170 10 23-19 23 13 13-2 25" stroke="#ddc38b" stroke-width="9" fill="none" />
    <path d="m578 165 56 5 35 36-22 48-62-10-26-37Z" fill="#396f58" />
    <g fill="#83aa77"><path d="m602 181-12 22h24Zm32 14-13 22h26Zm-32 23-13 22h26Z" /></g>
    <g :class="['scene-satellite', { waiting: action === 'wait' }]" :style="{ '--sat-x': `${offset}px`, '--sat-before': `${Math.max(0, offset - 12)}px` }">
      <g transform="translate(257 98) rotate(-10)">
        <path d="M-128 0h256" stroke="#9bb4c1" stroke-width="6" />
        <g :class="['scene-panels', { charging: action === 'charge' }]" fill="#245c80" stroke="#9bcedc" stroke-width="2"><rect x="-135" y="-33" width="90" height="66" rx="2" /><rect x="45" y="-33" width="90" height="66" rx="2" /><path d="M-105-33v66m30-66v66m-60-33h90M75-33v66m30-66v66m-60-33h90" /></g>
        <path d="m-38-40 62-5 18 17-3 65-62 8-18-17Z" fill="#c5a763" stroke="#f0d28f" stroke-width="2" />
        <path d="m-38-40 19 20 61-8M-19-20v65" stroke="#f0d28f" fill="none" stroke-width="2" />
        <path d="M0-42v-20m-20-16Q0-42 20-78Z" fill="#a6c5cf" stroke="#dbe9ec" stroke-width="3" />
        <rect x="-8" y="40" width="27" height="17" rx="3" fill="#16394b" stroke="#bfd9dd" stroke-width="2" /><circle cx="6" cy="49" r="6" fill="#83d0d7" />
      </g>
    </g>
    <g v-if="action === 'charge'" class="scene-energy" stroke="#f3d48b" fill="none" stroke-width="4"><path d="m95 53 76 17m-81 1 64 29m-49-57 76 7" /></g>
    <g :class="['scene-link', { receiving: contact || (!game && action === 'transmit') }]" fill="none" stroke-width="3"><path d="M290 68Q555-12 850 175" stroke-dasharray="7 8" /></g>
    <g :class="['scene-station', { receiving: contact || (!game && action === 'transmit') }]" transform="translate(850 180)" stroke-width="3">
      <path d="M-45 63h112" stroke="#557e8e" /><path d="M-18 60V21h68v39Z" fill="#1c3b4d" stroke="#87b5c2" /><path d="m-24 22 39-23 40 23Z" fill="#284e5e" stroke="#87b5c2" />
      <path d="M4 1v-27m-23-23Q4-15 25-49Z" fill="#93b7c2" stroke="#c2dfe5" /><path class="station-light" d="M29 36h10v12H29Z" fill="#6a8791" />
    </g>
    <g v-if="action === 'capture'" class="scene-shutter" :transform="movingRegion === 'coast' ? 'translate(480 205)' : 'translate(617 205)'" fill="none" stroke="#f4d58e" stroke-width="4"><path d="M-38-26v-12h15m46 0h15v12m0 40v12H23m-46 0h-15V14" /><circle r="22" /></g>
    <g v-if="action === 'capture' || action === 'transmit'" :class="['flying-photo', action]" :style="{ '--capture-x': movingRegion === 'coast' ? '450px' : '587px' }"><MissionPhoto :region="movingRegion" width="60" height="42" /></g>
    <g v-for="(photo, index) in groundPhotos.slice(0, 4)" :key="photo.id" :transform="`translate(${814 + index * 36} 247)`"><MissionPhoto :region="photo.region" width="32" height="23" /></g>
  </svg>
</template>
