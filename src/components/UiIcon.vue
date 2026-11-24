<script setup lang="ts">
export type IconName = 'orbit' | 'planet' | 'satellite' | 'signal' | 'sun' | 'camera' | 'battery' | 'data' | 'clock' | 'info'

defineProps<{ name: IconName }>()
</script>

<template>
  <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <g v-if="name === 'orbit'">
      <circle cx="16" cy="16" r="6" />
      <ellipse cx="16" cy="16" rx="15" ry="6" transform="rotate(-35 16 16)" />
      <circle cx="26" cy="7" r="2.5" fill="currentColor" stroke="none" />
    </g>
    <g v-else-if="name === 'planet'">
      <circle cx="16" cy="16" r="11" />
      <path d="m9 7 3 5-2 4 5 3 1 8m6-20-4 5 3 4 5-1M3 26l26-20" />
    </g>
    <g v-else-if="name === 'satellite'" transform="rotate(-35 16 16)">
      <rect x="11" y="11" width="10" height="12" rx="1" />
      <path d="M11 14H2v7h9m10-7h9v7h-9M6 14v7m20-7v7M16 11V7m-4-4a4 4 0 0 0 8 0M16 7V3" />
    </g>
    <g v-else-if="name === 'signal'">
      <path d="m8 10 14 14a10 10 0 0 1-14-14ZM15 17l8-8m-3-4a7 7 0 0 1 7 7M20 1a11 11 0 0 1 11 11M11 24l-3 6m3-2h12" />
      <circle cx="23" cy="9" r="1.5" fill="currentColor" stroke="none" />
    </g>
    <g v-else-if="name === 'sun'">
      <circle cx="16" cy="16" r="6" />
      <path d="M16 2v4m0 20v4M2 16h4m20 0h4M6 6l3 3m14 14 3 3M6 26l3-3M23 9l3-3" />
    </g>
    <g v-else-if="name === 'camera'">
      <path d="m10 8 2-4h8l2 4h5a2 2 0 0 1 2 2v16H3V10a2 2 0 0 1 2-2Z" />
      <circle cx="16" cy="17" r="6" />
      <path d="M25 12h.01" />
    </g>
    <g v-else-if="name === 'battery'">
      <rect x="3" y="9" width="23" height="14" rx="2" />
      <path d="M29 13v6M7 13v6m5-6v6m5-6v6" />
    </g>
    <g v-else-if="name === 'data'">
      <ellipse cx="16" cy="7" rx="11" ry="4" />
      <path d="M5 7v18c0 5 22 5 22 0V7M5 16c0 5 22 5 22 0" />
    </g>
    <g v-else-if="name === 'clock'">
      <circle cx="16" cy="17" r="11" />
      <path d="M16 10v7l4 3M12 2h8M16 2v4m8 2 2-2" />
    </g>
    <g v-else>
      <circle cx="16" cy="16" r="12" />
      <path d="M16 14v9m0-14h.01" />
    </g>
  </svg>
</template>
