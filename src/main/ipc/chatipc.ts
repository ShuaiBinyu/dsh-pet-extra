import { ipcMain } from 'electron'
import { createChatWindow, destroyChatWindow } from '../windows/chatWindow'
import store,  { type ChatMessage } from '../utils/store'

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
      const apiKey = store.get('deepseekApiKey') as string
      const apiUrl = (store.get('deepseekApiUrl') as string) || 'https://api.deepseek.com'
      const model = (store.get('deepseekModel') as string) || 'deepseek-flash'

      if (!apiKey) {
        return { success: false, error: '请先在右键菜单 -> 设置中配置 API Key' }
      }

      // ---- 2. 获取真实系统时间（注入给 AI 的环境感知） ----
      const now = new Date()
      const dateStr = now.toLocaleDateString('zh-CN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
      const timeStr = now.toLocaleTimeString('zh-CN')

      // ---- 3. 构建上下文历史记录（持久化 + 滑动窗口） ----
      // 每次请求前，从本地仓库读取历史聊天记录（如果没有，就初始化一个系统设定）
      let chatHistory = store.get('chat_history') as ChatMessage[] | undefined

      if (!chatHistory || chatHistory.length === 0) {
        chatHistory = [
          {
            role: 'system',
            // 核心提示词：严格限制它的回答范围，并告诉它当前时间
            content: `你是一个名叫 DsPet 的桌面宠物。当前时间是：${dateStr} ${timeStr}。
请用简短、活泼、略带俏皮的话语回答主人的问题。
【严格铁律】：
1. 必须认真、准确地回答主人的问题。
2. 如果不知道答案或者没有相关数据（比如天气、身体状态），请直接坦诚地告诉主人你不知道，绝对不要为了卖萌而胡编乱造！
3. 无论怎么回答，请保持自称“DsPet”或“我”。`
          }
        ]
      } else {
        // 如果历史记录已存在，把 system 里的时间更新成“现在”的真实时间
        chatHistory[0].content = `你是一个名叫 DsPet 的桌面宠物。当前时间是：${dateStr} ${timeStr}。
请用简短、活泼、略带俏皮的话语回答主人的问题。
【严格铁律】：
1. 必须认真、准确地回答主人的问题。
2. 如果不知道答案或者没有相关数据，请直接坦诚地告诉主人你不知道，绝对不要为了卖萌而胡编乱造！`
      }

      // 将用户的最新输入推入历史
      chatHistory.push({ role: 'user', content: userMessage })

      // 👇 核心防炸机制：滑动窗口（限制上下文长度）
      // 保持第 0 位是 system，后面只保留最近的 20 条对话（防止 Token 爆炸和 AI 变鱼）
      const MAX_HISTORY = 21
      if (chatHistory.length > MAX_HISTORY) {
        // 截取：保留 system（索引0） + 最近 20 条记录
        chatHistory = [chatHistory[0], ...chatHistory.slice(-(MAX_HISTORY - 1))]
      }

      // ---- 4. 发起 API 请求 ----
      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: chatHistory // 发送整理好的上下文
        })
      })

      const data = await response.json()

      // 处理 API 错误
      if (!response.ok) {
        console.error('DeepSeek API 报错:', data)
        return {
          success: false,
          error: data.error?.message || `请求失败，状态码：${response.status}`
        }
      }

      // ---- 5. 成功返回并更新本地记忆 ----
      const aiReply = data.choices[0].message.content

      // 把 AI 的回复也推入历史
      chatHistory.push({ role: 'assistant', content: aiReply })

      // 👇 将最新的完整历史存回本地磁盘！(这样关掉窗口再打开，它还记得)
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

  // 👇 新增：获取历史聊天记录
  ipcMain.handle('get-chat-history', () => {
    const history = store.get('chat_history') as ChatMessage[] || []
    // 过滤掉 system 提示词，只把用户的对话返回给前端
    return history.filter(msg => msg.role !== 'system')
  })
  // 👇 额外赠送：清空聊天记录的 IPC (方便你在前端做个“清空记忆”按钮)
  ipcMain.handle('clear-chat-history', () => {
    store.delete('chat_history')
    return true
  })
  // 在 registerChatIpc 里加上：
  ipcMain.on('destroy-chat-window', () => {
    console.log('彻底销毁聊天窗口')
    destroyChatWindow()
  })
}
