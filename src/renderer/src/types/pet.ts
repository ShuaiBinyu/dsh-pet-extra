
/** 动画类别 */
export type PetAnimationType =
  | 'idle'
  | 'interaction'
  | 'special'

/** 桌宠事件 */
export type PetEventType =
  | 'click'
  | 'drag-start'
  | 'dragging'
  | 'drag-end'
  | 'timer'

export interface PetMotion {
  /** 水平位移（px），正右负左 */
  dx: number
  /** 垂直位移（px），正下负上 */
  dy: number
}
/** 动画配置 */
export interface PetAnimationConfig {
  id: string
  name: string
  src: string

  type: PetAnimationType

  /** 是否循环播放 */
  loop: boolean

  /** 可选的播放时长，单位毫秒 */
  duration?: number

  /** 随机选择权重 */
  weight?: number

  /** 显示适配参数 */
  scale?: number
  offsetX?: number
  offsetY?: number

  /**   */
  motion?:{
    dx: number,
    dy: number
  }
}

// 行为控制
export type PetBehaviorAction =
  | 'play-next'
  | 'play-random'
  | 'play-by-id'
  | 'play-category'

/** 动画触发规则接口定义 */
export interface PetBehaviorRule {
  event: PetEventType
  action?: PetBehaviorAction

  /** 是否允许打断当前动画 */
  interrupt: boolean

  /** 触发冷却时间，单位毫秒 */
  cooldown?: number
}
