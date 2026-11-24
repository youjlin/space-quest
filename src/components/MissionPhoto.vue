<script setup lang="ts">
import type { PhotoRegion } from '../game/mission'
defineProps<{ region: PhotoRegion }>()
</script>

<template>
  <svg class="mission-photo" viewBox="0 0 100 70" role="img" :aria-label="`${region === 'coast' ? '海岸' : '森林'}照片（示意圖）`">
    <rect x="1" y="1" width="98" height="68" rx="5" fill="#dce9e5" />
    <template v-if="region === 'coast'">
      <path d="M5 5h90v60H5Z" fill="#388b9f" />
      <path d="M5 5h58L43 22 57 34 37 47 42 65H5Z" fill="#d9bd85" />
      <path d="m58 5-20 18 13 12-20 13 6 17H5V5Z" fill="#5e9272" />
      <path d="m70 13-9 8m20 12-12 8m7 11-9 6" stroke="#a4dfe0" stroke-width="3" fill="none" />
    </template>
    <template v-else>
      <path d="M5 5h90v60H5Z" fill="#264e49" />
      <path d="M58 5 45 21 62 38 44 65" fill="none" stroke="#72b4ba" stroke-width="9" />
      <g fill="#77aa77"><path d="m20 10-11 20h22Zm8 28-12 21h24Zm49-25L66 33h23Zm1 28L67 60h22Z" /></g>
    </template>
  </svg>
</template>
