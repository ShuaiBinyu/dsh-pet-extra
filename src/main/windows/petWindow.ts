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
export const petPadding = { left: 0, top: 0, right: 0, bottom: 0 }
// 1. 取人物在屏幕上的实际矩形（加上防御）
export function getPetRect(win: BrowserWindow): PetRect | null {
  if (!win || win.isDestroyed()) return null

  const [x, y] = win.getPosition()
  const [w, h] = win.getSize()

  // 防御：如果获取到的窗口坐标不合法，直接返回 null
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null

  // 防御：确保 padding 都是合法数字
  const safeLeft = Number.isFinite(petPadding.left) ? petPadding.left : 0
  const safeTop = Number.isFinite(petPadding.top) ? petPadding.top : 0
  const safeRight = Number.isFinite(petPadding.right) ? petPadding.right : 0
  const safeBottom = Number.isFinite(petPadding.bottom) ? petPadding.bottom : 0

  return {
    x: x + safeLeft,
    y: y + safeTop,
    width: w - safeLeft - safeRight,
    height: h - safeTop - safeBottom
  }
}

// 2. 设置人物左上角位置（终极防御）
export function setPetPosition(win: BrowserWindow, petX: number, petY: number): void {
  if (!win || win.isDestroyed()) return

  if (!Number.isFinite(petX) || !Number.isFinite(petY)) {
    console.warn('⚠️ 拦截到非法的坐标传输:', { petX, petY })
    return
  }

  const safeLeft = Number.isFinite(petPadding.left) ? petPadding.left : 0
  const safeTop = Number.isFinite(petPadding.top) ? petPadding.top : 0

  const finalX = Math.round(petX - safeLeft)
  const finalY = Math.round(petY - safeTop)

  // 再次确保计算结果绝对合法
  if (!Number.isFinite(finalX) || !Number.isFinite(finalY)) {
    console.warn('⚠️ 计算结果非法，已拦截', { finalX, finalY })
    return
  }

  try {
    win.setPosition(finalX, finalY)
  } catch (e) {
    console.error('❌ setPosition 执行失败', e)
  }
}

// 3. 增量移动桌宠（防止空指针）
export function movePetBy(win: BrowserWindow, deltaX: number, deltaY: number): void {
  if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) return

  const pet = getPetRect(win)
  // 防御：如果 getPetRect 返回 null（说明窗口挂了或坐标非法），直接终止
  if (!pet) return

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

  // 注意：返回类型变成了 PetRect | null，其他地方如果用了 getPetRect 记得判空！
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
