<script setup lang="ts">
import SatelliteIllustration from '../components/SatelliteIllustration.vue'
import UiIcon from '../components/UiIcon.vue'
</script>

<template>
  <section class="station-home container" aria-labelledby="home-title">
    <div class="station-copy">
      <p class="eyebrow">給每一位對宇宙好奇的你</p>
      <h1 id="home-title">你的第一場<br /><span>太空任務。</span></h1>
      <p class="station-intro">衛星不只在太空，也藏在你的日常裡。<br />從認識衛星到指揮任務，準備好出發了嗎？</p>
      <RouterLink to="/missions" class="button button-primary">開始任務 <UiIcon name="orbit" /></RouterLink>
      <p class="station-footnote">三個關卡，從生活一路探索到太空。</p>
    </div>
    <figure class="station-visual"><SatelliteIllustration /><figcaption>衛星示意圖 · 部件比例經簡化</figcaption></figure>
  </section>
</template>
