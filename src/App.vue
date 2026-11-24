<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import UiIcon from './components/UiIcon.vue'

const route = useRoute()
const main = ref<HTMLElement | null>(null)

// 切換頁面後讓鍵盤與螢幕閱讀器從主要內容繼續。
watch(() => route.path, async () => {
  await nextTick()
  main.value?.focus({ preventScroll: true })
})
</script>

<template>
  <a class="skip-link" href="#main-content" @click.prevent="main?.focus()">跳至主要內容</a>
  <div class="app-shell" :class="{ 'uses-layout': route.name === 'satellite-uses' || route.name === 'satellite-preparation', 'mission-layout': route.name === 'mission' }">
    <SiteHeader />
    <main id="main-content" ref="main" tabindex="-1">
      <RouterView />
    </main>
    <footer class="site-footer container">
      <span class="footer-signature"><UiIcon name="orbit" /> 好奇心，就是你的發射燃料。</span>
      <span>太空任務出發站<span class="footer-divider">／</span>探索，從這裡開始</span>
    </footer>
  </div>
</template>
