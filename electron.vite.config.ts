import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite' // 👈 引入 externalizeDepsPlugin
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    // 👇 在主进程配置中加上这个插件
    plugins: [externalizeDepsPlugin()] 
  },
  preload: {
    // 👇 preload 也强烈建议加上，避免把三方库打包进去
    plugins: [externalizeDepsPlugin()] 
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue()]
  }
})