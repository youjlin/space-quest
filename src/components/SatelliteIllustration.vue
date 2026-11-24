<script setup lang="ts">
import { useId } from 'vue'
import type { MissionAction } from '../game/mission'

withDefaults(defineProps<{ compact?: boolean; action?: MissionAction | null }>(), { compact: false, action: null })
const id = useId().replace(/:/g, '')
</script>

<template>
  <svg class="satellite-illustration" :class="{ 'is-compact': compact }" viewBox="0 0 760 640" role="img" :aria-labelledby="`${id}-title ${id}-desc`">
    <title :id="`${id}-title`">環繞地球的觀測衛星</title>
    <desc :id="`${id}-desc`">一顆有藍色太陽能板、金色機身、相機與通訊天線的衛星，飛行在地球上方。圖中以文字標示三個主要部件，比例經過簡化。</desc>
    <defs>
      <radialGradient :id="`${id}-atmosphere`">
        <stop offset="0" stop-color="#3d8da8" stop-opacity=".25" />
        <stop offset="1" stop-color="#3d8da8" stop-opacity="0" />
      </radialGradient>
      <linearGradient :id="`${id}-earth`" x1="0" y1="0" x2=".8" y2="1">
        <stop stop-color="#276483" /><stop offset=".4" stop-color="#123e5a" /><stop offset="1" stop-color="#081725" />
      </linearGradient>
      <linearGradient :id="`${id}-gold`" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#f6db98" /><stop offset=".5" stop-color="#cba859" /><stop offset="1" stop-color="#876831" />
      </linearGradient>
      <linearGradient :id="`${id}-panel`" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#30719a" /><stop offset="1" stop-color="#123656" />
      </linearGradient>
      <linearGradient :id="`${id}-silver`" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#ebf4ef" /><stop offset="1" stop-color="#5e8293" />
      </linearGradient>
      <pattern :id="`${id}-cells`" width="27" height="29" patternUnits="userSpaceOnUse">
        <rect width="27" height="29" :fill="`url(#${id}-panel)`" />
        <path d="M0 0H27V29H0Z" fill="none" stroke="#82c8e3" stroke-opacity=".6" stroke-width="1" />
        <path d="M3 5H24M3 10H24M3 15H24M3 20H24M3 25H24" stroke="#7bb8d5" stroke-width=".5" stroke-opacity=".35" />
      </pattern>
      <clipPath :id="`${id}-earth-clip`"><circle cx="622" cy="675" r="285" /></clipPath>
    </defs>

    <circle cx="415" cy="325" r="310" :fill="`url(#${id}-atmosphere)`" />
    <g fill="#c2e7e8">
      <circle cx="105" cy="116" r="1.5" opacity=".6" /><circle cx="654" cy="105" r="2" opacity=".7" />
      <circle cx="185" cy="405" r="2" opacity=".5" /><circle cx="690" cy="349" r="1.5" opacity=".7" />
      <circle cx="555" cy="65" r="1" /><circle cx="292" cy="76" r="1.5" opacity=".6" />
      <circle cx="52" cy="307" r="1" /><circle cx="107" cy="518" r="1.5" opacity=".5" />
    </g>
    <g fill="none" stroke="#76c5d2" stroke-width="1">
      <ellipse cx="392" cy="325" rx="316" ry="174" transform="rotate(-24 392 325)" opacity=".13" />
      <ellipse cx="392" cy="325" rx="301" ry="157" transform="rotate(-24 392 325)" opacity=".35" stroke-dasharray="3 9" />
      <path d="M123 433C77 363 169 234 335 163" opacity=".45" />
    </g>
    <circle cx="135" cy="283" r="4" fill="#78d5da" />
    <circle cx="135" cy="283" r="10" fill="none" stroke="#78d5da" opacity=".25" />

    <!-- 地球位於衛星後方；圖形為教學用原創示意。 -->
    <circle cx="622" cy="675" r="294" fill="#5da4bd" opacity=".05" />
    <circle cx="622" cy="675" r="288" fill="none" stroke="#84d4e4" stroke-opacity=".4" />
    <circle cx="622" cy="675" r="285" :fill="`url(#${id}-earth)`" />
    <g :clip-path="`url(#${id}-earth-clip)`">
      <path d="m422 460 53-20 40 19 20 33 39 10-8 35-36 5-11 35-22-11-20-42-44-13-18-28Zm167-55 54 4 20 27-18 30-35-5-25 20-41-10 1-27ZM649 506l53 11 29 42-18 35-44 6-7-39-32-19Z" fill="#39818b" opacity=".55" />
      <g fill="none" stroke="#afdae0" stroke-linecap="round">
        <path d="M408 479c70-52 138 45 238-1m-237 28c49-23 81 13 112 12m48-80c68-16 83 20 134 10m-159 94c39-8 59 24 89 12m-177 37c19-10 44-6 57 2" stroke-width="6" opacity=".19" />
        <path d="M427 463c46-26 74 19 123 13m52-43 59 5m-63 143 43 13" stroke-width="2" opacity=".4" />
      </g>
      <ellipse cx="578" cy="640" rx="255" ry="125" fill="none" stroke="#8cc7da" opacity=".08" transform="rotate(-23 578 640)" />
    </g>

    <!-- 太陽能板、機身、天線與相機共用一個旋轉座標系。 -->
    <g class="satellite-body" transform="translate(373 302) rotate(-26)">
      <path d="M-193 9H190" stroke="#7d9eac" stroke-width="9" />
      <g stroke="#83b6cf" stroke-width="2">
        <path d="m-247-67 177-4v118l-177 4Z" :fill="`url(#${id}-cells)`" />
        <path d="m70-71 177 4V51L70 47Z" :fill="`url(#${id}-cells)`" />
      </g>
      <path d="m-247 51 177-4v6l-177 4Zm317-4 177 4v6L70 53Z" fill="#0d2e48" />
      <path d="m-64-71 88-14 43 32-1 111-92 15-41-33Z" :fill="`url(#${id}-gold)`" stroke="#ead296" stroke-width="1.5" />
      <path d="m-64-71 41 32 90-14-43-32Z" fill="#f0d28e" />
      <path d="m-23-39 90-14-1 111-92 15Z" fill="#be984e" />
      <g fill="none" stroke="#e9cd89" stroke-width="1.3" opacity=".6">
        <path d="m-18-30 26 22-21 25 28 19-34 29m34-99 20 22-17 26 24 20-20 24m20-101 23 24-23 28 24 17-21 20M-56-54l25 33-26 19 24 29-23 8" />
      </g>
      <path d="m-64-71 41 32-3 112-41-33Z" fill="#a58143" opacity=".5" />
      <path d="m-6-70 7-51" stroke="#c1d4d7" stroke-width="7" />
      <g transform="translate(4 -126) rotate(-10)">
        <path d="M-42-17Q0 53 42-17Z" :fill="`url(#${id}-silver)`" stroke="#c7dcdf" stroke-width="2" />
        <ellipse cx="0" cy="-17" rx="42" ry="12" fill="#819eaa" stroke="#cfdee0" stroke-width="2" />
        <path d="M0 10V-38m-25 21 25-21 25 21" fill="none" stroke="#e4e8dd" stroke-width="2" />
        <circle cy="-39" r="4" fill="#f0cf80" />
      </g>
      <path d="m-5 70 5 24 36-5-2-24" fill="#486477" stroke="#a4bbc2" />
      <ellipse cx="18" cy="91" rx="18" ry="10" fill="#91abb7" />
      <ellipse cx="18" cy="92" rx="12" ry="7" fill="#0b263b" stroke="#74d2dc" stroke-width="2" />
      <ellipse cx="15" cy="90" rx="4" ry="2" fill="#b6f3ef" opacity=".7" />
      <path d="M66-22h16v49H66" fill="#6c8491" stroke="#c4d3d4" />
      <circle cx="-45" cy="-45" r="3" fill="#ffedba" />
    </g>

    <g class="diagram-labels" font-family="inherit" font-size="16" fill="#c2d2dc">
      <g fill="none" stroke="#779aa9" stroke-width="1" opacity=".8">
        <path d="M200 278H120v-67H57" /><path d="M330 173V114h69" /><path d="M421 371v67H323" />
      </g>
      <g fill="#92d6dc"><circle cx="200" cy="278" r="3" /><circle cx="330" cy="173" r="3" /><circle cx="421" cy="371" r="3" /></g>
      <text x="57" y="196">太陽能板</text><text x="344" y="101">通訊天線</text><text x="323" y="462">觀測相機</text>
    </g>
    <!-- 只示意功能間的關係，不表示姿態或軌道工程模擬。 -->
    <g v-if="action === 'charge'" class="action-animation charge-animation" aria-hidden="true">
      <circle cx="132" cy="100" r="22" fill="#f0cf8c" fill-opacity=".2" stroke="#f0cf8c" stroke-width="3" />
      <path d="M132 65V55m0 90v-10M97 100H87m90 0h-10M107 75l-7-7m57 57 7 7m-57-7-7 7m57-57 7-7" stroke="#f0cf8c" stroke-width="3" />
      <path class="flow-line" d="m146 125 53 123m-23-130 42 116m-95-87 52 122" fill="none" stroke="#f0cf8c" stroke-width="4" stroke-dasharray="10 14" />
    </g>
    <g v-if="action === 'capture'" class="action-animation capture-animation" aria-hidden="true">
      <path d="m421 371 58 181 133-80Z" fill="#88d7dc" fill-opacity=".14" stroke="#88d7dc" stroke-opacity=".6" stroke-dasharray="6 9" />
      <circle class="camera-pulse" cx="421" cy="371" r="20" fill="none" stroke="#c6ffff" stroke-width="4" />
      <path d="M511 483h-14v14m62-29h14v14m-55 46h-14v-14m62 0v14h-14" fill="none" stroke="#a3eff0" stroke-width="3" />
    </g>
    <g v-if="action === 'transmit'" class="action-animation transmit-animation" aria-hidden="true">
      <path class="flow-line" d="M330 173Q563 173 591 470" fill="none" stroke="#88d7dc" stroke-width="4" stroke-dasharray="10 14" />
      <path d="m574 468 30 18a20 20 0 0 1-30-18Zm10 18-8 15m2-3h24" fill="none" stroke="#c6ffff" stroke-width="3" />
    </g>
    <g v-if="action === 'wait'" class="action-animation wait-animation" aria-hidden="true" fill="none" stroke="#a6bac8" stroke-width="3">
      <circle cx="568" cy="194" r="28" /><path d="M568 175v19l12 10" />
    </g>
    <g fill="none" stroke="#d9c48c" stroke-width="1.5" opacity=".8">
      <path d="M604 188v12m-6-6h12M211 96v8m-4-4h8" />
    </g>
  </svg>
</template>
