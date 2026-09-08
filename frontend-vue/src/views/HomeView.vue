<template>
  <div class="home-view">
    <!-- Greeting with date line -->
    <div class="hello-row">
      <div>
        <div class="greeting">{{ dateLine }}</div>
        <h1 class="page-title">{{ greeting }}</h1>
      </div>
    </div>

    <!-- Recently Played Quick Grid -->
    <div v-if="libraryStore.history.length" class="shelf-title">Recently played</div>
    <div v-if="libraryStore.history.length" class="quick-grid">
      <button
        v-for="song in libraryStore.history.slice(0, 8)"
        :key="'qh-' + song.videoId"
        class="quick-card"
        @click="playSong(song)"
      >
        <img :src="song.thumbnail" :alt="song.title" />
        <span class="qc-t">{{ displayTitle(song.title) }}</span>
        <div class="play-ov">
          <svg class="ic"><use href="#i-play" /></svg>
        </div>
      </button>
    </div>

    <!-- Jump Back In (remaining history) -->
    <div v-if="libraryStore.history.length > 8" class="shelf">
      <div class="shelf-title">Jump back in</div>
      <div class="carousel-wrap">
        <button class="car-btn car-prev" @click="scrollCarousel($event, -1)">
          <svg class="ic"><use href="#i-back" /></svg>
        </button>
        <div class="carousel">
          <button
            v-for="song in libraryStore.history.slice(8)"
            :key="'jb-' + song.videoId"
            class="card"
            @click="playSong(song)"
          >
            <div class="art">
              <img :src="song.thumbnail" :alt="song.title" />
              <div class="play-ov"><svg class="ic"><use href="#i-play" /></svg></div>
            </div>
            <div class="t">{{ displayTitle(song.title) }}</div>
            <div class="s">{{ song.artist || song.subtitle }}</div>
          </button>
        </div>
        <button class="car-btn car-next" @click="scrollCarousel($event, 1)">
          <svg class="ic"><use href="#i-fwd" /></svg>
        </button>
      </div>
    </div>

    <!-- Liked Songs -->
    <div v-if="libraryStore.favorites.length" class="shelf">
      <div class="shelf-title">Liked songs</div>
      <div class="carousel-wrap">
        <button class="car-btn car-prev" @click="scrollCarousel($event, -1)">
          <svg class="ic"><use href="#i-back" /></svg>
        </button>
        <div class="carousel">
          <button
            v-for="song in libraryStore.favorites.slice(0, 12)"
            :key="'fav-' + song.videoId"
            class="card"
            @click="playSong(song)"
          >
            <div class="art">
              <img :src="song.thumbnail" :alt="song.title" />
              <div class="play-ov"><svg class="ic"><use href="#i-play" /></svg></div>
            </div>
            <div class="t">{{ displayTitle(song.title) }}</div>
            <div class="s">{{ song.artist || song.subtitle }}</div>
          </button>
        </div>
        <button class="car-btn car-next" @click="scrollCarousel($event, 1)">
          <svg class="ic"><use href="#i-fwd" /></svg>
        </button>
      </div>
    </div>

    <!-- Your Playlists -->
    <div v-if="playlists.length" class="shelf">
      <div class="shelf-title">Your playlists</div>
      <div class="carousel-wrap">
        <button class="car-btn car-prev" @click="scrollCarousel($event, -1)">
          <svg class="ic"><use href="#i-back" /></svg>
        </button>
        <div class="carousel">
          <button
            v-for="pl in playlists"
            :key="'pl-' + pl.id"
            class="card"
            @click="goToRoute(`/library/playlist/${pl.id}`)"
          >
            <div class="art">
              <img v-if="pl.tracks[0]" :src="pl.tracks[0].thumbnail" :alt="pl.name" />
              <div v-else class="art-ph"><svg class="ic"><use href="#i-note" /></svg></div>
              <div class="play-ov"><svg class="ic"><use href="#i-play" /></svg></div>
            </div>
            <div class="t">{{ pl.name }}</div>
            <div class="s">{{ pl.tracks.length }} songs</div>
          </button>
        </div>
        <button class="car-btn car-next" @click="scrollCarousel($event, 1)">
          <svg class="ic"><use href="#i-fwd" /></svg>
        </button>
      </div>
    </div>

    <!-- Saved Items -->
    <div v-if="libraryStore.saved.length" class="shelf">
      <div class="shelf-title">Saved</div>
      <div class="carousel-wrap">
        <button class="car-btn car-prev" @click="scrollCarousel($event, -1)">
          <svg class="ic"><use href="#i-back" /></svg>
        </button>
        <div class="carousel">
          <button
            v-for="item in libraryStore.saved.slice(0, 12)"
            :key="'sav-' + item.browseId"
            class="card"
            :class="{ artist: item.type === 'artist' }"
            @click="goToSavedItem(item)"
          >
            <div class="art">
              <img :src="item.thumbnail" :alt="item.title" />
              <div class="play-ov"><svg class="ic"><use href="#i-play" /></svg></div>
            </div>
            <div class="t">{{ item.title }}</div>
            <div class="s">{{ item.type === 'artist' ? 'Artist' : item.type === 'album' ? 'Album' : 'Playlist' }}</div>
          </button>
        </div>
        <button class="car-btn car-next" @click="scrollCarousel($event, 1)">
          <svg class="ic"><use href="#i-fwd" /></svg>
        </button>
      </div>
    </div>

    <!-- Dynamic Sections from API -->
    <div
      v-for="(section, sIdx) in sections"
      :key="'sec-' + sIdx"
      class="shelf"
    >
      <div class="shelf-title">{{ section.title }}</div>

      <!-- List sections (track rows) -->
      <template v-if="section.list">
        <div class="track-list">
          <button
            v-for="item in section.items"
            :key="'sl-' + sIdx + '-' + (item.videoId || item.browseId)"
            class="track"
            @click="item.videoId ? playSong(item) : handleItemClick(item)"
          >
            <div class="tmeta">
              <div class="tt">{{ displayTitle(item.title) }}</div>
              <div class="ts">{{ item.artist || subtitleWithoutPlays(item.subtitle) }}</div>
            </div>
            <div v-if="item.duration" class="tdur">{{ item.duration }}</div>
          </button>
        </div>
      </template>

      <!-- Songs in this section (carousel) -->
      <template v-else-if="section.type === 'songs'">
        <div class="carousel-wrap">
          <button class="car-btn car-prev" @click="scrollCarousel($event, -1)">
            <svg class="ic"><use href="#i-back" /></svg>
          </button>
          <div class="carousel">
            <button
              v-for="item in section.items"
              :key="'s-' + sIdx + '-' + (item.videoId || item.browseId)"
              class="card"
              @click="playSong(item)"
            >
              <div class="art">
                <img :src="item.thumbnail" :alt="item.title" />
                <div class="play-ov"><svg class="ic"><use href="#i-play" /></svg></div>
              </div>
              <div class="t">{{ displayTitle(item.title) }}</div>
              <div class="s">{{ item.artist || subtitleWithoutPlays(item.subtitle) }}</div>
            </button>
          </div>
          <button class="car-btn car-next" @click="scrollCarousel($event, 1)">
            <svg class="ic"><use href="#i-fwd" /></svg>
          </button>
        </div>
      </template>

      <!-- Playlists / Mixed (carousel cards) -->
      <template v-else>
        <div class="carousel-wrap">
          <button class="car-btn car-prev" @click="scrollCarousel($event, -1)">
            <svg class="ic"><use href="#i-back" /></svg>
          </button>
          <div class="carousel">
            <button
              v-for="item in section.items"
              :key="'m-' + sIdx + '-' + (item.videoId || item.browseId)"
              class="card"
              :class="{ artist: item.type === 'artist' }"
              @click="handleItemClick(item)"
            >
              <div class="art">
                <img :src="item.thumbnail" :alt="item.title" />
                <div class="play-ov"><svg class="ic"><use href="#i-play" /></svg></div>
              </div>
              <div class="t">{{ item.title }}</div>
              <div class="s">{{ subtitleWithoutPlays(item.subtitle) }}</div>
            </button>
          </div>
          <button class="car-btn car-next" @click="scrollCarousel($event, 1)">
            <svg class="ic"><use href="#i-fwd" /></svg>
          </button>
        </div>
      </template>
    </div>

    <!-- Empty State -->
    <div
      v-if="!isLoading && !libraryStore.history.length && !libraryStore.favorites.length && !sections.length"
      class="empty-note"
    >
      <p>No content available. Start by liking some songs or creating a playlist!</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="empty-note">
      <p>Loading...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { useUiStore } from '../stores/ui';
