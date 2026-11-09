import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'

interface PetMouseThroughOptions {
  showContextMenu: Ref<boolean>
  hitAreaSelector?: string
}

interface PetMouseThroughReturn {
  updateMouseIgnore: (event?: MouseEvent) => void
}

// 管理桌宠窗口的鼠标穿透状态和命中区域检测。
export function usePetMouseThrough(
  options: PetMouseThroughOptions
): PetMouseThroughReturn {
  const {
    showContextMenu,
    hitAreaSelector = '.pet-hit-area',
  } = options

  let isIgnoring = true

  // 根据鼠标是否位于桌宠命中区域，切换窗口鼠标穿透状态。
  function updateMouseIgnore(event?: MouseEvent): void {
    if (showContextMenu.value) {
      if (isIgnoring) {
        window.petApi.setIgnoreMouseEvents(false)
        isIgnoring = false
      }
      return
    }

    if (!event) {
      if (!isIgnoring) {
        window.petApi.setIgnoreMouseEvents(true, { forward: true })
        isIgnoring = true
      }
      return
    }

    const hitArea = document.querySelector(hitAreaSelector) as HTMLElement | null
    if (!hitArea) return

    const rect = hitArea.getBoundingClientRect()
    const isInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom

    if (isInside) {
      if (isIgnoring) {
        window.petApi.setIgnoreMouseEvents(false)
        isIgnoring = false
      }
    } else if (!isIgnoring) {
      window.petApi.setIgnoreMouseEvents(true, { forward: true })
      isIgnoring = true
    }
  }

  watch(showContextMenu, () => {
    updateMouseIgnore()
  })

  onMounted(() => {
    window.petApi.setIgnoreMouseEvents(true, { forward: true })
    window.addEventListener('mousemove', updateMouseIgnore)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', updateMouseIgnore)
  })

  return { updateMouseIgnore }
}
