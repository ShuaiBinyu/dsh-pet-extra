import { powerMonitor } from 'electron'
// Electron主进程API，用来获取系统空闲时间，即全局的键盘和鼠标未触发
import { EventEmitter } from 'events'
// Node.js 内置的事件发射器类，服务，主进程通过emit向外喊话，渲染（前端页面）通过.on进行收听

// 系统状态（主进程侧） isIdle: 用户是否处于空闲状态（一段时间无键鼠操作）
export interface SystemState {
  isIdle: boolean
}

const IDLE_THRESHOLD_SEC = 15 // 连续 15 秒无操作视为空闲
const POLL_INTERVAL_MS = 2000 // 每 2 秒轮询一次
const IDLE_THRESHOLD_MS = IDLE_THRESHOLD_SEC * 1000 // 统一出口单位为毫秒

class SystemStateService extends EventEmitter {
  private checkTimer: NodeJS.Timeout | null = null // 定时器句柄，用于轮询系统状态
  private state: SystemState = { isIdle: false } // 当前状态快照，判断系统空闲/忙碌
  private isRunning = false // 幂等开关，确保不会重复启动定时器

  /** 启动监控（幂等） */
  // 启动系统空闲状态轮询，并发布初始状态。
  start(): void {
    if (this.isRunning) return // 如果监控已经启动，直接返回，避免重叠，浪费资源
    this.isRunning = true // 标记监控已启动

    // 初始化状态：刚启动时读取一次
    const initialIdleMs = powerMonitor.getSystemIdleTime() * 1000 //初始启动时，借助powerMonitor获取系统的空闲秒数
    this.state.isIdle = initialIdleMs >= IDLE_THRESHOLD_MS // 判断是否空闲，和真实值进行比对，覆盖默认数据

    this.checkTimer = setInterval(() => this.tick(), POLL_INTERVAL_MS) // 每 2 秒轮询一次系统状态，调用tick方法
    console.log('【SystemStateService】已启动，初始 isIdle:', this.state.isIdle)
  }

  /** 停止监控 */
  // 停止系统状态轮询并重置状态。
  stop(): void {
    if (!this.isRunning) return // 如果监控未启动，直接返回，避免重复清理
    if (this.checkTimer) {
      clearInterval(this.checkTimer)
      this.checkTimer = null
    }
    this.isRunning = false
    this.state = { isIdle: false } // 重置初始状态，状态归零
  }

  /** 同步获取当前状态快照（供 IPC 首次拉取用） */
  // 返回当前系统状态的副本，避免调用方直接修改内部状态。
  getState(): Readonly<SystemState> {
    return { ...this.state }
  }

  // 读取最新系统空闲时间，并在状态变化时发出 state-change 事件。
  private tick(): void {
    const idleMs = powerMonitor.getSystemIdleTime() * 1000 // 获取系统空闲时间（毫秒）
    const isIdleNow = idleMs >= IDLE_THRESHOLD_MS // 判断当前是否空闲

    // 如果状态发生变化，才进行更新
    if (isIdleNow !== this.state.isIdle) {
      this.state.isIdle = isIdleNow
      this.emit('state-change', this.getState()) // 向外发射事件，通知订阅方状态变更
      console.log(`【SystemStateService】状态变更 -> ${isIdleNow ? '空闲' : '活跃'}`)
    }
  }
}

// 单例导出（整个主进程共享一个服务）
export const systemStateService = new SystemStateService()
