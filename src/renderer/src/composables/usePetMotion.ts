import { onBeforeUnmount } from 'vue'
import type { PetMotion } from '../types/pet'

interface MotionController {
  start: (motion: PetMotion, durationSec: number) => void
  pause: () => void
  resume: () => void
  stop: () => void
}

// 提供可启动和停止的桌宠窗口位移动画控制器。
export function usePetMotion(): MotionController {
  // 向主进程发送自动位移动画请求，由主进程负责逐帧移动窗口。
  function start(motion: PetMotion, durationSec: number): void {
    stop()
    if (!motion.dx && !motion.dy) return
    window.petApi.petMotionStart(motion, durationSec)
  }

  // 向主进程发送停止自动位移动画请求。
  function stop(): void {
    window.petApi.petMotionStop()
  }

  // 暂停主进程中的自动位移，并保留当前动画进度。
  function pause(): void {
    window.petApi.petMotionPause()
  }

  // 从暂停时的进度继续主进程中的自动位移。
  function resume(): void {
    window.petApi.petMotionResume()
  }

  onBeforeUnmount(stop)

  return { start, pause, resume, stop }
}
