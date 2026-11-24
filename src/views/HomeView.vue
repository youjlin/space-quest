<script setup lang="ts">
import SatelliteIllustration from '../components/SatelliteIllustration.vue'
import UiIcon from '../components/UiIcon.vue'
import { missions } from '../data/missions'
</script>

<template>
  <div class="home-view">
    <section class="hero container" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow"><span class="small-cross" aria-hidden="true"></span> 給每一位對宇宙好奇的你</p>
        <h1 id="home-title">你的第一場<br /><span>太空任務。</span></h1>
        <p class="hero-description">衛星不只在太空，也藏在你的日常裡。<br class="desktop-break" />從認識衛星到指揮任務，準備好出發了嗎？</p>
        <RouterLink to="/missions" class="button button-primary hero-cta">開始任務 <UiIcon name="orbit" /></RouterLink>
        <p class="hero-footnote">三個關卡，從生活一路探索到太空。</p>
      </div>
      <figure class="hero-visual">
        <div class="visual-coordinate"><span class="coordinate-line"></span> 觀測地球，連結日常</div>
        <SatelliteIllustration />
        <figcaption>衛星示意圖<span>部件比例經簡化</span></figcaption>
      </figure>
      <div class="hero-bottom-note"><span aria-hidden="true">＋</span> 不必是太空專家，帶著好奇心就能出發。</div>
    </section>

    <section class="journey-section container" aria-labelledby="journey-title">
      <div class="section-intro">
        <div><p class="eyebrow">你的探索路線</p><h2 id="journey-title">從「為什麼」到「我來試試」。</h2></div>
        <RouterLink to="/missions" class="text-link">查看任務路線</RouterLink>
      </div>
      <ol class="journey-overview">
        <li v-for="mission in missions" :key="mission.id">
          <div class="journey-node"><span>第 {{ mission.id }} 站</span><UiIcon :name="mission.icon" /></div>
          <h3>{{ mission.title }}</h3>
          <p>{{ mission.id === 1 ? '發現衛星與日常生活的連結。' : mission.id === 2 ? '認識一場任務需要的衛星功能。' : '練習在限制中安排任務行動。' }}</p>
        </li>
      </ol>
      <p class="development-note"><UiIcon name="info" /> 三個關卡都已開放，可以依序探索，也可以自由試玩。</p>
    </section>
  </div>
</template>
