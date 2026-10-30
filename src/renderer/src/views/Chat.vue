<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

// 消息列表
const messages = ref<{ id: number; role: 'user' | 'ai'; text: string }[]>([])
const inputText = ref('')
const isLoading = ref(false)
const scrollContainer = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)
let msgId = 0

// 存储上次聊天的最后一句
const lastMessage = ref('')

// 自动滚动到底部
const scrollToBottom = async (): Promise<void> => {
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
}

// 点击气泡聚焦
const focusInput = (): void => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
}

// ✅ 修改后
const autoFocus = (): void => {
  setTimeout(() => {
    // 1. 强制让当前抢占焦点的元素（比如清除按钮）失焦
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    // 2. 让输入框重新获得焦点
    if (inputRef.value) {
      inputRef.value.focus()
    }
  }, 100)
}

// 发送消息
const sendMessage = async (): Promise<void> => {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  messages.value.push({ id: msgId++, role: 'user', text })
  inputText.value = ''

  // 重置输入框高度
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
  }

  isLoading.value = true
  scrollToBottom()

  try {
    const res = await window.chatApi.sendMessage(text)

    if (res.success && res.content) {
      messages.value.push({ id: msgId++, role: 'ai', text: res.content })
    } else {
      messages.value.push({ id: msgId++, role: 'ai', text: `[出错了]: ${res.error}` })
    }
  } catch (err) {
    console.error('发送失败', err)
    messages.value.push({ id: msgId++, role: 'ai', text: '系统错误，请查看控制台。' })
  } finally {
    isLoading.value = false
    scrollToBottom()
    autoFocus() // AI 说完话后，光标立刻回到输入框
  }
}

// 处理输入框键盘事件：回车发送，Shift+回车换行
const handleKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  } else {
    // 按其他键时，自动撑开输入框高度
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.style.height = 'auto'
        inputRef.value.style.height = inputRef.value.scrollHeight + 'px'
      }
    })
  }
}

const handleClearHistory = async (): Promise<void> => {
  const confirmClear = window.confirm('确定要让 DsPet 忘记所有的历史聊天记录吗？')
  if (!confirmClear) return

  try {
    await window.chatApi.clearHistory()
    messages.value = []
    lastMessage.value = ''
    autoFocus()
    console.log('记忆已彻底清空')
  } catch (err) {
    console.error('清空记忆失败', err)
  }
}

// ========== ✨ 新增：全局快捷键监听 ==========
const handleGlobalKeydown = (e: KeyboardEvent): void => {
  // 1. 按下 Esc 键：隐藏窗口（走主进程的 hide 拦截）
  if (e.key === 'Escape') {
    e.preventDefault()
    window.close()
  }

  // 2. 按下 Ctrl+W (Win) 或 Cmd+W (Mac)：彻底销毁窗口
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
    e.preventDefault() // 阻止可能引发的系统级默认关闭
    window.chatApi?.destroyWindow() // 调用主进程强杀 API
  }
}
// ✅ 新增：当窗口重新获得焦点时，执行 autoFocus
const handleWindowFocus = (): void => {
  autoFocus()
}
// 页面加载时
onMounted(async () => {
  scrollToBottom()

  // 读取历史记录，显示最后一句
  try {
    const history = await window.chatApi.getHistory()
    if (history && history.length > 0) {
      const last = history[history.length - 1]
      const text = last.content
      lastMessage.value = text.length > 15 ? text.slice(0, 15) + '...' : text
    }
  } catch (err) {
    console.error('获取历史记录失败', err)
  }

  // 启动时自动聚焦
  autoFocus()

  // ✅ 挂载全局键盘监听
  window.addEventListener('keydown', handleGlobalKeydown)
  // ✅ 从hide状态恢复时，自动聚焦输入框
  window.addEventListener('focus', handleWindowFocus)
})

// ✅ 组件卸载时清理监听器，防止内存泄漏
onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
  // ✅ 加上这一行，防止内存泄漏
  window.removeEventListener('focus', handleWindowFocus)

})
</script>

