import Store from 'electron-store'

// 👇 1. 新增：定义聊天消息的严格类型（必须放在 ConfigSchema 前面）
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// 定义我们要存储的配置数据结构
export interface ConfigSchema {
  deepseekApiKey: string
  deepseekApiUrl: string
  deepseekModel: string
  chat_history: ChatMessage[] // 👈 2. 加上聊天记录的字段
}

// 实例化并导出 store
const store = new Store<ConfigSchema>({
  name: 'pet-config', // 会在系统目录下生成 pet-config.json 文件
  // encryptionKey: 'your-secret-key', // 可选：如果你想让配置文件变成乱码，可以开启加密，随便写个密钥
  defaults: {
    deepseekApiKey: '',
    deepseekApiUrl: 'https://api.deepseek.com',
    deepseekModel: 'deepseek-flash',
    chat_history: [] // 👈 3. 默认给一个空数组
  }
})

export default store