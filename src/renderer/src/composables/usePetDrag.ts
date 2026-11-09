
import { ref, onBeforeUnmount, type Ref } from 'vue'
// 👇 1. 定义返回值的 Interface
export interface PetDragReturn {
  dragging: Ref<boolean>
  onMouseDown: (event: MouseEvent) => void
}

// 提供桌宠窗口拖拽状态和鼠标按下入口。
export function usePetDrag():PetDragReturn {
  const dragging = ref(false)

  let lastMouseX = 0
  let lastMouseY = 0
  let downMouseX = 0
  let downMouseY = 0

  // 开始记录鼠标屏幕坐标，并注册拖拽过程中的全局鼠标监听。
  function onMouseDown(event: MouseEvent):void {
    // 只响应鼠标左键
    if (event.button !== 0) return

    lastMouseX = event.screenX
    lastMouseY = event.screenY
    downMouseX = event.screenX
    downMouseY = event.screenY

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  // 根据鼠标屏幕坐标变化计算增量，并请求主进程移动窗口。
  function onMouseMove(event: MouseEvent):void {
    // 👇 核心修复 1：如果获取到的屏幕坐标不是有效数字，直接丢弃这一帧
    if (!Number.isFinite(event.screenX) || !Number.isFinite(event.screenY)) {
      return
    }

    if (!dragging.value) {
      const totalDx = event.screenX - downMouseX
      const totalDy = event.screenY - downMouseY
      if (Math.abs(totalDx) <= 5 && Math.abs(totalDy) <= 5) return
      dragging.value = true
    }

    const deltaX = event.screenX - lastMouseX
    const deltaY = event.screenY - lastMouseY
    // 👇 核心修复 2：双重保险，确保计算出的增量必须是有效数字
    if (Number.isFinite(deltaX) && Number.isFinite(deltaY)) {
      if (deltaX !== 0 || deltaY !== 0) {
        window.petApi.petDrag(deltaX, deltaY)
      }
    }
    lastMouseX = event.screenX
    lastMouseY = event.screenY
  }

  // 结束拖拽并移除全局鼠标监听。
  function onMouseUp(): void {
    dragging.value = false

    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  onBeforeUnmount(() => {
    onMouseUp()
  })

  return {
    dragging,
    onMouseDown
  }
}
