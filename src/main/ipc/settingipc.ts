import { ipcMain } from 'electron'
import { createSettingsWindow } from '../windows/settingWindow'
import store, { setSecureStore, getSecureStore } from '../utils/store'
// 👇 1. 引入缓存管理方法
import { cacheStats, clearCache } from '../services/tts/ttsCache'

// 注册设置、语音缓存和设置窗口相关 IPC。
export function registerSettingIpc(): void {
  // 1. 打开设置窗口
  ipcMain.handle('open-settings-window', (): number => {
    console.log('=== 收到打开设置窗口请求 ===')
    const settingsWin = createSettingsWindow()
    return settingsWin.id
  })

  // 2. 保存配置
  ipcMain.handle(
    'save-config',
    (
      _,
      config: {
        key: string;
        url: string;
        model: string;
        volcAppId: string;
        volcAccessToken: string;
        volcVoiceType: string;
      }
    ) => {
      console.log('=== 收到保存配置请求 ===')
      if (!config) return false

      // ========== 普通字段（直接存） ==========
      store.set('deepseekApiUrl', config.url)
      store.set('deepseekModel', config.model)
      store.set('volcAppId', config.volcAppId)
      store.set('volcVoiceType', config.volcVoiceType)

      // ========== 敏感字段（加密存） ==========
      if (config.key) {
        setSecureStore('deepseekApiKey', config.key)
      }
      if (config.volcAccessToken) {
        setSecureStore('volcAccessToken', config.volcAccessToken)
      }

      return true
    }
  )

  // 3. 读取配置（给设置界面回显用）
  ipcMain.handle('get-config', () => {
    return {
      key: getSecureStore('deepseekApiKey'),
      url: store.get('deepseekApiUrl'),
      model: store.get('deepseekModel'),
      volcAppId: store.get('volcAppId'),
      volcAccessToken: getSecureStore('volcAccessToken'),
      volcVoiceType: store.get('volcVoiceType')
    }
  })

  // 👇 4. 新增：获取缓存统计信息（给前端展示）
  ipcMain.handle('get-cache-stats', () => {
    return cacheStats()
  })

  // 👇 5. 新增：清空缓存
  ipcMain.handle('clear-cache', () => {
    clearCache()
    return true
  })
}
