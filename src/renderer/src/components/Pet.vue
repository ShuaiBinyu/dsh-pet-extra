<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// 控制动画
import PetAnimation from './PetAnimation.vue'
import { usePetBehavior } from '../composables/usePetBehavior.js'
const { current, onEnded, onClick, onDoubleClick } = usePetBehavior()

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

function handleMouseDown(e: MouseEvent):void {
  downX = e.screenX
  downY = e.screenY
  onMouseDown(e)   // 原拖动逻辑照常
}

// 1. 新增一个变量来记录单击的定时器
let clickTimer: ReturnType<typeof setTimeout> | null = null

// 处理点击，点击包含mouseDown和mouseUp，不处理的话，在拖动过程中也会触发
function handleClick(e: MouseEvent):void {
  const dx = e.screenX - downX
  const dy = e.screenY - downY
  // 位移超过 5px 视为拖动，不算点击
  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) return

  // 如果之前有排队的单击，先清掉
  if (clickTimer) clearTimeout(clickTimer)

  // 延迟 250ms 执行。如果 250ms 内没有发生双击，才认为是真的单击
  clickTimer = setTimeout(() => {
    onClick() // 👈 这里调用的就是你 usePetBehavior 里暴露出来的 onClick 方法
    clickTimer = null
  }, 250)
}

// 视频时长（秒），默认 1 避免除零/时长为 0
const videoDuration = ref(10)

function handleDuration(d: number):void {
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

// 双击事件
function handleDoubleClick(e: MouseEvent): void {
  // 这里写双击的业务逻辑
  console.log('宠物被双击了！')
  
  // 记得也要用位移判断一下，防止拖动结束时误触双击
  const dx = e.screenX - downX
  const dy = e.screenY - downY
  if (Math.abs(dx) > 5 || Math.abs(dy) > 5) return

  // 如果双击了，赶紧把刚才排队的单击事件取消掉！
  if (clickTimer) {
    clearTimeout(clickTimer)
    clickTimer = null
  }
  onDoubleClick()
}
</script>

<template>
  <div
    class="pet-container"
    :class="{ dragging }"
  >
    <div class="motion-layer">
      <Transition name="pet-squash">
        <PetAnimation
          v-if="current"
          :key="current.id"
          :animation="current"
          @ended="onEnded"
          @duration="handleDuration"
        />
      </Transition>
      <!-- 热区：只有这块接收鼠标 -->
      <div
        class="pet-hit-area"
        :style="hitAreaStyle"
        @mousedown="handleMouseDown"
        @click="handleClick"
        @dblclick="handleDoubleClick"
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
/* 基础定位：确保新旧动画在同一个中心点重叠 */
.pet-squash-enter-active,
.pet-squash-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: center center; /* 核心：必须以正中心为基准缩放 */
}

/* 1. 旧动画离场：瞬间被“吸”进去 */
.pet-squash-leave-active {
  transition: all 0.15s ease-in;
}
.pet-squash-leave-to {
  /* 宽高同时压缩到 0，变成一个小点 */
  transform: scale(0); 
  opacity: 0;
}

/* 2. 新动画入场：从一个小点“啵”地一下弹出来 */
.pet-squash-enter-active {
  /* 0.3s 的时间，配合一个回弹曲线，让它弹出来的瞬间稍微超出正常大小再缩回 */
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pet-squash-enter-from {
  /* 同样从一个小点开始 */
  transform: scale(0); 
  opacity: 0;
}

/* 3. 正常状态 */
.pet-squash-enter-to,
.pet-squash-leave-from {
  transform: scale(1);
  opacity: 1;
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