<template>
  <div class="browse-view">
    <div v-if="isLoading" class="loading-note">Loading...</div>

    <div v-else-if="browseData && browseData.sections.length">
      <!-- Detail Header -->
      <div class="detail-head" v-if="browseData.title">
        <img :src="browseData.thumbnail || '/logo-192.png'" :alt="browseData.title" />
        <div class="detail-info">
          <div class="detail-kicker">{{ browseData.type || 'Browse' }}</div>
          <h1>{{ browseData.title }}</h1>
          <div class="sub">{{ browseData.description || '' }}</div>
          <div class="detail-actions" v-if="browseData.playlistId">
            <button class="pill-btn primary" @click="playBrowseContent">
              <svg class="ic"><use href="#i-play" /></svg>
              <span>Play</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Sections from API -->
      <div
        v-for="(section, si) in browseData.sections"
        :key="'bs-' + si"
        class="shelf"
      >
        <div class="shelf-title">{{ section.title }}</div>

        <!-- Track list (songs) -->
        <template v-if="section.list">
          <div class="track-list">
            <button
              v-for="item in section.items"
              :key="(item.videoId || item.browseId) + '-' + si"
              class="track"
              @click="handleItemClick(item)"
            >
              <img :src="item.thumbnail" :alt="item.title" />
              <div class="tmeta">
                <div class="tt">{{ displayTitle(item.title) }}</div>
                <div class="ts">{{ item.subtitle || item.artist || '' }}</div>
              </div>
            </button>
          </div>
        </template>

        <!-- Carousel (cards) -->
        <template v-else>
          <div class="carousel-wrap">
            <button class="car-btn car-prev" @click="scrollCarousel($event, -1)">
              <svg class="ic"><use href="#i-back" /></svg>
            </button>
            <div class="carousel">
              <button
                v-for="item in section.items"
                :key="(item.browseId || item.videoId) + '-' + si"
                class="card"
                :class="{ artist: getItemType(item) === 'artist' }"
                @click="handleItemClick(item)"
              >
                <div class="art" :class="{ round: getItemType(item) === 'artist' }">
                  <img :src="item.thumbnail || ''" :alt="item.title" />
                  <div class="play-ov"><svg class="ic"><use href="#i-play" /></svg></div>
                </div>
                <div class="t">{{ displayTitle(item.title) }}</div>
                <div class="s">{{ getItemSubtitle(item) }}</div>
              </button>
            </div>
            <button class="car-btn car-next" @click="scrollCarousel($event, 1)">
              <svg class="ic"><use href="#i-fwd" /></svg>
            </button>
          </div>
        </template>
      </div>
    </div>

    <div v-else class="empty-note">
      <p>No content available</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/player';
import { useLibraryStore } from '../stores/library';
import { useApi } from '../composables/useApi';
import { displayTitle, songFromItem, applyTint, looksLikePlays } from '../utils/helpers';

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();
const libraryStore = useLibraryStore();
const api = useApi();

const browseData = ref(null);
const isLoading = ref(true);

function goToRoute(path) {
  router.push(path);
}

// Get item type — handle both `type` and `browseType` from server
function getItemType(item) {
  return item.type || item.browseType || (item.videoId ? 'song' : 'browse');
}

function getItemSubtitle(item) {
  if (item.subtitle) return item.subtitle;
  const t = getItemType(item);
  if (t === 'artist') return 'Artist';
  if (t === 'album') return 'Album';
  if (t === 'playlist') return 'Playlist';
  if (t === 'song') return item.artist || '';
  return '';
}

function handleItemClick(item) {
  const type = getItemType(item);
  if (item.videoId) {
    const song = songFromItem(item) || item;
    playerStore.playTrack(song);
    libraryStore.pushHistory(song);
    return;
  }
  if (item.browseId) {
    if (type === 'artist') goToRoute(`/artist/${item.browseId}`);
    else if (type === 'album') goToRoute(`/album/${item.browseId}`);
    else if (type === 'playlist') goToRoute(`/playlist/${item.browseId}`);
    else goToRoute(`/browse/${item.browseId}`);
  }
}

function playBrowseContent() {
  if (!browseData.value?.playlistId) return;
  // Navigate to playlist which will load tracks
  goToRoute(`/playlist/${browseData.value.playlistId}`);
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

function classifySection(section) {
  if (!section?.items?.length) return 'carousel';
  const allSongs = section.items.every(i => i.videoId && !i.browseId);
  if (allSongs) return 'list';
  return 'carousel';
}

onMounted(loadBrowse);
watch(() => [route.params.id, route.query.params], loadBrowse);

async function loadBrowse() {
  const browseId = route.params.id;
  const params = route.query.params || '';
  if (!browseId) return;
  isLoading.value = true;
  browseData.value = null;
  try {
    const data = await api.getBrowse(browseId, params);
    const sections = (data.sections || []).map(s => ({
      title: s.title || '',
      items: s.items || [],
      list: classifySection(s) === 'list',
    }));
    const allItems = sections.flatMap(s => s.items || []);

    // Try to get title from header, or first section, or fallback
    const title = data.title || data.header?.title || (data.header ? '' : '');

    browseData.value = {
      type: data.type || 'Browse',
      title: title,
      thumbnail: data.thumbnail || data.header?.thumbnail || '',
      description: data.subtitle || data.description || data.header?.subtitle || '',
      items: allItems,
      tracks: allItems.filter(i => i.videoId),
      sections: sections,
      playlistId: data.playlistId || '',
    };
  } catch (error) {
    console.error('Failed to load browse:', error);
    browseData.value = null;
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.browse-view {
  padding: 0 24px 48px;
}

.detail-head {
  display: flex;
  gap: 24px;
  align-items: flex-end;
  flex-wrap: wrap;
  margin: -24px -24px 0;
  padding: 72px 24px 24px;
  background:
    linear-gradient(180deg, transparent, var(--main-bg)),
    linear-gradient(180deg, hsl(var(--tint), 40%, 32%), hsl(var(--tint), 18%, 14%));
  border-radius: var(--radius) var(--radius) 0 0;
  margin-bottom: 8px;
}

html[data-theme="light"] .detail-head {
  background:
    linear-gradient(180deg, transparent, var(--main-bg)),
    linear-gradient(180deg, hsl(var(--tint), 50%, 78%), hsl(var(--tint), 30%, 92%));
}

.detail-head img {
  width: 224px;
  height: 224px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.55);
  background: var(--elevated);
}

.detail-info {
  flex: 1;
  min-width: 260px;
}

.detail-kicker {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.detail-info h1 {
  font-size: clamp(32px, 5vw, 72px);
  margin: 6px 0 14px;
  font-weight: 900;
  letter-spacing: -0.045em;
  line-height: 1.02;
}

.detail-info .sub {
  color: var(--muted);
  font-size: 14px;
  margin-bottom: 22px;
  max-width: 720px;
  font-weight: 500;
}

.detail-actions {
  display: flex;
  gap: 12px;
}

.loading-note {
  color: var(--muted);
  font-size: 14.5px;
  padding: 48px 0;
  text-align: center;
}

.empty-note {
  color: var(--muted);
  font-size: 14.5px;
  padding: 48px 0;
  text-align: center;
}

.track-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 12px;
}
</style>
