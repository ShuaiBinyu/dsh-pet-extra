import { onBeforeUnmount } from 'vue'
import type { PetMotion } from '../types/pet'

export function usePetMotion() {
  let rafId = 0
  let startTime = 0
  let durationMs = 0
  let totalDx = 0
  let totalDy = 0
  let lastDx = 0
  let lastDy = 0
  let pendingDx = 0
  let pendingDy = 0

  function start(motion: PetMotion, durationSec: number) {
    stop()
    if (!motion.dx && !motion.dy) return

    totalDx = motion.dx
    totalDy = motion.dy
    durationMs = durationSec * 1000
    startTime = performance.now()
    lastDx = 0
    lastDy = 0
    pendingDx = 0
    pendingDy = 0

    rafId = requestAnimationFrame(tick)
  }

  function tick(now: number) {
    const t = Math.min((now - startTime) / durationMs, 1)
    const currentDx = totalDx * t
    const currentDy = totalDy * t

    // 累积小数，够 1px 才发（主进程 setPosition 取整，亚像素会丢）
    pendingDx += currentDx - lastDx
    pendingDy += currentDy - lastDy
    lastDx = currentDx
    lastDy = currentDy

    const moveX = Math.trunc(pendingDx)
    const moveY = Math.trunc(pendingDy)
    if (moveX !== 0 || moveY !== 0) {
      window.api.petDrag(moveX, moveY)
      pendingDx -= moveX
      pendingDy -= moveY
    }

    if (t < 1) {
      rafId = requestAnimationFrame(tick)
    } else {
      rafId = 0
    }
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  }

  onBeforeUnmount(stop)

  return { start, stop }
}