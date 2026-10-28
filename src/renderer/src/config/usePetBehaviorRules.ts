// usePetBehaviorRules.ts
import type { PetAnimationConfig } from '../types/pet'

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

/**
 * 默认规则集。
 * 目前只有顺序轮播；后续新增规则时改这里，执行器无需变动。
 */
export const defaultBehaviorRules: BehaviorRule = sequentialRule