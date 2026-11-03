
import { ref, onBeforeUnmount, type Ref } from 'vue'
// 👇 1. 定义返回值的 Interface
export interface PetDragReturn {
  dragging: Ref<boolean>
  onMouseDown: (event: MouseEvent) => void
}

export function usePetDrag():PetDragReturn {
  const dragging = ref(false)

  let lastMouseX = 0
  let lastMouseY = 0

  function onMouseDown(event: MouseEvent):void {
    // 只响应鼠标左键
    if (event.button !== 0) return

    dragging.value = true

    lastMouseX = event.screenX
    lastMouseY = event.screenY

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function onMouseMove(event: MouseEvent):void {
    if (!dragging.value) return
    // 👇 核心修复 1：如果获取到的屏幕坐标不是有效数字，直接丢弃这一帧
    if (!Number.isFinite(event.screenX) || !Number.isFinite(event.screenY)) {
      return
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

  function onMouseUp():void {
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
