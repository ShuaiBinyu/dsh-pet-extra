import { ipcMain } from 'electron'
import { createSettingsWindow } from '../windows/settingWindow'
import store from '../utils/store' // 👈 引入你之前写的 electron-store

export function registerSettingIpc(): void {
  // 1. 打开设置窗口
  ipcMain.handle('open-settings-window', (): number => {
    console.log('=== 收到打开设置窗口请求 ===')
    const settingsWin = createSettingsWindow()
    return settingsWin.id
  })

  // 2. 保存配置 (接收 preload 传过来的 key, url, model)
  ipcMain.handle('save-config', (_, config: { key: string; url: string; model: string }) => {
    console.log('=== 收到保存配置请求 ===')
    if (!config) return false
    
    // 存入 electron-store
    store.set('deepseekApiKey', config.key)
    store.set('deepseekApiUrl', config.url)
    store.set('deepseekModel', config.model)
    
    return true
  })

  // 3. 读取配置
  ipcMain.handle('get-config', () => {
    return {
      key: store.get('deepseekApiKey'),
      url: store.get('deepseekApiUrl'),
      model: store.get('deepseekModel')
    }
  })
}