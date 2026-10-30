import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const petApi = {
  petDrag: (deltaX: number, deltaY: number): void => {
    ipcRenderer.send('pet-drag', deltaX, deltaY)
  },
  // 上报人物在窗口内的四边留白，供主进程按“人物区域”钳制窗口位置
  petSetPadding: (padding: { left: number; top: number; right: number; bottom: number }): void => {
    ipcRenderer.send('pet-set-padding', padding)
  },
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
  getHistory: (): Promise<{ role: string; content: string }[]> =>
    ipcRenderer.invoke('get-chat-history'),
  // chatApi 里面
  destroyWindow: (): void => {
    ipcRenderer.send('destroy-chat-window')
}
}
// 配置相关接口
const settingApi = {
  openSettingsWindow: (): Promise<number> => ipcRenderer.invoke('open-settings-window'),
  // 保存配置（增加 model 参数，对应 DeepSeek）
  saveConfig: (config: { key: string; url: string; model: string }): Promise<boolean> =>
    ipcRenderer.invoke('save-config', config),

  // 读取配置
  getConfig: (): Promise<{ key: string; url: string; model: string }> =>
    ipcRenderer.invoke('get-config')

}
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('petApi', petApi)
    contextBridge.exposeInMainWorld('chatApi', chatApi)
    contextBridge.exposeInMainWorld('settingApi', settingApi)
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
}
