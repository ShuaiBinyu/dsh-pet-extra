<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 表单数据，严格对应 DeepSeek API 的必填项
const form = ref({
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  model: 'deepseek-flash' // 官方推荐的新模型名 [citation:1][citation:2]
})

// 加载状态，防止重复点击
const isSaving = ref(false)
const isLoading = ref(true)

// 页面挂载时，读取本地已有的配置
onMounted(async () => {
  try {
    const config = await window.settingApi.getConfig()
    if (config) {
      form.value.apiKey = config.key || ''
      // 如果本地存的 url 是空的，保留默认的官方地址
      form.value.baseUrl = config.url || 'https://api.deepseek.com' 
      // 注意：如果你之前的 configApi 没有存 model 字段，这里也会是默认值
      form.value.model = config.model || 'deepseek-flash' // 👈 加上这行
    }
  } catch (err) {
    console.error('读取配置失败:', err)
  } finally {
    isLoading.value = false
  }
})

// 点击保存按钮
const handleSave = async (): Promise<void> => {
  // 简单校验：API Key 不能为空
  if (!form.value.apiKey.trim()) {
    alert('API Key 不能为空')
    return
  }

  isSaving.value = true
  try {
    // 调用 preload 暴露的 settingApi 保存配置
    await window.settingApi.saveConfig({
      key: form.value.apiKey.trim(),
      url: form.value.baseUrl.trim(),
      model: form.value.model // 👈 解开注释，把 model 传过去
    })
    
    // 保存成功后的反馈
    alert('配置保存成功！')
    
    // 可选：保存后自动关闭当前设置窗口
    // window.close() 
  } catch (err) {
    console.error('保存配置失败:', err)
    alert('保存失败，请查看控制台')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="settings-container">
    <h2>DeepSeek API 配置</h2>
    <p class="description">配置你的 API 密钥，以便桌宠与你进行智能对话。</p>

    <form v-if="!isLoading" @submit.prevent="handleSave" class="settings-form">
      <!-- 1. API Key (密码输入框) -->
      <div class="form-group">
        <label for="api-key">API Key</label>
        <input 
          id="api-key"
          v-model="form.apiKey" 
          type="password" 
          placeholder="sk-..." 
          required
        />
        <span class="hint">在 DeepSeek 开放平台申请</span>
      </div>

      <!-- 2. Base URL (接口地址) -->
      <div class="form-group">
        <label for="base-url">Base URL</label>
        <input 
          id="base-url"
          v-model="form.baseUrl" 
          type="url" 
          placeholder="https://api.deepseek.com" 
          required
        />
        <span class="hint">通常无需修改，保持默认即可</span>
      </div>

      <!-- 3. Model (模型名称) -->
      <div class="form-group">
        <label for="model">模型 (Model)</label>
        <select id="model" v-model="form.model">
          <option value="deepseek-flash">deepseek-flash (快速/推荐)</option>
          <option value="deepseek-v4-pro">deepseek-v4-pro (旗舰)</option>
        </select>
        <span class="hint">不同模型在速度与能力上有所区别</span>
      </div>

      <!-- 保存按钮 -->
      <div class="actions">
        <button type="submit" class="save-btn" :disabled="isSaving">
          {{ isSaving ? '保存中...' : '保存配置' }}
        </button>
      </div>
    </form>
    
    <div v-else class="loading">
      正在读取配置...
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  padding: 32px;
  background: #ffffff;
  height: 100vh;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

h2 {
  margin-top: 0;
  color: #1a1a1a;
  font-size: 24px;
}

.description {
  color: #666;
  font-size: 14px;
  margin-bottom: 24px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

input, select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  outline: none;
}

input:focus, select:focus {
  border-color: #10b981; /* 与你的桌宠主题色呼应 */
}

.hint {
  font-size: 12px;
  color: #999;
}

.actions {
  margin-top: 10px;
}

.save-btn {
  width: 100%;
  padding: 12px;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: #059669;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  color: #999;
  margin-top: 50px;
}
</style>