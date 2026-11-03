<script setup lang="ts">
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'

// 👇 1. 引入全局系统状态（用于判断用户是否在忙）
import { useSystemState } from '../composables/useSystemState'
const { isUserIdle } = useSystemState()

// ========== 气泡逻辑 ==========
import { usePetBubble } from '../composables/usePetBubble'
const {
  showBubble,
  bubbleText,
  bubbleStyle,
  bubbleClass,
  onAnimEnd,
  markClickNeedBubble,
  cancelPendingBubble,
  popBubble,
  onNeedBubble,
} = usePetBubble()

// ========== 宠物动画与行为逻辑 ==========
import PetAnimation from './PetAnimation.vue'
import { usePetBehavior } from '../composables/usePetBehavior.js'
const { current, onEnded, onClick, onDoubleClick } = usePetBehavior()

import { usePetDrag } from '../composables/usePetDrag.js'
const { dragging, onMouseDown } = usePetDrag()

import { usePetMotion } from '../composables/usePetMotion.js'
const { start: startMotion, stop: stopMotion } = usePetMotion()

const ANIMATION_DURATION = 10
const videoDuration = ref(10)
function handleDuration(d: number): void {
  videoDuration.value = d
}

// 监听动画变化
watch(current, (next) => {
  stopMotion()
  if (next?.motion && !dragging.value) {
    startMotion(next.motion, ANIMATION_DURATION)
  }
}, { immediate: true })

// 监听拖拽状态
watch(dragging, (isDragging) => {
  if (isDragging) {
    stopMotion()
  } else if (current.value?.motion) {
    startMotion(current.value.motion, ANIMATION_DURATION)
  }
})

// ========== ✨ 核心：音画同步与打断逻辑 ==========
let currentAudio: HTMLAudioElement | null = null // 👈 保存当前正在播放的音频实例

const sayAndBubble = async (text: string): Promise<void> => {
  if (!text) return

  // 如果上一句还没说完又来了新的一句，先掐断上一句
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }

  try {
    // 1. 先去请求语音（这时候气泡还不出来，防止嘴型比声音快）
    const res = await window.petApi.generateVoice(text)

    // 2. 语音拿到了，立刻！同时！做两件事：
    if (res.success && res.audioBase64) {
      const audioUrl = `data:audio/mp3;base64,${res.audioBase64}`
      const audio = new Audio(audioUrl)

      currentAudio = audio // 保存实例

      // 播放声音
      audio.play().catch(e => console.warn('播放被拦截（需要先点一下屏幕）:', e))

      // 播放结束后清空实例
      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null
      }

      // 弹出气泡
      popBubble(text)
    } else {
      // 如果语音生成失败了，没声音也得弹气泡
      popBubble(text)
    }
  } catch (err) {
    console.error('语音请求失败', err)
    popBubble(text) // 兜底：网络断了也得让宠物说话
  }
}

// 👇 核心监听：当用户开始干活时，立刻打断当前语音并隐藏气泡
watch(isUserIdle, (idle) => {
  if (!idle && currentAudio) {
    console.log('【Pet】检测到用户活跃，立刻打断语音')
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
    showBubble.value = false // 气泡也一并消失
  }
})

// ========== 鼠标点击与拖拽事件 ==========
let downX = 0
let downY = 0

function handleMouseDown(e: MouseEvent): void {
  if (e.button === 0 && showContextMenu.value) {
    showContextMenu.value = false
    return
  }

  if (e.button !== 0) return // 只处理左键

  downX = e.screenX
  downY = e.screenY
  onMouseDown(e)
}

let clickTimer: ReturnType<typeof setTimeout> | null = null

function handleClick(e: MouseEvent): void {
  const dx = e.screenX - downX
  const dy = e.screenY - downY
  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) return

  markClickNeedBubble()

  if (clickTimer) clearTimeout(clickTimer)
  clickTimer = setTimeout(() => {
    onClick()
    clickTimer = null
  }, 250)
}

function handleDoubleClick(e: MouseEvent): void {
  console.log('宠物被双击了！')
  const dx = e.screenX - downX
  const dy = e.screenY - downY
  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) return

  if (clickTimer) {
    clearTimeout(clickTimer)
    clickTimer = null
  }
  cancelPendingBubble()
  onDoubleClick()
}

const hitAreaStyle = computed(() => ({
  left: '175px',
  top: '150px',
  width: '150px',
  height: '200px',
}))

// ========== 右键菜单逻辑 ==========
const showContextMenu = ref(false)
const menuPos = ref({ x: 0, y: 0 })

const handleOpenChat = async (): Promise<void> => {
  showContextMenu.value = false
  try {
    await window.chatApi?.openChatWindow()
  } catch (err) {
    console.error('打开聊天窗口失败：', err)
  }
}

const handleOpenConfig = async (): Promise<void> => {
  showContextMenu.value = false
  try {
    await window.settingApi?.openSettingsWindow()
  } catch (err) {
    console.error('打开设置窗口失败：', err)
  }
}

function handleRightClick(e: MouseEvent): void {
  e.preventDefault()
  e.stopPropagation()

  stopMotion() // 叫停动画，窗口定住

  const menuWidth = 120
  const menuHeight = 120

  let x = e.clientX
  let y = e.clientY

  if (x + menuWidth > window.innerWidth) x -= menuWidth
  if (y + menuHeight > window.innerHeight) y -= menuHeight

  menuPos.value = { x, y }
  showContextMenu.value = true
}

function closeMenu(): void {
  if (showContextMenu.value) {
    showContextMenu.value = false
  }
}

// ========== ✨ 鼠标穿透逻辑 ==========
let isIgnoring = true

