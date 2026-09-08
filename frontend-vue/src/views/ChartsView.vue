<template>
  <div class="charts-view">
    <div class="hello-row">
      <div>
        <div class="greeting">{{ dateLine }}</div>
        <h1 class="page-title">Charts</h1>
      </div>
    </div>

    <div v-if="isLoading" class="loading-note">Loading charts...</div>

    <div v-else>
      <div v-if="sections.length">
        <div
          v-for="(section, i) in sections"
          :key="'cs-' + i"
          class="shelf"
        >
          <div class="shelf-title">{{ section.title }}</div>

          <!-- First section with ≤6 items → chart-grid -->
          <div v-if="i === 0 && section.items.length <= 6 && section.items.every(isCardType)" class="chart-grid">
            <button
              v-for="item in section.items"
              :key="item.browseId || item.videoId || item.title"
              class="card"
              :class="{ artist: item.type === 'artist' }"
              @click="handleItemClick(item)"
            >
              <div class="art">
                <img :src="item.thumbnail" :alt="item.title" />
                <div class="play-ov"><svg class="ic"><use href="#i-play" /></svg></div>
              </div>
              <div class="t">{{ displayTitle(item.title) }}</div>
              <div class="s">{{ subtitleWithoutPlays(item.subtitle) }}</div>
            </button>
          </div>

          <!-- Regular shelf (carousel or track list) -->
          <template v-else>
            <div v-if="section.list" class="track-list">
              <button
                v-for="item in section.items"
                :key="item.videoId || item.browseId"
                class="track"
                @click="item.videoId ? playSong(item) : handleItemClick(item)"
              >
                <img :src="item.thumbnail" :alt="item.title" />
                <div class="tmeta">
                  <div class="tt">{{ displayTitle(item.title) }}</div>
                  <div class="ts">{{ subtitleWithoutPlays(item.subtitle) }}</div>
                </div>
              </button>
            </div>
            <div v-else class="carousel-wrap">
              <button class="car-btn car-prev" @click="scrollCarousel($event, -1)"><svg class="ic"><use href="#i-back" /></svg></button>
              <div class="carousel">
                <button
                  v-for="item in section.items"
                  :key="item.browseId || item.videoId || item.title"
                  class="card"
                  :class="{ artist: item.type === 'artist' }"
                  @click="handleItemClick(item)"
                >
                  <div class="art">
                    <img :src="item.thumbnail" :alt="item.title" />
                    <div class="play-ov"><svg class="ic"><use href="#i-play" /></svg></div>
                  </div>
                  <div class="t">{{ displayTitle(item.title) }}</div>
                  <div class="s">{{ subtitleWithoutPlays(item.subtitle) }}</div>
                </button>
              </div>
              <button class="car-btn car-next" @click="scrollCarousel($event, 1)"><svg class="ic"><use href="#i-fwd" /></svg></button>
            </div>
          </template>
        </div>
      </div>

      <div v-else class="empty-note">
        <p>No charts available right now</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/player';
import { useLibraryStore } from '../stores/library';
import { useApi } from '../composables/useApi';
import { displayTitle, songFromItem, looksLikePlays, applyTint } from '../utils/helpers';

const router = useRouter();
const playerStore = usePlayerStore();
const libraryStore = useLibraryStore();
const api = useApi();

const sections = ref([]);
const isLoading = ref(true);

const dateLine = computed(() => {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
});

function isCardType(item) {
  const t = item.type || item.browseType;
  return t === 'album' || t === 'playlist' || t === 'artist' || (!!item.browseId && !item.videoId);
}

function handleItemClick(item) {
  if (item.videoId) playSong(item);
  else if (item.browseId) {
    if (item.type === 'artist') router.push(`/artist/${item.browseId}`);
    else if (item.type === 'album') router.push(`/album/${item.browseId}`);
    else router.push(`/playlist/${item.browseId}`);
  }
}

function playSong(song) {
  if (!song) return;
  const normalized = songFromItem(song) || song;
  playerStore.playTrack(normalized);
  libraryStore.pushHistory(normalized);
}

function scrollCarousel(event, direction) {
  const btn = event?.currentTarget;
  const wrap = btn?.closest('.carousel-wrap');
  const carousel = wrap?.querySelector('.carousel');
  if (carousel) {
    const step = Math.max(200, Math.floor(carousel.clientWidth * 0.82));
    carousel.scrollBy({ left: direction > 0 ? step : -step, behavior: 'smooth' });
  }
}

function subtitleWithoutPlays(sub) {
  if (!sub) return '';
  const parts = String(sub).split('•').map(s => s.trim());
  const filtered = parts.filter(p => !looksLikePlays(p));
  return filtered.join(' • ') || parts[0] || '';
}

onMounted(async () => {
  applyTint('charts');
  try {
    const data = await api.getCharts();
    sections.value = (data.sections || []).map(s => ({
      title: s.title || '',
      items: s.items || [],
      list: s.list || false,
    }));
  } catch (error) {
    console.error('Failed to load charts:', error);
    sections.value = [];
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.charts-view {
  padding: 0 24px 48px;
}

.hello-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 22px;
}

.hello-row .page-title {
  margin-bottom: 0;
}

.greeting {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 4px;
  font-weight: 600;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  gap: 6px;
  margin-bottom: 20px;
}

.chart-grid .card {
  width: auto;
  max-width: 220px;
}

.chart-grid .card .art {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
}

.loading-note {
  color: var(--muted);
  font-size: 14.5px;
  padding: 48px 0;
  text-align: center;
}

.track-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.empty-note {
  color: var(--muted);
  font-size: 14.5px;
  padding: 48px 0;
  text-align: center;
}
</style>
