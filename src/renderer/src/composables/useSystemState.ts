import { ref, readonly, onMounted, onUnmounted } from 'vue'

// =====================================================================
// 模块级单例状态（所有组件共享同一个状态和同一个 IPC 监听器）
// =====================================================================
const isIdle = ref(false)
let listenerDispose: (() => void) | null = null
let listenerRefCount = 0

// 定义对外暴露的接口
export interface UseSystemStateReturn {
  /** 用户是否处于空闲（发呆）状态。只读，请使用 .value 读取 */
  isUserIdle: Readonly<typeof isIdle>
}

/**
 * 全局系统状态感知 Hook
 * - 自动处理 IPC 的订阅与取消订阅
 * - 使用引用计数，保证多个组件共用时只向主进程订阅一次
 * - 暴露只读的响应式变量，避免业务层随意篡改状态
 */
// 将主进程系统空闲状态转换为可共享的 Vue 响应式状态。
export function useSystemState(): UseSystemStateReturn {
  // 在组件挂载时订阅主进程状态，并拉取一次当前系统状态。
  onMounted(async (): Promise<void> => {
    listenerRefCount++

    // 只有当第一个组件挂载时，才去初始化拉取状态并订阅 IPC
    if (listenerRefCount === 1) {
      // 1. 先订阅，确保不会错过主进程的状态推送
      listenerDispose = window.electronSystem.onStateChange((state) => {
        if (isIdle.value !== state.isIdle) {
          isIdle.value = state.isIdle
        }
      })
      // 2. 主动拉一次初始状态（覆盖空窗期）
      try {
        const initial = await window.electronSystem.getState()
        const currentCount: number = listenerRefCount   // ← 重新读取，TS 不再认为它是“1”
        // await 之后检查：这期间可能所有组件都卸载了
        if (currentCount === 0) {
          listenerDispose?.()
          listenerDispose = null
          return
        }
        isIdle.value = initial.isIdle
      } catch (e) {
        console.warn('【useSystemState】拉取初始状态失败', e)
      }
    }
  })

  // 组件卸载时减少引用计数，最后一个使用者卸载后取消 IPC 订阅。
  onUnmounted(() => {
    listenerRefCount--

    // 当最后一个使用该状态的组件卸载时，断开 IPC 监听，防止内存泄漏
    if (listenerRefCount === 0 && listenerDispose) {
      listenerDispose()
      listenerDispose = null
    }
  })

  return {
    // 使用 readonly 包装，外部修改会触发 Vue 警告，保证数据单向流动
    isUserIdle: readonly(isIdle)
  }
}
