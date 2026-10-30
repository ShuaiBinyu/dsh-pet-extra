
import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    petApi: {
      petDrag: (deltaX: number, deltaY: number) => void
      petSetPadding: (padding: { left: number; top: number; right: number; bottom: number }) => void
      openChatWindow: () => Promise<number>
      clearHistory: () => Promise<boolean>
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
      getHistory: () => Promise<{ role: string; content: string }[]>
      destroyWindow: () => void
    }
    settingApi: {
      openSettingsWindow: () => Promise<number>
      saveConfig: (config: { key: string; url: string; model: string }) => Promise<boolean>
      getConfig: () => Promise<{ key: string; url: string; model: string }>
    }
  }
}
