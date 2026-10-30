import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let chatWin: BrowserWindow | null = null
// ✅ 1. 在模块内部维护一个状态变量
let isQuitting = false
// ✅ 2. 暴露一个方法，让主进程在真正退出时调用
export function setAppQuitting(value: boolean): void {
  isQuitting = value
}
// ✅ 增加这个函数，让 index.ts 能拿到窗口状态
export function getChatWindow(): BrowserWindow | null {
  return chatWin
}
// ✅ 新增：彻底关闭聊天窗口（强杀，不隐藏）
export function destroyChatWindow(): void {
  if (chatWin && !chatWin.isDestroyed()) {
    // 直接移除 close 拦截（或者直接 destroy 无视它）
    chatWin.destroy()
    chatWin = null
  }
}
// 创建窗口
export function createChatWindow(): BrowserWindow {
  // 如果已经打开了，就聚焦，不要重复建
  if (chatWin && !chatWin.isDestroyed()) {
    chatWin.show()   // ✅ 核心：显示被隐藏的窗口
    chatWin.focus()
    return chatWin
  }

  chatWin = new BrowserWindow({
    width: 400,  // 稍微窄一点，更像漫画气泡
    height: 600,
    frame: false,       // 👈 去掉原生标题栏
    transparent: true,  // 👈 开启透明背景
    resizable: false,
    skipTaskbar: false,
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // 根据你的环境加载路由
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    chatWin.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/chat`)
  } else {
    chatWin.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/chat' })
  }
    // ✅ 核心改造：拦截关闭事件，改为隐藏
  chatWin.on('close', (event) => {
    // 如果应用没有在真正退出的状态
    if (!isQuitting) {
      event.preventDefault() // 阻止默认的关闭行为
      chatWin?.hide()        // 仅仅隐藏窗口
    }
  })

  // 关闭时清空引用
  chatWin.on('closed', () => {
    chatWin = null
  })

  return chatWin
}
