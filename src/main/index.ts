import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// 👇 强制设置应用名称（影响 Mac 顶部菜单栏）
app.setName('DsPet')

// 创建桌宠窗口
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 500,
    show: false,
    frame: false,
    title: 'DsPet', // 👈 加这一行（如果有的话就检查一下）
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    autoHideMenuBar: true,
// 解决mac中起始y坐标状态（原始状态不为0，菜单栏）
    enableLargerThanScreen: true,

    ...(process.platform === 'linux' ? { icon } : {}),

    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {

    // 按人物居中设置起始位置（用 workArea，排除任务栏/菜单栏）
    const primary = screen.getPrimaryDisplay().workArea
    const [w] = mainWindow.getSize()

    const petW = w - petPadding.left - petPadding.right

     // 右上角留白（px），人物不贴死边缘
    const MARGIN = 20

    // 人物右上角对齐屏幕右上角
    const petX = primary.x + primary.width - petW - MARGIN
    const petY = primary.y + MARGIN

    setPetPosition(mainWindow, petX, petY)

    mainWindow.show()
  })

  // 外部链接使用系统默认浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // 开发环境加载 Vite 地址，生产环境加载打包后的页面
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Electron 初始化完成后执行
app.whenReady().then(() => {
  // 设置应用标识
  electronApp.setAppUserModelId('com.electron')

  // 开发环境快捷键优化
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('pet-set-padding', (_, padding) => {
    if (!padding) return
    petPadding = {
      left: Math.max(0, Number(padding.left) || 0),
      top: Math.max(0, Number(padding.top) || 0),
      right: Math.max(0, Number(padding.right) || 0),
      bottom: Math.max(0, Number(padding.bottom) || 0),
    }
  })

  // 按增量移动人物：先按目标位置定屏，再在该屏 workArea 内钳制，避免多屏空隙丢失
  function movePetBy(win: BrowserWindow, deltaX: number, deltaY: number) {
    const pet = getPetRect(win)

    // 目标位置（移动后的人物左上角）
    const targetX = pet.x + deltaX
    const targetY = pet.y + deltaY

    // 用目标位置的“人物中心点”找所在屏（空隙中的点会落到最近的屏）
    const cx = targetX + pet.width / 2
    const cy = targetY + pet.height / 2
    const display = screen.getDisplayNearestPoint({ x: Math.round(cx), y: Math.round(cy) })
    const { x: areaX, y: areaY, width: areaW, height: areaH } = display.workArea

    // 允许人物出去一半
    const overflowX = pet.width / 2
    const overflowY = pet.height / 2

    // 在该屏内钳制
    const nextPetX = Math.max(
      areaX - overflowX,
      Math.min(areaX + areaW - pet.width + overflowX, Math.round(targetX)),
    )
    const nextPetY = Math.max(
      areaY - overflowY,
      Math.min(areaY + areaH - pet.height + overflowY, Math.round(targetY)),
    )

    setPetPosition(win, nextPetX, nextPetY)
  }

  // 接收渲染进程发送的拖动位移
  ipcMain.on('pet-drag', (event, deltaX: number, deltaY: number) => {
    const win = BrowserWindow.fromWebContents(event.sender)

    if (!win || win.isDestroyed()) return
    if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) return

    movePetBy(win, deltaX, deltaY)
  })

  createWindow()

  app.on('activate', () => {
    // macOS 上点击 Dock 图标时，如果没有窗口则重新创建
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Windows 和 Linux 关闭所有窗口时退出应用；macOS 保留应用运行
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 人物在窗口内的四边留白，由渲染进程实测后上报
let petPadding = { left: 0, top: 0, right: 0, bottom: 0 }

  // 取人物在屏幕上的实际矩形（人物左上角 + 宽高）
  function getPetRect(win: BrowserWindow) {
    const [x, y] = win.getPosition()
    const [w, h] = win.getSize()
    return {
      x: x + petPadding.left,
      y: y + petPadding.top,
      width: w - petPadding.left - petPadding.right,
      height: h - petPadding.top - petPadding.bottom,
    }
  }

  // 按人物左上角位置设置窗口位置（反推窗口坐标）
  function setPetPosition(win: BrowserWindow, petX: number, petY: number) {
    win.setPosition(
      Math.round(petX - petPadding.left),
      Math.round(petY - petPadding.top),
    )
  }