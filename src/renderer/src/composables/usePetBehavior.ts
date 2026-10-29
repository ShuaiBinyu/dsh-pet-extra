// usePetBehavior.ts
import { ref, computed, readonly, type ComputedRef, type Ref } from 'vue'
import { petAnimations } from '../config/petAnimations'
import type { PetAnimationConfig } from '../types/pet'
import {
  defaultBehaviorRules,
  type BehaviorRule,
} from '../config/usePetBehaviorRules'

export interface PetBehaviorOptions {
  /** 参与轮播的动画类型，默认 idle */
  type?: PetAnimationConfig['type']
  /** 自定义规则，默认顺序轮播 */
  rules?: BehaviorRule
}

// 👇 1. 在这里定义返回值 Interface（把 return 里的东西都列出来）
export interface PetBehaviorReturn {
  playlist: ComputedRef<PetAnimationConfig[]>
  index: Readonly<Ref<number>>
  current: ComputedRef<PetAnimationConfig | undefined>
  onEnded: () => void
  onClick: () => void
  onDoubleClick: () => void
}

export function usePetBehavior(options: PetBehaviorOptions = {}): PetBehaviorReturn {
  const {
    type = 'idle',
    rules = defaultBehaviorRules,
  } = options

  // ① 候选列表（保持源数据顺序）
  const playlist = computed<PetAnimationConfig[]>(() =>
    petAnimations.filter(a => a.type === type)
  )

  // ② 当前索引（唯一可变状态）
  const index = ref(0)

  // 临时覆盖当前播放的动画
  const overrideAnimation = ref<PetAnimationConfig | undefined>(undefined)
  // 是否正在播放双击专属动画
  const isDoubleClickPlaying = ref(false)

  // 修改 current，让它可以被 override
  const current = computed<PetAnimationConfig | undefined>(() => {
    if (overrideAnimation.value) return overrideAnimation.value
    return playlist.value[index.value]
  })

  // ④ 执行规则：把上下文交给规则，拿回下一个 index
  function applyRules():void {
    // 👇 每次执行正常规则前，先清空双击覆盖
    if (isDoubleClickPlaying.value) {
      overrideAnimation.value = undefined
      isDoubleClickPlaying.value = false
    }

    if (playlist.value.length === 0) return
    const nextIndex = rules({
      current: current.value,
      playlist: playlist.value,
      index: index.value,
    })
    if (nextIndex < 0) return
    if (nextIndex >= playlist.value.length) return
    index.value = nextIndex

  }

  // ⑤ 唯一事件入口：播完
  function onEnded():void {
    // 播完事件：如果是双击动画播完了，清空覆盖状态，并正常切下一个
    if (isDoubleClickPlaying.value) {
      overrideAnimation.value = undefined
      isDoubleClickPlaying.value = false
    }
    applyRules()
  }

  // 点击 → 也是切下一条（复用同一套规则）
  function onClick():void {
    applyRules()
  }

  // 双击 -> 完全不按规则，独立逻辑
  function onDoubleClick ():void {
  // 1. 直接从全量数据里找双击专属的池子
  const clickPool = petAnimations.filter(a => a.type === 'dbclick')
  if (clickPool.length === 0) return

  // 2. 随机抽一个实体动画对象
  const randomTarget = clickPool[Math.floor(Math.random() * clickPool.length)]

  // 3. 强行覆盖当前画面！
  overrideAnimation.value = randomTarget
  isDoubleClickPlaying.value = true
  
  console.log('双击触发，播放：', randomTarget.name)
  }


  return {
    playlist,
    index: readonly(index),
    current,
    onEnded,
    onClick,
    onDoubleClick, // 👈 加上这行
  }
}