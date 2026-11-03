import { app, ipcMain, BrowserWindow } from 'electron'
import { petPadding, movePetBy } from '../windows/petWindow'
import { generateVoice } from '../services/tts'

// ✅ 保留这个状态标记，用于在退出瞬间拦截还在发过来的拖拽请求
let isAppQuitting = false

export function registerPetIpc(): void {
  ipcMain.on('pet-set-padding', (_, padding) => {
    if (!padding) return
    petPadding.left = Math.max(0, Number(padding.left) || 0)
    petPadding.top = Math.max(0, Number(padding.top) || 0)
    petPadding.right = Math.max(0, Number(padding.right) || 0)
    petPadding.bottom = Math.max(0, Number(padding.bottom) || 0)
  })

  // ✅ 处理鼠标穿透
  ipcMain.on(
    'set-ignore-mouse-events',
    (event, ignore: boolean, options?: { forward?: boolean }) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (win && !win.isDestroyed()) {
        win.setIgnoreMouseEvents(ignore, options)
      }
    }
  )

    ipcMain.handle('generate-pet-voice', (_, text: string) => {
    // 简单的入参拦截：如果是空文本，直接拒绝，不发请求
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return { success: false }
    }
    return generateVoice(text)
  })

  // 处理拖拽
  ipcMain.on('pet-drag', (event, deltaX: number, deltaY: number) => {
    // ✅ 如果正在退出，直接忽略所有的拖拽请求
    if (isAppQuitting) return

    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win || win.isDestroyed()) return
    if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) return
    movePetBy(win, deltaX, deltaY)
  })

  // ✅ 接收退出指令（优雅版）
  ipcMain.on('quit-app', () => {
    console.log('🔥 收到退出指令，开始优雅退出流程')
    isAppQuitting = true
    app.quit()
  })
}
