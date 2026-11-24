import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import MissionRouteView from './views/MissionRouteView.vue'
import MissionView from './views/MissionView.vue'
import UsesQuizView from './views/UsesQuizView.vue'
import PreparationView from './views/PreparationView.vue'

// Hash 路由可直接在靜態主機重新整理，不需要後端處理網址。
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: '太空任務出發站' } },
    { path: '/missions', name: 'missions', component: MissionRouteView, meta: { title: '任務路線' } },
    { path: '/missions/1', name: 'satellite-uses', component: UsesQuizView, meta: { title: '這件事，可以請衛星幫忙嗎？' } },
    { path: '/missions/2', name: 'satellite-preparation', component: PreparationView, meta: { title: '幫衛星準備出任務' } },
    { path: '/missions/3', name: 'mission', component: MissionView, meta: { title: '執行衛星任務' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : '太空任務出發站'
  document.title = to.name === 'home' ? title : `${title} — 太空任務出發站`
})
