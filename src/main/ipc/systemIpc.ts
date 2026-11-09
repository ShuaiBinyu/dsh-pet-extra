import { ipcMain, BrowserWindow } from 'electron'
import { systemStateService, SystemState } from '../services/systemStateService'

export const IPC_CHANNEL_PUSH = 'system-state-push'
export const IPC_CHANNEL_GET = 'system-state-get'
// 订阅广播：当系统状态发生变化时，向所有窗口广播最新状态
// 将系统状态变化广播给所有仍然有效的 BrowserWindow。
function onStateChange(state: SystemState): void {
  BrowserWindow.getAllWindows().forEach((win) => {
    if (!win.isDestroyed()) {
      win.webContents.send(IPC_CHANNEL_PUSH, state)
    }
  })
}
/** 注册 IPC：订阅广播 + 注册拉取接口 */
// 注册系统状态事件转发和主动查询 IPC。
export function registerSystemIpc(): void {
  systemStateService.on('state-change', onStateChange)
  ipcMain.handle(IPC_CHANNEL_GET, () => {
    return systemStateService.getState()
  })
}
/** 注销 IPC：退订广播 + 移除拉取接口 */
// 移除系统状态监听和查询处理器，避免重复注册或资源泄漏。
export function unregisterSystemIpc(): void {
  systemStateService.off('state-change', onStateChange)
  ipcMain.removeHandler(IPC_CHANNEL_GET)
}
