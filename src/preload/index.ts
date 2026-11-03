import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export interface SettingConfig {
  key: string;
  url: string;
  model: string;
  volcAppId: string;
  volcAccessToken: string;
  volcVoiceType: string;
}
export interface ChatMessage {
  role: string;
  content: string;
}
export interface ElectronSystemAPI {
  /** 主动拉取当前系统状态 */
  getState: () => Promise<{ isIdle: boolean }>
  /** 订阅状态变化，返回取消订阅函数 */
  onStateChange: (callback: (state: { isIdle: boolean }) => void) => () => void
}
const systemAPI: ElectronSystemAPI = {
  getState: () => ipcRenderer.invoke('system-state-get'),

  onStateChange: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, state: { isIdle: boolean }): void => {
      callback(state)
    }
    ipcRenderer.on('system-state-push', listener)

    // 返回清理函数：组件卸载时调用，防止内存泄漏
    return () => {
      ipcRenderer.removeListener('system-state-push', listener)
    }
  }
}

contextBridge.exposeInMainWorld('electronSystem', systemAPI)
const petApi = {
  petDrag: (deltaX: number, deltaY: number): void => {
    ipcRenderer.send('pet-drag', deltaX, deltaY)
  },
  // 上报人物在窗口内的四边留白，供主进程按“人物区域”钳制窗口位置
  petSetPadding: (padding: { left: number; top: number; right: number; bottom: number }): void => {
    ipcRenderer.send('pet-set-padding', padding)
  },
  // 桌宠语音包
  generateVoice: (text: string): Promise<{ success: boolean; audioBase64?: string }> =>
    ipcRenderer.invoke('generate-pet-voice', text),
  // ✅ 新增：控制窗口鼠标穿透
  setIgnoreMouseEvents: (ignore: boolean, options?: { forward?: boolean }): void => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options)
  },
    // ✅ 新增：暴露退出方法给渲染进程
  quitApp: (): void => {
    ipcRenderer.send('quit-app')
  }

}
// 聊天相关接口
const chatApi = {
  openChatWindow: (): Promise<number> => ipcRenderer.invoke('open-chat-window'),
  // 👇 新增这个方法
  sendMessage: (message: string): Promise<{ success: boolean; content?: string; error?: string }> =>
    ipcRenderer.invoke('send-message', message),
  // 👇 补上这个
  clearHistory: (): Promise<boolean> => ipcRenderer.invoke('clear-chat-history'),
  // 👇 加上这个读取接口
  getHistory: (): Promise<ChatMessage[]> =>
    ipcRenderer.invoke('get-chat-history'),
  // chatApi 里面
  destroyWindow: (): void => {
    ipcRenderer.send('destroy-chat-window')
}
}
// 配置相关接口
const settingApi = {
  openSettingsWindow: (): Promise<number> => ipcRenderer.invoke('open-settings-window'),

  // 保存配置
  saveConfig: (config: SettingConfig): Promise<boolean> => ipcRenderer.invoke('save-config', config),

  // 读取配置（补全火山字段的类型定义）
  getConfig: (): Promise<SettingConfig> => ipcRenderer.invoke('get-config'),

  // 👇 新增：获取缓存统计信息（返回条数和占用大小）
  getCacheStats: (): Promise<{ count: number; sizeBytes: number }> =>
    ipcRenderer.invoke('get-cache-stats'),

  // 👇 新增：清空语音缓存
  clearCache: (): Promise<boolean> =>
    ipcRenderer.invoke('clear-cache')

}
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('petApi', petApi)
    contextBridge.exposeInMainWorld('chatApi', chatApi)
    contextBridge.exposeInMainWorld('settingApi', settingApi)
    contextBridge.exposeInMainWorld('electronSystem', systemAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore 忽略错误
  window.electron = electronAPI
  // @ts-ignore 忽略错误
  window.petApi = petApi
  // @ts-ignore 忽略错误
  window.chatApi = chatApi
  // @ts-ignore 忽略错误
  window.settingApi = settingApi
  // @ts-ignore 忽略错误
  window.systemAPI = systemAPI
}
