// usePetBehavior.ts
import { ref, computed, readonly } from 'vue'
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

export function usePetBehavior(options: PetBehaviorOptions = {}) {
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

  // ③ 当前动画
  const current = computed<PetAnimationConfig | undefined>(
    () => playlist.value[index.value]
  )

  // ④ 执行规则：把上下文交给规则，拿回下一个 index
  function applyRules() {
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
  function onEnded() {
    applyRules()
  }

  // 点击 → 也是切下一条（复用同一套规则）
  function onClick() {
    applyRules()
  }


  return {
    playlist,
    index: readonly(index),
    current,
    onEnded,
    onClick,
  }
}