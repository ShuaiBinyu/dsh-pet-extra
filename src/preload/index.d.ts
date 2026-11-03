import { ElectronAPI } from '@electron-toolkit/preload'
import { ElectronSystemAPI, SettingConfig, ChatMessage } from './index'
declare global {
  interface Window {
    electron: ElectronAPI
    electronSystem: ElectronSystemAPI
    petApi: {
      petDrag: (deltaX: number, deltaY: number) => void
      petSetPadding: (padding: { left: number; top: number; right: number; bottom: number }) => void
      // 桌宠语音包
      generateVoice: (text: string) => Promise<{ success: boolean; audioBase64?: string }>
      // 👇 新增这一行（对应 preload 里的 setIgnoreMouseEvents）
      setIgnoreMouseEvents: (ignore: boolean, options?: { forward?: boolean }) => void
      // ✅ 新增这行
      quitApp: () => void
    }
    chatApi: {
      openChatWindow: () => Promise<number>
      // 👇 补充这个方法
      sendMessage: (message: string) => Promise<{ success: boolean; content?: string; error?: string }>
      // 👇 加上这一行！
      clearHistory: () => Promise<boolean>
      getHistory: () => Promise<ChatMessage[]>
      destroyWindow: () => void
    }
    settingApi: {
      openSettingsWindow: () => Promise<number>

      saveConfig: (config: SettingConfig) => Promise<boolean>

      getConfig: () => Promise<SettingConfig>

      // 👇 新增：补齐缓存管理的类型声明
      getCacheStats: () => Promise<{ count: number; sizeBytes: number }>

      clearCache: () => Promise<boolean>
    }
  }
}
