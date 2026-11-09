<script setup lang="ts">
// Pet.vue 是整个桌宠主容器
// 负责整合业务，并把状态连接到视觉子组件
// 具体业务逻辑由其他模块进行负责
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'

// 1. 引入全局系统状态（用于判断用户是否在忙）
import { useSystemState } from '../composables/useSystemState'
const { isUserIdle } = useSystemState()

// 2.获取桌宠的状态和控制函数。
import { usePetBubble } from '../composables/usePetBubble'
const {
  showBubble, // 控制气泡显示
  bubbleText, // 气泡文本
  bubbleStyle, // 气泡位置
  bubbleClass, // 气泡样主题
  onAnimEnd,
  markClickNeedBubble,
  cancelPendingBubble,
  popBubble,
  onNeedBubble,
} = usePetBubble()

// 3.宠物气泡
import PetAnimationView from './PetAnimationView.vue'
import PetBubble from './PetBubble.vue'
import PetInteractionLayer from './PetInteractionLayer.vue'
import PetContextMenu from './PetContextMenu.vue'
import { usePetBehavior } from '../composables/usePetBehavior.js'
const { current, onEnded, onClick, onDoubleClick } = usePetBehavior()

import { usePetDrag } from '../composables/usePetDrag.js'
const { dragging, onMouseDown } = usePetDrag()

import { usePetMotion } from '../composables/usePetMotion.js'
const {
  start: startMotion,
  pause: pauseMotion,
  resume: resumeMotion,
  stop: stopMotion,
} = usePetMotion()

import { usePetContextMenu } from '../composables/usePetContextMenu.js'
const {
  showContextMenu,
  menuPos,
  handleRightClick,
  closeMenu,
  handleOpenChat,
  handleOpenConfig,
  handleQuit,
} = usePetContextMenu({ stopMotion })

import { usePetInteraction } from '../composables/usePetInteraction.js'
const { handleMouseDown, handleClick, handleDoubleClick } = usePetInteraction({
  showContextMenu,
  onMouseDown,
  onClick,
  onDoubleClick,
  markClickNeedBubble,
  cancelPendingBubble,
  closeMenu,
})

import { usePetMouseThrough } from '../composables/usePetMouseThrough.js'
usePetMouseThrough({ showContextMenu })

import { usePetAudio } from '../composables/usePetAudio.js'
usePetAudio({
  isUserIdle,
  showBubble,
  popBubble,
  onNeedBubble,
})

// 当前视频的有效播放时长，单位：秒。
// 动画配置存在时会立即提供时长，避免等待 video 元数据导致启动时序错误。
const videoDuration = ref<number | null>(null)
// 接收视频实际时长，校验动画配置，并在缺少配置时启动位移动画。
function handleDuration(actualDuration: number): void {
  if (!Number.isFinite(actualDuration) || actualDuration <= 0) return

  const configuredDuration = current.value?.duration

  if (
    configuredDuration !== undefined &&
    Math.abs(configuredDuration - actualDuration) > 0.05
  ) {
    console.warn('动画配置时长与视频实际时长不一致', {
      id: current.value?.id,
      configuredDuration,
      actualDuration,
    })
  }

  // 配置时长是动画行为的业务参数；配置缺失时才使用视频实际时长兜底。
  videoDuration.value = configuredDuration ?? actualDuration

  // 没有配置时，等 video.duration 到达后才首次启动位移。
  if (configuredDuration === undefined && current.value?.motion && !dragging.value) {
    stopMotion()
    startMotion(current.value.motion, videoDuration.value)
  }
}

// 监听动画变化
watch(current, (next) => {
  stopMotion()

  // 切换动画时优先使用新动画自己的配置，避免沿用上一个视频的时长。
  videoDuration.value = next?.duration ?? null

  if (next?.motion && !dragging.value && videoDuration.value !== null) {
    startMotion(next.motion, videoDuration.value)
  }
}, { immediate: true })

// 监听拖拽状态
watch(dragging, (isDragging) => {
  if (isDragging) {
    // 只有确认发生真实拖拽后才暂停，并保留自动移动进度。
    pauseMotion()
  } else if (current.value?.motion && videoDuration.value !== null) {
    // 拖拽结束后从暂停位置继续当前自动移动。
    resumeMotion()
  }
}, { flush: 'sync' })

const hitAreaStyle = computed(() => ({
  left: '175px',
  top: '150px',
  width: '150px',
  height: '200px',
}))

// ========== 生命周期与状态监听 ==========
onMounted(() => {
  window.addEventListener('blur', closeMenu)
})

onUnmounted(() => {
  window.removeEventListener('blur', closeMenu)
})
</script>

<template>
  <div class="pet-container" :class="{ dragging }">
    <div class="motion-layer">
      <!-- 核心动画组件：接收当前动画，并把播放结束和市场通知给Pet.vue -->
      <PetAnimationView
        v-if="current"
        :animation="current"
        :paused="dragging"
        @ended="onEnded"
        @duration="handleDuration"
        @transition-entered="onAnimEnd"
      />

      <PetBubble
        v-if="showBubble"
        :text="bubbleText"
        :class-name="bubbleClass"
        :style="bubbleStyle"
      />

      <PetInteractionLayer
        :style="hitAreaStyle"
        @mousedown="handleMouseDown"
        @click="handleClick"
        @dblclick="handleDoubleClick"
        @contextmenu="handleRightClick"
      />
    </div>
  </div>

  <!-- 右键菜单 -->
  <PetContextMenu
    v-if="showContextMenu"
    :position="menuPos"
    @open-chat="handleOpenChat"
    @open-config="handleOpenConfig"
    @quit="handleQuit"
  />
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

</style>
