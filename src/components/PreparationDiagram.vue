<script setup lang="ts">
import { computed } from 'vue'
import { PREPARATION_STEPS } from '../data/satellitePreparation'
import type { PreparedFunction } from '../data/satellitePreparation'

const props = defineProps<{ prepared: readonly PreparedFunction[] }>()
const ready = (id: PreparedFunction) => props.prepared.includes(id)
const label = (id: PreparedFunction) => PREPARATION_STEPS.find(step => step.id === id)!.diagramLabel
const description = computed(() => {
  const completed = PREPARATION_STEPS.filter(step => ready(step.id)).map(step => step.diagramLabel)
  const pending = PREPARATION_STEPS.filter(step => !ready(step.id)).map(step => step.diagramLabel)
  return `衛星功能示意圖。儲存裝置與朝向控制功能以機身內部符號表示，外側箭線只示意朝向調整。已準備：${completed.join('、') || '尚無'}。尚未介紹：${pending.join('、') || '無'}。`
})
</script>

<template>
  <svg class="preparation-diagram" viewBox="0 0 640 320" role="img" :aria-label="description">
    <!-- 機身剖面只作教學示意，不代表實際工程配置。 -->
    <path d="m250 91 119-10 34 29v109l-121 10-32-29Z" fill="#102938" stroke="#7b919b" stroke-width="2" />
    <path d="m250 91 32 27 121-8m-121 8v111" fill="none" stroke="#536e7e" stroke-width="1.5" />

    <g class="preparation-function power" :class="{ 'is-ready': ready('power') }">
      <path d="M215 153h35m153 0h28" class="part-line" stroke-width="5" />
      <path d="M55 121h160v65H55Zm376 0h154v65H431Z" class="part-fill" stroke-width="2" />
      <path d="M87 121v65m32-65v65m32-65v65m32-65v65M55 153h160m247-32v65m31-65v65m31-65v65m31-65v65m-124-33h154" class="part-line" stroke-width="1" />
      <rect x="329" y="126" width="43" height="37" rx="3" class="part-fill" stroke-width="2" />
      <path d="M373 138h4v13h-4m-37-16v18m9-18v18m9-18v18" class="part-line" stroke-width="2" />
      <path d="M133 187v43" class="label-line" /><text x="133" y="258" text-anchor="middle">{{ ready('power') ? '✓ ' : '' }}{{ label('power') }}</text>
    </g>

    <g class="preparation-function storage" :class="{ 'is-ready': ready('storage') }">
      <rect x="279" y="126" width="36" height="37" rx="3" class="part-fill" stroke-width="2" />
      <path d="M286 136h22m-22 7h22m-22 7h14m-17-24v-5m8 5v-5m8 5v-5m8 5v-5m-24 42v5m8-5v5m8-5v5m8-5v5" class="part-line" stroke-width="2" />
      <path d="m279 144-76-65H66" class="label-line" /><text x="66" y="61">{{ ready('storage') ? '✓ ' : '' }}{{ label('storage') }}</text>
    </g>

    <g class="preparation-function camera" :class="{ 'is-ready': ready('camera') }">
      <path d="M303 225v18h37v-20" class="part-fill" stroke-width="2" />
      <ellipse cx="322" cy="244" rx="18" ry="9" class="part-fill" stroke-width="2" /><ellipse cx="322" cy="245" rx="10" ry="5" class="part-fill" stroke-width="2" />
      <path d="M322 254v18" class="label-line" /><text x="322" y="303" text-anchor="middle">{{ ready('camera') ? '✓ ' : '' }}{{ label('camera') }}</text>
    </g>

    <g class="preparation-function communication" :class="{ 'is-ready': ready('communication') }">
      <path d="m333 84 13-22" class="part-line" stroke-width="5" />
      <path d="M323 43q23 45 46 0Z" class="part-fill" stroke-width="2" /><path d="M346 66V29m-18 14 18-14 18 14" class="part-line" stroke-width="2" /><circle cx="346" cy="29" r="3" class="part-fill" />
      <path d="M370 45h94" class="label-line" /><text x="477" y="53">{{ ready('communication') ? '✓ ' : '' }}{{ label('communication') }}</text>
    </g>

    <g class="preparation-function attitude" :class="{ 'is-ready': ready('attitude') }">
      <circle cx="326" cy="191" r="18" class="part-fill" stroke-width="2" /><path d="M326 176v30m-15-15h30m-15-9-8 18 8-4 8 4Z" class="part-line" stroke-width="1.5" />
      <path d="M239 94q-42 65-3 126m-11-6 11 6 2-13m171 13q38-59 4-120m-2 13 2-13 12 5" class="orientation-line" stroke-width="2" stroke-dasharray="5 6" />
      <path d="m344 192 92 51h46" class="label-line" /><text x="503" y="272" text-anchor="middle">{{ ready('attitude') ? '✓ ' : '' }}{{ label('attitude') }}</text>
    </g>
  </svg>
</template>
