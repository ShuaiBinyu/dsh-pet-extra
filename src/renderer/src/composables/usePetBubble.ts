import { ref, onMounted, onUnmounted, Ref } from 'vue'
import bubbleList from '../assets/bubble-default.json'

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
}

export function usePetBubble(): UsePetBubbleReturn {
  // 状态
  const isAnimating = ref<boolean>(false)
  const pendingClickBubble = ref<boolean>(false)
  const showBubble = ref<boolean>(false)
  const bubbleText = ref<string>('')
  const bubbleStyle = ref<BubblePos>({ top: '-40px', left: '20px' })
  const bubbleClass = ref<BubbleClassType>('bubble-normal')

  // 定时器
  let bubbleTimer: number | null = null
  let bubbleCloseTimer: number | null = null

  const BUBBLE_DURATION = 3000
  const INTERVAL_MIN = 15000
  const INTERVAL_MAX = 35000

  function getRandomText(): string {
    return bubbleList[Math.floor(Math.random() * bubbleList.length)]
  }

  function getRandomPos(): BubblePos {
    const hitLeft = 175
    const hitTop = 150
    const hitWidth = 150
    const centerX = hitLeft + hitWidth / 2

    const dirs = [
      { offsetX: 0, offsetY: -22 },
      { offsetX: -18, offsetY: -20 },
      { offsetX: 18, offsetY: -20 },
    ]
    const pick = dirs[Math.floor(Math.random() * dirs.length)]
    const jitterX = (Math.random() - 0.5) * 8
    const jitterY = (Math.random() - 0.5) * 5

    const finalX = centerX + pick.offsetX + jitterX
    const finalY = hitTop + pick.offsetY + jitterY
    return { top: `${finalY}px`, left: `${finalX}px` }
  }

  function popBubble(): void {
    if (isAnimating.value) return
    if (showBubble.value) return

    bubbleText.value = getRandomText()
    bubbleStyle.value = getRandomPos()
    // 重点：这里加 as BubbleClassType
    bubbleClass.value = bubbleClassList[Math.floor(Math.random() * bubbleClassList.length)] as BubbleClassType
    showBubble.value = true

    if (bubbleCloseTimer) clearTimeout(bubbleCloseTimer)
    bubbleCloseTimer = window.setTimeout(() => {
      showBubble.value = false
      bubbleCloseTimer = null
    }, BUBBLE_DURATION)
  }

  function startBubbleLoop(): void {
    const delay = INTERVAL_MIN + Math.random() * (INTERVAL_MAX - INTERVAL_MIN)
    bubbleTimer = window.setTimeout(() => {
      popBubble()
      startBubbleLoop()
    }, delay)
  }

  function onAnimEnd(): void {
    isAnimating.value = false
    if (pendingClickBubble.value) {
      pendingClickBubble.value = false
      popBubble()
    }
  }

  function markClickNeedBubble(): void {
    isAnimating.value = true
    pendingClickBubble.value = true
  }

  function cancelPendingBubble(): void {
    pendingClickBubble.value = false
  }

  onMounted(() => startBubbleLoop())
  onUnmounted(() => {
    if (bubbleTimer) clearTimeout(bubbleTimer)
    if (bubbleCloseTimer) clearTimeout(bubbleCloseTimer)
  })

  return {
    showBubble,
    bubbleText,
    bubbleStyle,
    bubbleClass,
    onAnimEnd,
    markClickNeedBubble,
    cancelPendingBubble,
  }
}
