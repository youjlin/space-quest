<script setup lang="ts">
import UiIcon from './UiIcon.vue'
</script>

<template>
  <header class="site-header container">
    <RouterLink to="/" class="brand" aria-label="太空任務出發站，回首頁">
      <span class="brand-mark"><UiIcon name="orbit" /></span>
      <span>太空任務<span class="brand-second">出發站</span></span>
    </RouterLink>
    <nav class="main-nav" aria-label="主要導覽">
      <RouterLink to="/" exact-active-class="is-active">出發站</RouterLink>
      <RouterLink to="/missions" active-class="is-active">任務路線</RouterLink>
    </nav>
    <span class="header-note">保持好奇，向外探索</span>
  </header>
</template>
