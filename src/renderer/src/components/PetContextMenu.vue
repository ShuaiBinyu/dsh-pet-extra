<script setup lang="ts">
defineProps<{
  position: { x: number; y: number }
}>()

defineEmits<{
  openChat: []
  openConfig: []
  quit: []
}>()
</script>

<template>
  <div
    class="context-menu"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @mousedown.stop
    @contextmenu.stop
  >
    <div class="menu-item" @click="$emit('openChat')">打开聊天窗口</div>
    <div class="menu-item" @click="$emit('openConfig')">配置 API</div>
    <div class="menu-item quit-item" @click="$emit('quit')">退出桌宠</div>
  </div>
</template>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 99999;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
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

.quit-item {
  color: #ff4d4f;
}
</style>
