<template>
  <div class="moods-view">
    <div class="hello-row">
      <h1 class="page-title">Moods</h1>
    </div>

    <div class="greeting">Discover music by mood</div>

    <div v-if="isLoading" class="loading-note">Loading moods...</div>

    <div v-else>
      <!-- Mood Grid -->
      <div v-if="moods.length" class="mood-grid">
        <button
          v-for="mood in moods"
          :key="mood.id || mood.title"
          class="mood-card"
          :style="{ '--mc': mood.color || '#535353' }"
          @click="selectMood(mood)"
        >
          <div class="mood-content">
            <div class="mood-icon">
              <svg class="ic"><use :href="`#${mood.icon || 'i-radio'}`" /></svg>
            </div>
            <div class="mood-title">{{ mood.title }}</div>
            <div class="mood-desc">{{ mood.description }}</div>
          </div>
        </button>
      </div>

      <div v-else class="empty-note">
        <p>No moods available right now</p>
      </div>

      <!-- Selected Mood Section -->
      <div v-if="selectedMood && moodSongs.length" class="shelf">
        <div class="shelf-title">Songs for {{ selectedMood.title }}</div>
        <div class="carousel-wrap">
          <button class="car-btn car-prev" @click="scrollCarousel(-1)">
            <svg class="ic"><use href="#i-back" /></svg>
          </button>
          <div class="carousel" ref="carousel">
            <button
              v-for="song in moodSongs"
              :key="song.videoId"
              class="card"
              @click="playSong(song)"
            >
              <div class="art">
                <img :src="song.thumbnail" :alt="song.title" />
                <div class="play-ov">
                  <svg class="ic"><use href="#i-play" /></svg>
                </div>
              </div>
              <div class="t">{{ displayTitle(song.title) }}</div>
              <div class="s">{{ song.artist || song.subtitle }}</div>
            </button>
          </div>
          <button class="car-btn car-next" @click="scrollCarousel(1)">
            <svg class="ic"><use href="#i-fwd" /></svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/player';
import { useLibraryStore } from '../stores/library';
import { useApi } from '../composables/useApi';
import { displayTitle, songFromItem } from '../utils/helpers';

const router = useRouter();

const playerStore = usePlayerStore();
const libraryStore = useLibraryStore();
const api = useApi();

const moods = ref([]);
const selectedMood = ref(null);
const moodSongs = ref([]);
const isLoading = ref(true);

async function selectMood(mood) {
  // Navigate to browse page with params
  if (mood.browseId) {
    const params = mood.params ? `?params=${encodeURIComponent(mood.params)}` : '';
    router.push(`/browse/${mood.browseId}${params}`);
    return;
  }
  // Fallback: local songs
  selectedMood.value = mood;
  moodSongs.value = mood.songs || [];
}

function playSong(song) {
  if (!song) return;
  playerStore.playTrack(song);
  libraryStore.pushHistory(song);
}

function scrollCarousel(direction) {
  const carousel = document.querySelector('.carousel');
  if (carousel) {
    const scrollAmount = direction > 0 ? 300 : -300;
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}

onMounted(async () => {
  try {
    const data = await api.getMoods();
    moods.value = data.categories || data.moods || data || [];
  } catch (error) {
    console.error('Failed to load moods:', error);
    moods.value = [];
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.moods-view {
  padding: 0 24px 48px;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.mood-card {
  position: relative;
  overflow: hidden;
  aspect-ratio: 2 / 1;
  padding: 16px;
  border-radius: var(--radius);
  font-weight: 800;
  font-size: 17px;
  letter-spacing: -0.02em;
  color: #fff;
  cursor: pointer;
  border: none;
  text-align: left;
  display: flex;
  align-items: flex-start;
  transition: transform 0.18s, filter 0.18s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.mood-card:hover {
  transform: scale(1.04);
  filter: brightness(1.08);
}

.mood-card::after {
  content: "\266A";
  position: absolute;
  right: -6px;
  bottom: -10px;
  font-size: 64px;
  opacity: 0.28;
  transform: rotate(22deg);
}

.mood-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mood-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

.mood-icon .ic {
  width: 100%;
  height: 100%;
}

.mood-title {
  font-size: 20px;
  font-weight: 800;
}

.mood-desc {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
}

.loading-note {
  color: var(--muted);
  font-size: 14.5px;
  padding: 48px 0;
  text-align: center;
}
</style>
