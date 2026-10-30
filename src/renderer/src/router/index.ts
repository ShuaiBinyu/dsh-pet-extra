// src/renderer/src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
import Pet from '../components/Pet.vue' // 你的桌宠主界面

const router = createRouter({
  // 必须用 Hash 模式，因为 Electron 打包后是 file:// 协议
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Pet',
      component: Pet
    },
    {
      path: '/chat',
      name: 'Chat',
      component: () => import('../views/Chat.vue')
    },
    {
      path: '/setting',
      name: 'Setting',
      component: () => import('../views/Setting.vue')
    }
  ]
})

export default router