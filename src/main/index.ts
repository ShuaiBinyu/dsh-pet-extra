import { app, BrowserWindow, globalShortcut } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createPetWindow } from './windows/petWindow'
import { createChatWindow, setAppQuitting, getChatWindow } from './windows/chatWindow' // 👈 2. 引入聊天窗口的创建函数
import { registerPetIpc } from './ipc/petipc'
import { registerChatIpc } from './ipc/chatipc'
import { registerSettingIpc } from './ipc/settingipc' // 👈 引入

app.setName('DsPet')

app.whenReady().then(() => {
    // ✅ macOS 专属：隐藏程序坞图标
  if (process.platform === 'darwin') {
    app.dock?.hide() // 👈 注意这里的问号
  }

  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 统一注册所有IPC
  registerPetIpc()
  registerChatIpc()
  registerSettingIpc() // 👈 调用

  // 创建桌宠窗口
  createPetWindow()

  // ✅ 核心逻辑：快捷键开关
  const ret = globalShortcut.register('CommandOrControl+Shift+C', () => {
    const chatWin = getChatWindow()

    // 如果窗口存在、没被销毁、且当前可见 -> 隐藏它
    if (chatWin && !chatWin.isDestroyed() && chatWin.isVisible()) {
      chatWin.hide()
    } else {
      // 否则，创建或显示它
      createChatWindow()
    }
  })

  if (!ret) {
    console.error('快捷键注册失败，可能被其他应用占用')
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createPetWindow()
    }
  })
})

// ✅ 1. 在应用开始关闭窗口之前，告诉 chatWindow 别拦着
app.on('before-quit', () => {
  setAppQuitting(true)
})
// ==========================================
// ✅ 4. 应用退出前注销快捷键
// ==========================================
app.on('will-quit', () => {
  // 必须注销，否则在开发模式下热更新会导致快捷键冲突报错
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