import { useApi } from '../composables/useApi';
import { displayTitle, songFromItem, looksLikePlays, applyTint } from '../utils/helpers';

const router = useRouter();
const libraryStore = useLibraryStore();
const playerStore = usePlayerStore();
const uiStore = useUiStore();
const api = useApi();

const sections = ref([]);
const isLoading = ref(true);

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 11) return 'Good morning';
  if (h < 16) return 'Good afternoon';
  return 'Good evening';
});

const dateLine = computed(() => {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
});

const playlists = computed(() => {
  return libraryStore.playlists.filter(p => p.tracks && p.tracks.length);
});

function goToRoute(path) {
  router.push(path);
}

function playSong(item) {
  if (!item) return;
  const song = songFromItem(item) || item;
  if (!song.videoId) return;
  playerStore.playTrack(song);
  libraryStore.pushHistory(song);
}

function goToPlaylist(item) {
  if (!item?.browseId) return;
  const playlistId = item.browseId.startsWith('VL') ? item.browseId.slice(2) : item.browseId;
  router.push(`/playlist/${playlistId}`);
}

function goToSavedItem(item) {
  if (item.type === 'artist') goToRoute(`/artist/${item.browseId}`);
  else if (item.type === 'album') goToRoute(`/album/${item.browseId}`);
  else if (item.type === 'playlist') goToRoute(`/playlist/${item.browseId}`);
}

function handleItemClick(item) {
  if (!item) return;
  switch (item.type) {
    case 'song': playSong(item); break;
    case 'playlist': goToPlaylist(item); break;
    case 'artist': goToRoute(`/artist/${item.browseId}`); break;
    case 'album': goToRoute(`/album/${item.browseId}`); break;
    default:
      if (item.videoId) playSong(item);
      else if (item.browseId) goToPlaylist(item);
  }
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
  if (!section?.items?.length) return 'mixed';
  if (section.list) return 'list';
  const types = section.items.map(i => i.type).filter(Boolean);
  const unique = [...new Set(types)];
  if (unique.length === 1) return unique[0] + 's';
  return 'mixed';
}

onMounted(async () => {
  applyTint(greeting.value);
  try {
    const data = await api.getHome();
    if (data.sections) {
      sections.value = data.sections.map(s => ({
        title: s.title || '',
        items: s.items || [],
        type: classifySection(s),
        list: s.list || false,
      }));
    }
  } catch (error) {
    console.error('Failed to load home data:', error);
    sections.value = [];
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.home-view {
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
  text-transform: capitalize;
}

.quick-card img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  background: var(--elevated);
  flex-shrink: 0;
}

.empty-note {
  color: var(--muted);
  font-size: 14.5px;
  padding: 48px 0;
  text-align: center;
  font-weight: 500;
}

.track-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}
</style>
