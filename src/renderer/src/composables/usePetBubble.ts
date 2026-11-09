import { ref, onMounted, onUnmounted, Ref } from 'vue'
import bubbleList from '../assets/bubble-default.json'
import { useSystemState } from './useSystemState'

type BubblePos = {
  top: string
  left: string
}
const bubbleClassList = ['bubble-normal', 'bubble-yellow', 'bubble-blue', 'bubble-cloud'] as const
type BubbleClassType = (typeof bubbleClassList)[number]

interface UsePetBubbleReturn {
  showBubble: Ref<boolean>
  bubbleText: Ref<string>
  bubbleStyle: Ref<BubblePos>
  bubbleClass: Ref<BubbleClassType>
  onAnimEnd: () => void
  markClickNeedBubble: () => void
  cancelPendingBubble: () => void
  popBubble: (forcedText: string) => void
  onNeedBubble: Ref<((text: string) => void) | null>
}

// 管理气泡内容、位置、主题、自动触发和点击触发状态。
export function usePetBubble(): UsePetBubbleReturn {
  const { isUserIdle } = useSystemState()

  const isAnimating = ref<boolean>(false)
  const pendingClickBubble = ref<boolean>(false)
  const showBubble = ref<boolean>(false)
  const bubbleText = ref<string>('')
  const bubbleStyle = ref<BubblePos>({ top: '-40px', left: '20px' })
  const bubbleClass = ref<BubbleClassType>('bubble-normal')

  let bubbleTimer: number | null = null
  let bubbleCloseTimer: number | null = null
  let isDestroyed = false          // ← 新增：销毁标志

  const BUBBLE_BASE_DURATION = 3000
  const INTERVAL_MIN = 60000
  const INTERVAL_MAX = 120000

  const onNeedBubble = ref<((text: string) => void) | null>(null)

  // 根据当前时间段和随机策略选择一条气泡文本。
  function getRandomText(): string {
    const hour = new Date().getHours()
    let timePool: string[]

    if (hour >= 5 && hour < 11) timePool = bubbleList.morning
    else if (hour >= 11 && hour < 14) timePool = bubbleList.noon
    else if (hour >= 14 && hour < 18) timePool = bubbleList.afternoon
    else if (hour >= 18 && hour < 22) timePool = bubbleList.evening
    else timePool = bubbleList.night

    const useTimePool = Math.random() < 0.7
    const finalPool = useTimePool ? timePool : bubbleList.any
    return finalPool[Math.floor(Math.random() * finalPool.length)]
  }

  // 在桌宠命中区域附近随机生成气泡显示位置。
  function getRandomPos(): BubblePos {
    const hitLeft = 175
    const hitTop = 150
    const hitWidth = 150
    const centerX = hitLeft + hitWidth / 2

    const dirs = [
      { offsetX: 0, offsetY: -22 },
      { offsetX: -18, offsetY: -20 },
      { offsetX: 18, offsetY: -20 }
    ]
    const pick = dirs[Math.floor(Math.random() * dirs.length)]
    const jitterX = (Math.random() - 0.5) * 8
    const jitterY = (Math.random() - 0.5) * 5

    const finalX = centerX + pick.offsetX + jitterX
    const finalY = hitTop + pick.offsetY + jitterY
    return { top: `${finalY}px`, left: `${finalX}px` }
  }

  // 判断当前是否允许显示气泡，并将文本交给语音/气泡回调。
  function triggerBubble(forcedText?: string): void {
    if (!forcedText && !isUserIdle.value) {
      console.log('【气泡】用户正在操作键鼠，自动气泡被拦截')
      return
    }
    if (isAnimating.value && !forcedText) return
    if (showBubble.value) return

    const text = forcedText || getRandomText()
    if (onNeedBubble.value) {
      onNeedBubble.value(text)
    } else {
      popBubble(text)
    }
  }

  // 设置气泡内容、位置和主题，并启动自动隐藏定时器。
  function popBubble(forcedText: string): void {
    bubbleText.value = forcedText
    bubbleStyle.value = getRandomPos()
    bubbleClass.value = bubbleClassList[
      Math.floor(Math.random() * bubbleClassList.length)
    ] as BubbleClassType
    showBubble.value = true

    if (bubbleCloseTimer) clearTimeout(bubbleCloseTimer)

    const dynamicDuration = Math.max(BUBBLE_BASE_DURATION, forcedText.length * 250)
    bubbleCloseTimer = window.setTimeout(() => {
      showBubble.value = false
      bubbleCloseTimer = null
    }, dynamicDuration)
  }

  // 安排下一次随机自动气泡，并在组件销毁后停止继续调度。
  function startBubbleLoop(): void {
    if (isDestroyed) return        // ← 新增：销毁后不再设新定时器
    const delay = INTERVAL_MIN + Math.random() * (INTERVAL_MAX - INTERVAL_MIN)
    bubbleTimer = window.setTimeout(() => {
      if (isDestroyed) return      // ← 新增：回调执行前再检查
      triggerBubble()
      startBubbleLoop()
    }, delay)
  }

  // 处理动画过渡结束事件，显示点击后暂存的气泡。
  function onAnimEnd(): void {
    isAnimating.value = false
    if (pendingClickBubble.value) {
      pendingClickBubble.value = false
      if (showBubble.value) {
        showBubble.value = false
        if (bubbleCloseTimer) {
          clearTimeout(bubbleCloseTimer)
          bubbleCloseTimer = null
        }
      }
      const text = getRandomText()
      if (onNeedBubble.value) {
        onNeedBubble.value(text)
      } else {
        popBubble(text)
      }
    }
  }

  // 记录点击后需要在动画过渡完成时显示气泡。
  function markClickNeedBubble(): void {
    isAnimating.value = true
    pendingClickBubble.value = true
  }

  // 取消尚未显示的点击气泡。
  function cancelPendingBubble(): void {
    pendingClickBubble.value = false
  }

  onMounted(() => {
    bubbleTimer = window.setTimeout(() => {
      if (isDestroyed) return      // ← 新增：初始定时器也检查
      triggerBubble()
      startBubbleLoop()
    }, 30000 + Math.random() * 30000)
  })

  onUnmounted(() => {
    isDestroyed = true             // ← 新增：置销毁标志
    if (bubbleTimer) clearTimeout(bubbleTimer)
    if (bubbleCloseTimer) clearTimeout(bubbleCloseTimer)
    onNeedBubble.value = null
  })

  return {
    showBubble,
    bubbleText,
    bubbleStyle,
    bubbleClass,
    onAnimEnd,
    markClickNeedBubble,
    cancelPendingBubble,
    popBubble,
    onNeedBubble
  }
}
