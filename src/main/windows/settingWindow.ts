import { BrowserWindow } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

// 👇 1. 变量名改成 settingsWin
let settingsWin: BrowserWindow | null = null

// 👇 2. 函数名改成 createSettingsWindow
export function createSettingsWindow(): BrowserWindow {
  // 如果已经打开了，就聚焦，不要重复建
  if (settingsWin && !settingsWin.isDestroyed()) {
    settingsWin.focus()
    return settingsWin
  }

  // 👇 3. 创建窗口，尺寸和配置自己定
  settingsWin = new BrowserWindow({
    width: 800,           // 设置窗口宽一点
    height: 600,          // 高度适中
    frame: true, 
    transparent: false, 
    resizable: false,     // 设置窗口一般不让拉伸
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // 👇 4. 路由改成 #/settings
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    settingsWin.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/setting`)
  } else {
    settingsWin.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/setting' })
  }

  // 关闭时清空引用
  settingsWin.on('closed', () => {
    settingsWin = null
  })

  return settingsWin
}