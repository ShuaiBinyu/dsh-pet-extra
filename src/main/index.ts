import { app, BrowserWindow, globalShortcut } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createPetWindow } from './windows/petWindow'
import { createChatWindow, setAppQuitting, getChatWindow } from './windows/chatWindow' // 👈 2. 引入聊天窗口的创建函数
import { registerPetIpc } from './ipc/petipc'
import { registerChatIpc } from './ipc/chatipc'
import { registerSettingIpc } from './ipc/settingipc' // 👈 引入
import { registerSystemIpc, unregisterSystemIpc } from './ipc/systemIpc' // 👈 引入
import { systemStateService } from './services/systemStateService' // 👈 引入系统状态服务

// 设置用户名，这是用户数据目录的挂载基础，这里初始化后，在后续的加载才能保证各种本地数据正常
app.setName('DsPet')
// 启动总闸，基础环境初始化
app.whenReady().then(() => {
  // ✅ macOS 专属：隐藏程序坞图标
  if (process.platform === 'darwin') {
    app.dock?.hide()
  }
  // windows 专属：设置应用程序的用户模型 ID，这对于通知和任务栏图标的正确显示很重要
  // 与 electron-builder.yml 的 appId 保持一致
  electronApp.setAppUserModelId('com.shuaibinyu.dspet')
  // 开发者脚手架，F12打开开发者工具，主要是代码调试使用
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 1. 统一注册所有IPC-接通管道（订阅广播 + 注册handle ）
  registerSystemIpc()
  registerPetIpc()
  registerChatIpc()
  registerSettingIpc() // 👈 调用

  // 2. 创建桌宠窗口，建终点（窗口是事件转发的目标）
  createPetWindow()

  // 3. 启动系统状态监控服务，打开阀门（管道和终点准备就绪）
  systemStateService.start()

  // 4. 注册全剧快捷键--旁路，不参与数据流。放最后
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
  // - mac专属补充
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createPetWindow()
    }
  })
})

// 在应用开始关闭窗口之前，告诉 chatWindow 别拦着
app.on('before-quit', () => {
  setAppQuitting(true)
})
// 在应用退出前，关闭相应的资源
app.on('will-quit', () => {
  // 先停数据源，关闭电脑状态的轮询，避免在退出时还在发射事件
  systemStateService.stop()
  // 注销system的IPC管道
  unregisterSystemIpc()
  // 注销快捷键
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
