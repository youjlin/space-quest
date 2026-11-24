<script setup lang="ts">
import type { SituationScene } from '../data/satelliteUses'

defineProps<{ scene: SituationScene; description: string }>()
const signalSatellites = [{ x: 88, y: 35 }, { x: 195, y: 24 }, { x: 307, y: 24 }, { x: 414, y: 35 }]
</script>

<template>
  <svg class="situation-illustration" viewBox="0 0 500 220" role="img" :aria-label="description">
    <g v-if="scene === 'storm'">
      <path d="M35 203Q250 83 465 203" fill="#173f54" stroke="#427689" stroke-width="2" />
      <g fill="none" stroke="#c2dce0" stroke-linecap="round"><path d="M238 135c-48-34-92 28-38 50 51 20 106-39 54-73-33-22-83-14-112 12" stroke-width="10" opacity=".85" /><path d="M250 143c-20-11-37 14-17 23 24 10 44-13 28-30m-83 56c55 29 125-5 133-44m-132-44c53-32 118-17 140 26" stroke-width="6" opacity=".6" /></g>
      <g transform="translate(349 45) rotate(18)"><path d="M-63 0H63" stroke="#a1c2d0" stroke-width="4" /><g fill="#285d77" stroke="#85c4d2"><rect x="-62" y="-14" width="39" height="28" /><rect x="23" y="-14" width="39" height="28" /></g><rect x="-20" y="-21" width="40" height="42" rx="3" fill="#d0b476" /><circle cy="26" r="7" fill="#143548" stroke="#8bd4d8" stroke-width="2" /></g>
      <path d="m337 76-58 43m77-37-41 49" stroke="#83d1d6" stroke-dasharray="5 7" opacity=".7" />
    </g>
    <g v-else-if="scene === 'village' || scene === 'ship'">
      <path v-if="scene === 'village'" d="m26 176 70-101 64 101 72-67 65 67Z" fill="#193e4f" stroke="#376573" />
      <g v-else fill="none" stroke="#417c91" stroke-width="2"><path d="M25 180q22-15 44 0t44 0t44 0t44 0t44 0t44 0t44 0t44 0t44 0t44 0M25 203q22-15 44 0t44 0t44 0t44 0t44 0t44 0t44 0t44 0t44 0t44 0" /></g>
      <g v-if="scene === 'village'"><path d="m53 157 29-24 29 24m-48-7v39h38v-39" fill="#577f89" stroke="#b6d5d6" stroke-width="2" /><path d="M77 189v-23h11v23m36-29 22-18 22 18m-37-5v34h30v-34" fill="#284f62" stroke="#9bbec8" stroke-width="2" /></g>
      <g v-else><path d="m65 155 39 35h102l34-35Z" fill="#527d8c" stroke="#a2c8d2" stroke-width="2" /><path d="M96 155v-27h90v27m-66-27v-18h42v18" fill="#254b62" stroke="#9bbdca" stroke-width="2" /><path d="M110 139h13m11 0h13m11 0h13" stroke="#e0c281" stroke-width="5" /></g>
      <g transform="translate(250 42)"><path d="M-53 0H53" stroke="#a0bfca" stroke-width="3" /><g fill="#2c607b" stroke="#8dc2d0"><rect x="-52" y="-13" width="29" height="26" /><rect x="23" y="-13" width="29" height="26" /></g><rect x="-18" y="-19" width="36" height="38" rx="3" fill="#d0b476" /></g>
      <g fill="none" stroke="#8cd2d7" stroke-width="2"><path d="M150 128Q158 61 227 48m48 0q67 20 92 93" stroke-dasharray="5 7" /><path d="m138 124 24 13a17 17 0 0 1-24-13Zm9 14-6 14m-6 0h25m201-9 25 12a17 17 0 0 1-25-12Zm9 14-4 13m-7 0h24" /></g>
      <path d="M356 188v-18h33v18m5 0v-37h40v37m-5-31h-28" fill="#234b5b" stroke="#80aeba" stroke-width="2" />
      <path d="M365 76h60v36h-29l-13 11v-11h-18Z" fill="#173e50" stroke="#a4d9d9" stroke-width="2" /><path d="M378 88h33m-33 11h24" stroke="#d9c285" stroke-width="3" />
    </g>
    <g v-else-if="scene === 'phone' || scene === 'hiker'">
      <path v-if="scene === 'hiker'" d="m18 199 82-105 66 80 72-107 87 112 56-72 102 92Z" fill="#204552" stroke="#427183" stroke-width="2" />
      <g v-for="satellite in signalSatellites" :key="satellite.x" :transform="`translate(${satellite.x} ${satellite.y})`"><path d="M-23 0h46" stroke="#9abfce" stroke-width="2" /><g fill="#285d78" stroke="#7bbdcd"><rect x="-23" y="-8" width="15" height="16" /><rect x="8" y="-8" width="15" height="16" /></g><rect x="-7" y="-10" width="14" height="20" fill="#d0b476" /></g>
      <g stroke="#89cbd0" stroke-width="1.5" stroke-dasharray="4 7" opacity=".7"><path v-for="satellite in signalSatellites" :key="satellite.x" :d="`M${satellite.x} ${satellite.y + 14}L${scene === 'phone' ? 250 : 285} ${scene === 'phone' ? 118 : 132}`" /></g>
      <g v-if="scene === 'hiker'" stroke="#bcd9df" stroke-width="4" stroke-linecap="round"><circle cx="248" cy="130" r="10" fill="#ddc18b" stroke="none" /><path d="m247 144-4 30-15 26m16-26 14 26m-11-50 25 8 11-15" fill="none" /><path d="m235 146-10 6v23h13" fill="#336576" stroke-width="3" /><rect x="278" y="126" width="15" height="26" rx="2" fill="#173449" stroke="#9ed5d8" stroke-width="2" /></g>
      <g v-else><rect x="215" y="104" width="70" height="103" rx="9" fill="#19394b" stroke="#b6d8dd" stroke-width="3" /><rect x="224" y="117" width="52" height="74" rx="3" fill="#285766" /><path d="m224 163 52-30m-52 4 52 35M240 117l13 74" stroke="#688e96" stroke-width="2" /><path d="M250 140c-17 0-16 21 0 34 16-13 17-34 0-34Z" fill="#edce8d" /><circle cx="250" cy="151" r="4" fill="#17394a" /></g>
    </g>
    <g v-else-if="scene === 'forest'">
      <g v-for="(frame, index) in [0, 1]" :key="frame" :transform="`translate(${index * 235 + 24} 25)`"><rect width="216" height="167" rx="5" fill="#173e42" stroke="#628c8d" stroke-width="2" /><path d="M6 143q30-38 58-15t58-8 80 2" stroke="#4e8089" stroke-width="12" fill="none" /><g v-for="(tree, treeIndex) in (index === 0 ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [0, 1, 2, 4, 5])" :key="tree" :transform="`translate(${32 + (tree % 3) * 65} ${37 + Math.floor(tree / 3) * 39})`"><path d="m0-19-16 29h32Z" :fill="treeIndex % 2 ? '#5b968b' : '#79ac97'" /><path d="M0 9v9" stroke="#acc8ae" stroke-width="3" /></g><path v-if="index === 1" d="m18 119 52-6 9 33-61 6Z" fill="#a9986d" opacity=".65" /></g>
      <g fill="#b2cbd4" font-size="20" font-family="inherit" text-anchor="middle"><text x="132" y="215">較早日期</text><text x="367" y="215">較晚日期</text></g>
    </g>
  </svg>
</template>
