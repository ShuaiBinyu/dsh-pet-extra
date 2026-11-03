import { ipcMain, BrowserWindow } from 'electron'
import { systemStateService, SystemState } from '../services/systemStateService'

export const IPC_CHANNEL_PUSH = 'system-state-push'
export const IPC_CHANNEL_GET = 'system-state-get'
// 订阅广播：当系统状态发生变化时，向所有窗口广播最新状态
function onStateChange(state: SystemState): void {
  BrowserWindow.getAllWindows().forEach((win) => {
    if (!win.isDestroyed()) {
      win.webContents.send(IPC_CHANNEL_PUSH, state)
    }
  })
}
/** 注册 IPC：订阅广播 + 注册拉取接口 */
export function registerSystemIpc(): void {
  systemStateService.on('state-change', onStateChange)
  ipcMain.handle(IPC_CHANNEL_GET, () => {
    return systemStateService.getState()
  })
}
/** 注销 IPC：退订广播 + 移除拉取接口 */
export function unregisterSystemIpc(): void {
  systemStateService.off('state-change', onStateChange)
  ipcMain.removeHandler(IPC_CHANNEL_GET)
}