function updateMouseIgnore(e?: MouseEvent): void {
  if (showContextMenu.value) {
    if (isIgnoring) {
      window.petApi.setIgnoreMouseEvents(false)
      isIgnoring = false
    }
    return
  }

  if (!e) {
    if (!isIgnoring) {
      window.petApi.setIgnoreMouseEvents(true, { forward: true })
      isIgnoring = true
    }
    return
  }

  const hitArea = document.querySelector('.pet-hit-area') as HTMLElement
  if (!hitArea) return

  const rect = hitArea.getBoundingClientRect()
  const isInside =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom

  if (isInside) {
    if (isIgnoring) {
      window.petApi.setIgnoreMouseEvents(false)
      isIgnoring = false
    }
  } else {
    if (!isIgnoring) {
      window.petApi.setIgnoreMouseEvents(true, { forward: true })
      isIgnoring = true
    }
  }
}

// ✅ 处理退出逻辑
const handleQuit = (): void => {
  showContextMenu.value = false
  window.petApi?.quitApp()
}

// ========== 生命周期与状态监听 ==========
watch(showContextMenu, (isOpen) => {
  updateMouseIgnore()

  if (isOpen) {
    document.documentElement.addEventListener('mouseleave', closeMenu)
  } else {
    document.documentElement.removeEventListener('mouseleave', closeMenu)
  }
})

onMounted(() => {
  window.petApi.setIgnoreMouseEvents(true, { forward: true })
  window.addEventListener('mousemove', updateMouseIgnore)
  window.addEventListener('blur', closeMenu)

  // 注册语音+气泡的组合方法
  onNeedBubble.value = sayAndBubble

  // 破解浏览器音频播放限制
  const unlockAudio = (): void => {
    const audio = new Audio()
    audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'
    audio.play().catch(() => {})
    document.removeEventListener('click', unlockAudio)
  }
  document.addEventListener('click', unlockAudio)
})

onUnmounted(() => {
  if (clickTimer) clearTimeout(clickTimer)
  window.removeEventListener('mousemove', updateMouseIgnore)
  window.removeEventListener('blur', closeMenu)
  document.documentElement.removeEventListener('mouseleave', closeMenu)

  // 👇 卸载时，清理音频资源
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }

  // 卸载时注销回调
  onNeedBubble.value = null
})
</script>

<template>
  <div class="pet-container" :class="{ dragging }">
    <div class="motion-layer">
      <Transition name="pet-squash" @after-enter="onAnimEnd">
        <PetAnimation
          v-if="current"
          :key="current.id"
          :animation="current"
          @ended="onEnded"
          @duration="handleDuration"
        />
      </Transition>

      <div v-if="showBubble" class="bubble" :class="bubbleClass" :style="bubbleStyle">
        {{ bubbleText }}
      </div>

      <div
        class="pet-hit-area"
        :style="hitAreaStyle"
        @mousedown="handleMouseDown"
        @click="handleClick"
        @dblclick="handleDoubleClick"
        @contextmenu="handleRightClick"
      />
    </div>
  </div>

  <!-- 右键菜单 -->
  <div
    v-if="showContextMenu"
    class="context-menu"
    :style="{ left: menuPos.x + 'px', top: menuPos.y + 'px' }"
    @mousedown.stop
    @contextmenu.stop
  >
    <div class="menu-item" @click="handleOpenChat">打开聊天窗口</div>
    <div class="menu-item" @click="handleOpenConfig">配置 API</div>
    <div class="menu-item" style="color: #ff4d4f;" @click="handleQuit">退出桌宠</div>
  </div>
</template>

<style scoped>
.pet-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  pointer-events: none;
  -webkit-user-select: none;
}

.pet-container.dragging {
  cursor: grabbing;
}

.motion-layer {
  position: relative;
  display: inline-block;
  width: 100%;
  height: 100%;
}

.pet-hit-area {
  position: absolute;
  pointer-events: auto;
}

/* 过渡动画 */
.pet-squash-enter-active,
.pet-squash-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: center center;
}
.pet-squash-leave-active {
  transition: all 0.15s ease-in;
}
.pet-squash-leave-to {
  transform: scale(0);
  opacity: 0;
}
.pet-squash-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pet-squash-enter-from {
  transform: scale(0);
  opacity: 0;
}
.pet-squash-enter-to,
.pet-squash-leave-from {
  transform: scale(1);
  opacity: 1;
}

/* 气泡基础样式 */
.bubble {
  position: absolute;
  padding: 8px 13px;
  font-size: 17px;
  max-width: 180px;
  white-space: normal;
  word-break: break-word;
  pointer-events: none;
  z-index: 99;
  animation: fadeIn 0.3s ease;
}
.bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -8px;
  transform: translateX(-50%);
  border-width: 8px 8px 0;
  border-style: solid;
}

/* 气泡主题 */
.bubble-normal { background: #ffffff; color: #333333; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); }
.bubble-normal::after { border-color: #fff transparent transparent; }

.bubble-yellow { background: #fff8d9; color: #5c4826; border-radius: 12px; box-shadow: 0 2px 8px rgba(180, 140, 60, 0.2); }
.bubble-yellow::after { border-color: #fff8d9 transparent transparent; }

.bubble-blue { background: #e8f4ff; color: #244e75; border-radius: 12px; box-shadow: 0 2px 8px rgba(60, 130, 200, 0.2); }
.bubble-blue::after { border-color: #e8f4ff transparent transparent; }

.bubble-cloud { background: #fefefe; color: #444444; border-radius: 20px; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12); border: 1px solid #eee; }
.bubble-cloud::after { border-color: #fefefe transparent transparent; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  z-index: 99999;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  padding: 4px 0;
  min-width: 120px;
}
.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}
.menu-item:hover {
  background: #f0f0f0;
}
</style>