<template>
  <div class="chat-layout">
    <!-- 顶部拖拽区域 -->
    <header class="drag-area"></header>

    <!-- 消息列表区 -->
    <main class="message-area" ref="scrollContainer">
      <!-- 空状态：显示上次对话 -->
      <div v-if="messages.length === 0" class="empty-state">
        <div class="empty-bubble" @click="focusInput">
          <span v-if="lastMessage">🐾 上次聊到：{{ lastMessage }}</span>
          <span v-else>🐾 点我聊天呀~</span>
        </div>
      </div>

      <!-- 消息气泡 -->
      <div v-for="msg in messages" :key="msg.id" class="message-row" :class="msg.role">
        <div class="bubble" :class="msg.role">
          {{ msg.text }}
        </div>
      </div>

      <!-- 打字机等待动画 -->
      <div v-if="isLoading" class="message-row ai">
        <div class="bubble typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    </main>

    <!-- 底部悬浮输入区 -->
    <footer class="input-area">
      <div class="input-wrapper">
        <!-- 清空记忆按钮 -->
        <button
          class="action-btn clear-btn"
          tabindex="-1"
          @click="handleClearHistory"
          title="清空所有记忆"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
        </button>

        <!-- 输入框（加了 ref） -->
        <textarea
          ref="inputRef"
          v-model="inputText"
          placeholder="说点什么..."
          @keydown="handleKeydown"
          :disabled="isLoading"
          rows="1"
          class="chat-input"
        ></textarea>

        <!-- 发送按钮 -->
        <button
          class="send-btn"
          @click="sendMessage"
          :disabled="!inputText.trim() || isLoading"
        >
          发送
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 整体：完全透明 */
.chat-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: transparent;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  /* 允许鼠标点击穿透到桌面 */
  pointer-events: none;
}

/* 拖拽区域：顶部留出空间用来移动窗口 */
.drag-area {
  height: 60px;
  width: 100%;
  -webkit-app-region: drag;
  pointer-events: auto;
}

/* 消息列表区 */
.message-area {
  flex: 1;
  overflow-y: auto;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: none;
}
.message-area::-webkit-scrollbar {
  display: none;
}

/* 空状态气泡 */
.empty-state {
  text-align: center;
  margin-top: 20px;
  pointer-events: auto;
}
.empty-bubble {
  display: inline-block;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 16px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}
.empty-bubble:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.15);
}

/* 消息行 */
.message-row {
  display: flex;
  align-items: flex-start;
  max-width: 90%;
  animation: slideUp 0.3s ease;
  pointer-events: auto;
}
.message-row.user {
  align-self: flex-end;
  justify-content: flex-end;
}

/* 气泡通用样式 */
.bubble {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* 用户气泡：主题绿，白字 */
.message-row.user .bubble {
  background: rgba(16, 185, 129, 0.95);
  color: white;
  border-bottom-right-radius: 4px;
}

/* AI 气泡：白色，黑字 */
.message-row.ai .bubble {
  background: rgba(255, 255, 255, 0.95);
  color: #1f2937;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(0,0,0,0.05);
}

/* 打字机等待动画 */
.bubble.typing {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 20px;
}
.bubble.typing span {
  width: 5px;
  height: 5px;
  background-color: #9ca3af;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}
.bubble.typing span:nth-child(1) { animation-delay: -0.32s; }
.bubble.typing span:nth-child(2) { animation-delay: -0.16s; }

/* 底部输入区 */
.input-area {
  padding: 16px 20px 24px;
  pointer-events: auto;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 24px;
  padding: 6px 6px 6px 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.input-wrapper:focus-within {
  border-color: #10b981;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15);
}

.chat-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 0;
  font-size: 14px;
  resize: none;
  outline: none;
  max-height: 100px;
  color: #1f2937;
}

.send-btn {
  padding: 8px 16px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 8px;
}

.send-btn:hover:not(:disabled) {
  background: #059669;
}
.send-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #9ca3af;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 8px;
  flex-shrink: 0;
}

.action-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
