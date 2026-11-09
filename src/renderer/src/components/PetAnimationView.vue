<script setup lang="ts">
import PetAnimation from './PetAnimation.vue'
import type { PetAnimationConfig } from '../types/pet'

defineProps<{
  animation: PetAnimationConfig
  paused: boolean
}>()

const emit = defineEmits<{
  ended: []
  duration: [seconds: number]
  transitionEntered: []
}>()
</script>

<template>
  <Transition name="pet-squash" @after-enter="emit('transitionEntered')">
    <PetAnimation
      :key="animation.id"
      :animation="animation"
      :paused="paused"
      @ended="emit('ended')"
      @duration="emit('duration', $event)"
    />
  </Transition>
</template>

<style scoped>
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
</style>
