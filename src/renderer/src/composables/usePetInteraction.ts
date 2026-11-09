import type { Ref } from 'vue'

interface PetInteractionOptions {
  showContextMenu: Ref<boolean>
  onMouseDown: (event: MouseEvent) => void
  onClick: () => void
  onDoubleClick: () => void
  markClickNeedBubble: () => void
  cancelPendingBubble: () => void
  closeMenu: () => void
}

interface PetInteractionReturn {
  handleMouseDown: (event: MouseEvent) => void
  handleClick: (event: MouseEvent) => void
  handleDoubleClick: (event: MouseEvent) => void
}

// 统一处理桌宠命中区域的单击、双击和菜单关闭交互。
export function usePetInteraction(options: PetInteractionOptions): PetInteractionReturn {
  const {
    showContextMenu,
    onMouseDown,
    onClick,
    onDoubleClick,
    markClickNeedBubble,
    cancelPendingBubble,
    closeMenu,
  } = options

  let downX = 0
  let downY = 0
  let clickTimer: ReturnType<typeof setTimeout> | null = null

  // 判断鼠标释放位置是否仍在点击容差范围内。
  function isClick(event: MouseEvent): boolean {
    const dx = event.screenX - downX
    const dy = event.screenY - downY
    return Math.abs(dx) <= 5 && Math.abs(dy) <= 5
  }

  // 处理命中区域的左键按下，并记录点击起点供拖拽判断。
  function handleMouseDown(event: MouseEvent): void {
    if (event.button === 0 && showContextMenu.value) {
      closeMenu()
      return
    }

    if (event.button !== 0) return

    downX = event.screenX
    downY = event.screenY
    onMouseDown(event)
  }

  // 延迟处理单击，以便给双击事件留出识别时间。
  function handleClick(event: MouseEvent): void {
    if (!isClick(event)) return

    markClickNeedBubble()

    if (clickTimer) clearTimeout(clickTimer)
    clickTimer = setTimeout(() => {
      onClick()
      clickTimer = null
    }, 250)
  }

  // 取消待执行的单击行为，并转发双击事件。
  function handleDoubleClick(event: MouseEvent): void {
    if (!isClick(event)) return

    if (clickTimer) {
      clearTimeout(clickTimer)
      clickTimer = null
    }

    cancelPendingBubble()
    onDoubleClick()
  }

  return {
    handleMouseDown,
    handleClick,
    handleDoubleClick,
  }
}
