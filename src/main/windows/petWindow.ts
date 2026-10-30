import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/dspet.png?asset'

export interface PetRect {
  x: number
  y: number
  width: number
  height: number
}

// 人物留白状态
export const petPadding = { left: 0, top: 0, right: 0, bottom: 0 }

// 取人物在屏幕上的实际矩形
export function getPetRect(win: BrowserWindow): PetRect {
  const [x, y] = win.getPosition()
  const [w, h] = win.getSize()
  return {
    x: x + petPadding.left,
    y: y + petPadding.top,
    width: w - petPadding.left - petPadding.right,
    height: h - petPadding.top - petPadding.bottom
  }
}

// 设置人物左上角位置（反推窗口坐标）
export function setPetPosition(win: BrowserWindow, petX: number, petY: number): void {
  if (!win || win.isDestroyed()) return

  // 如果 x 或 y 不是有效数字，就直接拦截，防止崩溃
  if (!Number.isFinite(petX) || !Number.isFinite(petY)) {
    console.warn('⚠️ 拦截到非法的坐标传输:', { petX, petY })
    return
  }
  win.setPosition(
    Math.round(petX - petPadding.left),
    Math.round(petY - petPadding.top)
  )
}

// 增量移动桌宠，边界钳制
export function movePetBy(win: BrowserWindow, deltaX: number, deltaY: number): void {
  const pet = getPetRect(win)
  const targetX = pet.x + deltaX
  const targetY = pet.y + deltaY

  const cx = targetX + pet.width / 2
  const cy = targetY + pet.height / 2
  const display = screen.getDisplayNearestPoint({ x: Math.round(cx), y: Math.round(cy) })
  const { x: areaX, y: areaY, width: areaW, height: areaH } = display.workArea

  const overflowX = pet.width / 2
  const overflowY = pet.height / 2

  const nextPetX = Math.max(
    areaX - overflowX,
    Math.min(areaX + areaW - pet.width + overflowX, Math.round(targetX))
  )
  const nextPetY = Math.max(
    areaY - overflowY,
    Math.min(areaY + areaH - pet.height + overflowY, Math.round(targetY))
  )

  setPetPosition(win, nextPetX, nextPetY)
}

// 创建桌宠主窗口
export function createPetWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 500,
    show: false,
    frame: false,
    title: 'DsPet',
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    autoHideMenuBar: true,
    enableLargerThanScreen: true,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    const primary = screen.getPrimaryDisplay().workArea
    const [w] = mainWindow.getSize()
    const petW = w - petPadding.left - petPadding.right
    const MARGIN = 20
    const petX = primary.x + primary.width - petW - MARGIN
    const petY = primary.y + MARGIN
    setPetPosition(mainWindow, petX, petY)
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    import('electron').then(({ shell }) => shell.openExternal(url))
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}
