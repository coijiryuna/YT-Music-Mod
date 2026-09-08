<template>
  <div class="player-controls">
    <button class="control-btn" @click="previousTrack" :disabled="!canGoPrevious">
      <svg class="ic"><use href="#i-prev" /></svg>
    </button>

    <button class="control-btn play-btn" @click="togglePlay" :disabled="!canPlay">
      <svg class="ic"><use :href="playIcon" /></svg>
    </button>

    <button class="control-btn" @click="nextTrack" :disabled="!canGoNext">
      <svg class="ic"><use href="#i-next" /></svg>
    </button>

    <button class="control-btn" @click="toggleShuffle" :class="{ active: shuffle }">
      <svg class="ic"><use href="#i-shuffle" /></svg>
    </button>

    <button class="control-btn" @click="toggleRepeat" :class="{ active: repeat !== 0 }">
      <svg class="ic"><use :href="repeatIcon" /></svg>
    </button>

    <button class="control-btn" @click="openNowPlaying">
      <svg class="ic"><use href="#i-queue" /></svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePlayerStore } from '../../stores/player';
import { useUiStore } from '../../stores/ui';

const playerStore = usePlayerStore();
const uiStore = useUiStore();

const playIcon = computed(() => {
  return playerStore.isPlaying ? '#i-pause' : '#i-play';
});

const repeatIcon = computed(() => {
  return playerStore.repeat === 2 ? '#i-repeat-1' : '#i-repeat';
});

const canPlay = computed(() => {
  return !!playerStore.currentTrack;
});

const canGoPrevious = computed(() => {
  return playerStore.currentTrack && playerStore.currentTime > 4;
});

const canGoNext = computed(() => {
  return playerStore.queue.length > 1;
});

const shuffle = computed(() => playerStore.shuffle);
const repeat = computed(() => playerStore.repeat);

function togglePlay() {
  playerStore.togglePlay();
}

function previousTrack() {
  playerStore.previousTrack();
}

function nextTrack() {
  playerStore.nextTrack();
}

function toggleShuffle() {
  playerStore.toggleShuffle();
}

function toggleRepeat() {
  playerStore.toggleRepeat();
}

function openNowPlaying() {
  uiStore.openNowPlaying('queue');
}
</script>

<style scoped>
.player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 8px 0;
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.control-btn:hover:not(:disabled) {
  color: var(--text);
  transform: scale(1.05);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.control-btn.active {
  color: var(--accent-bright);
}

.play-btn {
  width: 48px;
  height: 48px;
  background: var(--play-bg);
  color: var(--play-fg);
}

.play-btn:hover:not(:disabled) {
  transform: scale(1.08);
  background: var(--accent-bright);
  color: #000;
}

.control-btn .ic {
  width: 20px;
  height: 20px;
}
</style>