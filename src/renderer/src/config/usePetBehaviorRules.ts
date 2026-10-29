// usePetBehaviorRules.ts
import type { PetAnimationConfig } from '../types/pet'
import { petAnimations } from './petAnimations'

/**
 * 规则上下文：规则函数做决策所需的全部信息。
 * 规则是纯函数，只从这里拿数据，不 import Vue、不碰状态。
 */
export interface BehaviorContext {
  /** 当前正在播放的动画（列表为空时可能为 undefined） */
  current: PetAnimationConfig | undefined
  /** 候选播放列表（已按 type 筛过，保持源数据顺序） */
  playlist: PetAnimationConfig[]
  /** 当前在 playlist 中的索引 */
  index: number
  /** 区分是哪种事件触发的（播完、单击、双击） */
  reason?: 'ended' | 'click' | 'dblclick'
}

/**
 * 规则函数签名。
 * 返回下一个要播放的 index；返回 -1 表示"不切换"。
 */
export type BehaviorRule = (ctx: BehaviorContext) => number

/**
 * 默认规则：按 playlist 顺序轮播。
 * 播完切下一条，最后一条回到第 0 条。
 */
export const sequentialRule: BehaviorRule = ({ playlist, index }) => {
  if (playlist.length === 0) return -1
  return (index + 1) % playlist.length
}

// 双击专属规则
export const doubleClickRule: BehaviorRule = ({ playlist }) => {
  // 1. 从全量数据里，抓取所有 type 为 'dbclick' 的动画
  const clickPool = petAnimations.filter(a => a.type === 'dbclick')
  
  if (clickPool.length === 0) return -1

  // 2. 随机抽一个
  const randomTarget = clickPool[Math.floor(Math.random() * clickPool.length)]

  // 3. 关键点：它不在当前的 playlist 里，所以 findIndex 会返回 -1
  return playlist.findIndex(a => a.id === randomTarget.id)
}

export const defaultBehaviorRules: BehaviorRule = sequentialRule