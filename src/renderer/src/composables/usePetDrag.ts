
import { ref, onBeforeUnmount } from 'vue'

export function usePetDrag() {
  const dragging = ref(false)

  let lastMouseX = 0
  let lastMouseY = 0

  function onMouseDown(event: MouseEvent) {
    // 只响应鼠标左键
    if (event.button !== 0) return

    dragging.value = true

    lastMouseX = event.screenX
    lastMouseY = event.screenY

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function onMouseMove(event: MouseEvent) {
    if (!dragging.value) return

    const deltaX = event.screenX - lastMouseX
    const deltaY = event.screenY - lastMouseY

    if (deltaX !== 0 || deltaY !== 0) {
      window.api.petDrag(deltaX, deltaY)
    }

    lastMouseX = event.screenX
    lastMouseY = event.screenY
  }

  function onMouseUp() {
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
