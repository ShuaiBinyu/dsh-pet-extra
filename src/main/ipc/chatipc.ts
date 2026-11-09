import { ipcMain } from 'electron'
import { createChatWindow, destroyChatWindow } from '../windows/chatWindow'
import store, { getSecureStore, type ChatMessage } from '../utils/store'

// 注册聊天窗口相关 IPC，包括打开、销毁、消息发送和历史记录操作。
export function registerChatIpc(): void {
  // 1. 打开聊天窗口
  ipcMain.handle('open-chat-window', (): number => {
    console.log('=== 收到打开聊天窗口请求 ===')
    const chatWin = createChatWindow()
    return chatWin.id
  })

  // 2. 处理 AI 对话请求
  ipcMain.handle('send-message', async (_, userMessage: string) => {
    try {
      // ---- 1. 读取配置 ----
      const apiKey = getSecureStore('deepseekApiKey')
      const apiUrl = (store.get('deepseekApiUrl') as string) || 'https://api.deepseek.com'
      const model = (store.get('deepseekModel') as string) || 'deepseek-chat'

      // 判断是否是本地地址
      const isLocal = apiUrl.includes('127.0.0.1') || apiUrl.includes('localhost')

      // 如果没填 Key，且不是本地地址，才拦截
      if (!apiKey && !isLocal) {
        return { success: false, error: '请先在右键菜单 -> 设置中配置 API Key' }
      }

      // ---- 2. 获取真实系统时间 ----
      const now = new Date()
      const dateStr = now.toLocaleDateString('zh-CN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
      const timeStr = now.toLocaleTimeString('zh-CN')

      // ---- 3. 构建系统提示词（人设）----
      // 👇 提取出来，避免下面 if/else 写两遍
      const petPrompt = `你是一个名叫 DsPet 的桌面宠物。当前时间是：${dateStr} ${timeStr}。
请用简短、活泼、略带俏皮的话语回答主人的问题。
【严格铁律】：
1. 必须认真、准确地回答主人的问题。
2. 如果不知道答案或者没有相关数据（比如天气、身体状态），请直接坦诚地告诉主人你不知道，绝对不要为了卖萌而胡编乱造！
3. 无论怎么回答，请保持自称“DsPet”或“我”。`

      // ---- 4. 构建上下文历史记录 ----
      let chatHistory = store.get('chat_history') as ChatMessage[] | undefined

      if (!chatHistory || chatHistory.length === 0) {
        chatHistory = [{ role: 'system', content: petPrompt }]
      } else {
        // 每次对话前，更新系统提示词（刷新时间）
        chatHistory[0].content = petPrompt
      }

      // 将用户的最新输入推入历史
      chatHistory.push({ role: 'user', content: userMessage })

      // 滑动窗口限制上下文长度
      const MAX_HISTORY = 21
      if (chatHistory.length > MAX_HISTORY) {
        chatHistory = [chatHistory[0], ...chatHistory.slice(-(MAX_HISTORY - 1))]
      }

      // ---- 5. 发起 API 请求 ----
      // 👇 核心修复：动态生成 Headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      // 只有存在 Key 的时候，才加上 Authorization 请求头（防止本地 Ollama 报错）
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: model,
          messages: chatHistory
        })
      })

      const data = await response.json()

      // 处理 API 错误
      if (!response.ok) {
        console.error('API 报错:', data)
        return {
          success: false,
          error: data.error?.message || `请求失败，状态码：${response.status}`
        }
      }

      // ---- 6. 成功返回并更新本地记忆 ----
      const aiReply = data.choices[0].message.content

      // 把 AI 的回复也推入历史
      chatHistory.push({ role: 'assistant', content: aiReply })

      // 存回本地磁盘
      store.set('chat_history', chatHistory)

      return {
        success: true,
        content: aiReply
      }

    } catch (error) {
      console.error('网络请求异常:', error)
      const errorMessage = error instanceof Error ? error.message : '网络异常，请稍后再试'
      return { success: false, error: errorMessage }
    }
  })

  // 👇 获取历史聊天记录
  ipcMain.handle('get-chat-history', () => {
    const history = (store.get('chat_history') as ChatMessage[]) || []
    return history.filter(msg => msg.role !== 'system')
  })

  // 👇 清空聊天记录
  ipcMain.handle('clear-chat-history', () => {
    store.delete('chat_history')
    return true
  })

  // 彻底销毁聊天窗口
  ipcMain.on('destroy-chat-window', () => {
    console.log('彻底销毁聊天窗口')
    destroyChatWindow()
  })
}
