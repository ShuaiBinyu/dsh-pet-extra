<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// 控制动画
import PetAnimation from './PetAnimation.vue'
import { usePetBehavior } from '../composables/usePetBehavior.js'
const { current, onEnded, onClick } = usePetBehavior()

// 鼠标拖动桌宠
import { usePetDrag } from '../composables/usePetDrag.js'
const { dragging, onMouseDown } = usePetDrag()

// 自动移动（播放动画时按 motion.dx/dy 移动窗口）
import { usePetMotion } from '../composables/usePetMotion.js'
const { start: startMotion, stop: stopMotion } = usePetMotion()

// 所有动画统一 10 秒
const ANIMATION_DURATION = 10

// 切换动画时启动自动移动
watch(current, (next) => {
  stopMotion()
  if (next?.motion && !dragging.value) {
    startMotion(next.motion, ANIMATION_DURATION)
  }
}, { immediate: true })

// 拖拽时暂停自动移动，松手恢复
watch(dragging, (isDragging) => {
  if (isDragging) {
    stopMotion()
  } else if (current.value?.motion) {
    startMotion(current.value.motion, ANIMATION_DURATION)
  }
})

// 记录 mousedown 时的屏幕坐标（用 screenX/Y，与 usePetDrag 保持一致）
let downX = 0
let downY = 0

function handleMouseDown(e: MouseEvent) {
  downX = e.screenX
  downY = e.screenY
  onMouseDown(e)   // 原拖动逻辑照常
}
// 处理点击，点击包含mouseDown和mouseUp，不处理的话，在拖动过程中也会触发
function handleClick(e: MouseEvent) {
  const dx = e.screenX - downX
  const dy = e.screenY - downY
  // 位移超过 5px 视为拖动，不算点击
  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) return
  onClick()
}

// 视频时长（秒），默认 1 避免除零/时长为 0
const videoDuration = ref(10)

function handleDuration(d: number) {
  videoDuration.value = d
}

// 热区 = 人物画面在窗口里的实际矩形
const hitAreaStyle = computed(() => {
  // 这里需要知道人物画面在窗口里的位置和大小
  // 如果人物是居中 300×300，窗口 500×500：
  return {
    left: '175px',
    top: '150px',
    width: '150px',
    height: '200px',
  }
})
</script>

<template>
  <div
    class="pet-container"
    :class="{ dragging }"
  >
    <div
      v-if="current"
      class="motion-layer"
      :key="current.id"
    >
      <PetAnimation
        :animation="current"
        @ended="onEnded"
        @duration="handleDuration"
      />
      <!-- 热区：只有这块接收鼠标 -->
      <div
        class="pet-hit-area"
        :style="hitAreaStyle"
        @mousedown="handleMouseDown"
        @click="handleClick"
      />
    </div>
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
  pointer-events: none;   /* 容器不接收，穿透 */
  -webkit-user-select: none;
}

.pet-hit-area {
  position: absolute;
  pointer-events: auto;   /* 只有热区接收 */
  /* 位置和大小由 hitAreaStyle 决定 */
}

.pet-container.dragging {
  cursor: grabbing;
}

.motion-layer {
  width: 100%;
  height: 100%;
}
</style>