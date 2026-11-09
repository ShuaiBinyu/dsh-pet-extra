import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

interface PetContextMenuOptions {
  stopMotion: () => void
}

interface MenuPosition {
  x: number
  y: number
}

interface PetContextMenuReturn {
  showContextMenu: Ref<boolean>
  menuPos: Ref<MenuPosition>
  handleRightClick: (event: MouseEvent) => void
  closeMenu: () => void
  handleOpenChat: () => Promise<void>
  handleOpenConfig: () => Promise<void>
  handleQuit: () => void
}

// 管理右键菜单状态、位置以及菜单项对应的窗口操作。
export function usePetContextMenu(
  options: PetContextMenuOptions
): PetContextMenuReturn {
  const { stopMotion } = options
  const showContextMenu = ref(false)
  const menuPos = ref<MenuPosition>({ x: 0, y: 0 })

  // 计算菜单位置、停止自动位移并打开右键菜单。
  function handleRightClick(event: MouseEvent): void {
    event.preventDefault()
    event.stopPropagation()

    stopMotion()

    const menuWidth = 120
    const menuHeight = 120
    let x = event.clientX
    let y = event.clientY

    if (x + menuWidth > window.innerWidth) x -= menuWidth
    if (y + menuHeight > window.innerHeight) y -= menuHeight

    menuPos.value = { x, y }
    showContextMenu.value = true
  }

  // 关闭当前右键菜单。
  function closeMenu(): void {
    showContextMenu.value = false
  }

  // 关闭菜单并请求主进程打开聊天窗口。
  async function handleOpenChat(): Promise<void> {
    closeMenu()
    try {
      await window.chatApi?.openChatWindow()
    } catch (error) {
      console.error('打开聊天窗口失败：', error)
    }
  }

  // 关闭菜单并请求主进程打开设置窗口。
  async function handleOpenConfig(): Promise<void> {
    closeMenu()
    try {
      await window.settingApi?.openSettingsWindow()
    } catch (error) {
      console.error('打开设置窗口失败：', error)
    }
  }

  // 关闭菜单并向主进程发送退出桌宠请求。
  function handleQuit(): void {
    closeMenu()
    window.petApi?.quitApp()
  }

  watch(showContextMenu, (isOpen) => {
    if (isOpen) {
      document.documentElement.addEventListener('mouseleave', closeMenu)
    } else {
      document.documentElement.removeEventListener('mouseleave', closeMenu)
    }
  })

  onBeforeUnmount(() => {
    document.documentElement.removeEventListener('mouseleave', closeMenu)
  })

  return {
    showContextMenu,
    menuPos,
    handleRightClick,
    closeMenu,
    handleOpenChat,
    handleOpenConfig,
    handleQuit,
  }
}
