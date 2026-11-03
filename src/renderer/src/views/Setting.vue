<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// 表单数据
const form = ref({
  apiKey: '',
  baseUrl: 'http://127.0.0.1:11434/v1',
  model: 'qwen2.5:7b',
  volcAppId: '',
  volcAccessToken: '',
  volcVoiceType: 'zh_female_vv_uranus_bigtts'
})

const isSaving = ref(false)
const isLoading = ref(true)

// ========== 缓存管理状态 ==========
const cacheInfo = ref({ count: 0, sizeBytes: 0 })
const isClearing = ref(false)

// 自动格式化缓存大小
const displaySize = computed(() => {
  if (cacheInfo.value.sizeBytes === 0) return '0 KB'
  if (cacheInfo.value.sizeBytes > 1024 * 1024) {
    return `${(cacheInfo.value.sizeBytes / 1024 / 1024).toFixed(2)} MB`
  }
  return `${(cacheInfo.value.sizeBytes / 1024).toFixed(1)} KB`
})

// 页面挂载时，读取本地已有的配置
onMounted(async () => {
  await fetchConfig()
  await fetchCacheStats()
})

// 提取出加载配置的方法
async function fetchConfig(): Promise<void> {
  isLoading.value = true
  try {
    const config = await window.settingApi.getConfig()
    if (config) {
      form.value.apiKey = config.key || ''
      // 👇 如果本地没配置，默认填入本地 Ollama 的地址和模型
      form.value.baseUrl = config.url || 'http://127.0.0.1:11434/v1'
      form.value.model = config.model || 'qwen2.5:7b'
      form.value.volcAppId = config.volcAppId || ''
      form.value.volcAccessToken = config.volcAccessToken || ''
      form.value.volcVoiceType = config.volcVoiceType || 'zh_female_vv_uranus_bigtts'
    }
  } catch (err) {
    console.error('读取配置失败:', err)
  } finally {
    isLoading.value = false
  }
}

// 获取缓存状态
async function fetchCacheStats(): Promise<void> {
  try {
    const stats = await window.settingApi.getCacheStats()
    if (stats) {
      cacheInfo.value = stats
    }
  } catch (err) {
    console.error('读取缓存状态失败:', err)
  }
}

// 一键清空缓存
async function handleClearCache(): Promise<void> {
  if (!confirm('确定要清空所有的语音缓存吗？清空后下次说话会重新请求云端。')) return

  isClearing.value = true
  try {
    await window.settingApi.clearCache()
    await fetchCacheStats()
    alert('缓存已清理完毕！')
  } catch (err) {
    console.error('清理缓存失败:', err)
    alert('清理失败')
  } finally {
    isClearing.value = false
  }
}

// 点击保存按钮
const handleSave = async (): Promise<void> => {
  // 👇 智能校验：如果是云端地址且没有 Key，才拦截
  const isLocal = form.value.baseUrl.includes('127.0.0.1') || form.value.baseUrl.includes('localhost')

  if (!form.value.apiKey.trim() && !isLocal) {
    alert('使用云端 API 时，API Key 不能为空')
    return
  }

  isSaving.value = true
  try {
    await window.settingApi.saveConfig({
      key: form.value.apiKey.trim(),
      url: form.value.baseUrl.trim(),
      model: form.value.model,
      volcAppId: form.value.volcAppId.trim(),
      volcAccessToken: form.value.volcAccessToken.trim(),
      volcVoiceType: form.value.volcVoiceType
    })
    alert('配置保存成功！')
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
    <h2>API 与语音配置</h2>
    <p class="description">配置大模型 API 与语音合成凭证。</p>

    <form v-if="!isLoading" @submit.prevent="handleSave" class="settings-form">
      <div class="form-group">
        <label for="api-key">API Key</label>
        <input
          id="api-key"
          v-model="form.apiKey"
          type="password"
          placeholder="云端填 sk-... / 本地 Ollama 留空"
        />
        <span class="hint">使用本地大模型时，此项可留空</span>
      </div>

      <div class="form-group">
        <label for="base-url">Base URL</label>
        <input
          id="base-url"
          v-model="form.baseUrl"
          type="url"
          placeholder="https://api.deepseek.com 或 http://127.0.0.1:11434/v1"
          required
        />
        <span class="hint">本地运行 Ollama 请填 http://127.0.0.1:11434/v1</span>
      </div>

      <div class="form-group">
        <label for="model">大模型模型 (Model)</label>
        <!-- 👇 把原本的 select 换成了 input -->
        <input
          id="model"
          v-model="form.model"
          type="text"
          placeholder="deepseek-chat 或 qwen2.5:7b"
          required
        />
        <span class="hint">填入你要使用的模型名，如 qwen2.5:7b</span>
      </div>

      <div class="form-group">
        <label>火山引擎 APP ID</label>
        <input v-model="form.volcAppId" type="text" placeholder="输入 APP ID" />
      </div>

      <div class="form-group">
        <label>火山引擎 Access Token</label>
        <input v-model="form.volcAccessToken" type="password" placeholder="输入 Access Token" />
      </div>

      <div class="form-group">
        <label>豆包语音音色</label>
        <select v-model="form.volcVoiceType">
          <option value="zh_female_vv_uranus_bigtts">Vivi 2.0 (自然少女)</option>
          <option value="zh_female_tianmeixiaoyuan_moon_bigtts">甜美小源 (超甜萌妹)</option>
          <option value="zh_female_wanwanxiaohe_moon_bigtts">湾湾小何 (台湾软糯)</option>
        </select>
      </div>

      <div class="actions">
        <button type="submit" class="save-btn" :disabled="isSaving">
          {{ isSaving ? '保存中...' : '保存配置' }}
        </button>
      </div>
    </form>

    <div v-else class="loading">
      正在读取配置...
    </div>

    <!-- 缓存管理区域 -->
    <div v-if="!isLoading" class="cache-section">
      <h3>存储与缓存管理</h3>
      <div class="cache-info">
        <span>当前已缓存语音：{{ cacheInfo.count }} 条（占用 {{ displaySize }}）</span>
        <button
          class="clear-btn"
          @click="handleClearCache"
          :disabled="isClearing || cacheInfo.count === 0"
        >
          {{ isClearing ? '清理中...' : '清空语音缓存' }}
        </button>
      </div>
      <p class="hint" style="margin-top: 8px;">
        清空后，下一次宠物说话将重新请求云端合成。缓存上限自动限制在 50MB 内。
      </p>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  padding: 32px;
  background: #ffffff;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
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
  border-color: #10b981;
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

/* 👇 缓存区域样式 */
.cache-section {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px dashed #e5e7eb;
}

.cache-section h3 {
  font-size: 16px;
  color: #333;
  margin-top: 0;
  margin-bottom: 16px;
}

.cache-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
}

.cache-info span {
  font-size: 14px;
  color: #4b5563;
}

.clear-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-btn:hover:not(:disabled) {
  background: #dc2626;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #9ca3af;
}
</style>
