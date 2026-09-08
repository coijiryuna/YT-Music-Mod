<template>
  <aside :class="['sidebar', { 'collapsed': !isSidebarOpen }]" :style="sidebarWidth">
    <div class="sidebar-header">
      <div class="logo">
        <img src="/logo.png" alt="Rifa Music" class="logo-img" />
        <span>Rifa Music</span>
      </div>
    </div>

    <nav class="nav-desktop">
      <button
        v-for="nav in desktopNavItems"
        :key="nav.id"
        :class="['nav-item', { active: activeNav === nav.id }]"
        @click="setActiveNav(nav.id); goToRoute(nav.hash)"
      >
        <svg class="ic"><use :href="`#${nav.icon}`" /></svg>
        <span>{{ nav.label }}</span>
      </button>
    </nav>

    <div class="lib-section">
      <div class="lib-header">
        <button class="lib-title" @click="goToRoute('#/library')">
          <svg class="ic"><use href="#i-library" /></svg>
          <span>Your Library</span>
        </button>
        <button class="icon-btn" @click="openCreatePlaylistModal">
          <svg class="ic"><use href="#i-plus" /></svg>
        </button>
      </div>

      <div class="lib-list" ref="libList">
        <div v-if="loading" class="loading-note">Loading library...</div>
        <div v-else-if="!favorites.length && !playlists.length" class="empty-note">
          <p>Your library is empty</p>
          <p>Like songs or create playlists</p>
        </div>

        <div v-if="favorites.length" class="lib-section-title">Favorites</div>
        <button
          v-for="song in favorites.slice(0, 5)"
          :key="song.videoId"
          class="lib-row"
          @click="playSong(song)"
        >
          <img :src="song.thumbnail" :alt="song.title" class="lib-thumb" />
          <div class="lib-meta">
            <div class="lib-title-text">{{ displayTitle(song.title) }}</div>
            <div class="lib-subtitle">{{ song.artist || song.subtitle }}</div>
          </div>
          <button class="lib-fav-btn" @click.stop="toggleFavorite(song)">
            <svg class="ic"><use href="#i-heart-f" /></svg>
          </button>
        </button>

        <div v-if="playlists.length" class="lib-section-title">Playlists</div>
        <button
          v-for="playlist in playlists.slice(0, 5)"
          :key="playlist.id"
          class="lib-row"
          @click="goToRoute(`/library/playlist/${playlist.id}`)"
        >
          <img v-if="playlist.tracks[0]" :src="playlist.tracks[0].thumbnail" :alt="playlist.name" class="lib-thumb" />
          <div v-else class="lib-thumb lib-ph">
            <svg class="ic"><use href="#i-note" /></svg>
          </div>
          <div class="lib-meta">
            <div class="lib-title-text">{{ playlist.name }}</div>
            <div class="lib-subtitle">{{ playlist.tracks.length }} songs</div>
          </div>
        </button>
      </div>
    </div>

    <div class="queue-section">
      <div class="lib-header">
        <button class="lib-title" @click="goToRoute('#/queue')">
          <svg class="ic"><use href="#i-queue" /></svg>
          <span>Queue</span>
          <span class="queue-count" v-if="queueCount > 0">{{ queueCount }}</span>
        </button>
      </div>

      <div class="queue-list" ref="queueList">
        <div v-if="!queue.length" class="empty-note">Queue is empty</div>
        <button
          v-for="(song, index) in queue.slice(0, 5)"
          :key="song.videoId"
          class="queue-row"
          :class="{ 'now-playing': index === 0 }"
          @click="setQueueIndex(index)"
        >
          <div class="queue-number">{{ index + 1 }}</div>
          <img :src="song.thumbnail" :alt="song.title" class="queue-thumb" />
          <div class="queue-meta">
            <div class="queue-title">{{ displayTitle(song.title) }}</div>
            <div class="queue-artist">{{ song.artist || song.subtitle }}</div>
          </div>
          <button class="queue-remove-btn" @click.stop="removeFromQueue(index)">
            <svg class="ic"><use href="#i-x" /></svg>
          </button>
        </button>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="theme-toggle" @click="toggleTheme">
        <svg class="ic"><use :href="themeIcon" /></svg>
        <span>{{ theme === 'light' ? 'Light Mode' : 'Dark Mode' }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '../stores/ui';
import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { displayTitle } from '../utils/helpers';

const router = useRouter();
const uiStore = useUiStore();
const libraryStore = useLibraryStore();
const playerStore = usePlayerStore();

const activeNav = ref('home');
const isSidebarOpen = ref(true);
const loading = ref(false);

const desktopNavItems = [
  { id: 'home', label: 'Home', icon: 'i-home-o', hash: '#/home' },
  { id: 'search', label: 'Search', icon: 'i-search', hash: '#/search' },
  { id: 'charts', label: 'Charts', icon: 'i-chart', hash: '#/charts' },
];

const favorites = computed(() => libraryStore.favorites);
const playlists = computed(() => libraryStore.playlists);
const queue = computed(() => playerStore.queue);
const queueCount = computed(() => {
  return playerStore.queue.filter((q, i) => i > playerStore.currentIndex).length;
});

const themeIcon = computed(() => {
  return uiStore.theme === 'light' ? '#i-moon' : '#i-sun';
});

const theme = computed(() => uiStore.theme);

function setActiveNav(navId) {
  activeNav.value = navId;
}

function goToRoute(hash) {
  router.push(hash.substring(1));
}

function toggleTheme() {
  uiStore.toggleTheme();
}

function playSong(song) {
  playerStore.playTrack(song);
}

function toggleFavorite(song) {
  libraryStore.toggleFav(song);
}

function setQueueIndex(index) {
  playerStore.currentIndex = index;
}

function removeFromQueue(index) {
  playerStore.removeFromQueue(index);
}

function openCreatePlaylistModal() {
  uiStore.openCreatePlaylist();
}

function handleResize() {
  if (window.innerWidth < 861) {
    isSidebarOpen.value = false;
  } else {
    isSidebarOpen.value = true;
  }
}

function setupScrollHandlers() {
  const libList = document.querySelector('.lib-list');
  const queueList = document.querySelector('.queue-list');

  if (libList) {
    libList.addEventListener('wheel', (e) => {
      e.preventDefault();
      libList.scrollTop += e.deltaY;
    });
  }

  if (queueList) {
    queueList.addEventListener('wheel', (e) => {
      e.preventDefault();
      queueList.scrollTop += e.deltaY;
    });
  }
}

onMounted(() => {
  handleResize();
  setupScrollHandlers();

  window.addEventListener('resize', handleResize);

  // Load initial data
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--main-bg);
  border-radius: var(--radius);
  transition: all 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar.collapsed .nav-item span,
.sidebar.collapsed .lib-title span,
.sidebar.collapsed .lib-section-title,
.sidebar.collapsed .queue-count,
.sidebar.collapsed .sidebar-footer span {
  display: none;
}

.sidebar.collapsed .nav-item,
.sidebar.collapsed .lib-title,
.sidebar.collapsed .lib-row,
.sidebar.collapsed .queue-row {
  justify-content: center;
  padding: 12px 8px;
}

.sidebar.collapsed .lib-thumb,
.sidebar.collapsed .lib-ph {
  margin-right: 0;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 800;
  font-size: 20px;
  color: var(--text);
}

.logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.nav-desktop {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 6px;
  color: var(--muted);
  font-size: 15px;
  font-weight: 700;
  transition: all 0.18s ease;
  text-align: left;
  width: 100%;
}

.nav-item:hover {
  color: var(--text);
  background: var(--hover);
}

.nav-item.active {
  color: var(--text);
  background: var(--hover-strong);
}

.nav-item .ic {
  width: 24px;
  height: 24px;
}

.lib-section,
.queue-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.lib-header,
.queue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.lib-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--muted);
  font-size: 15px;
  font-weight: 700;
  background: none;
  border: none;
  cursor: pointer;
}

.lib-title:hover {
  color: var(--text);
}

.lib-title .ic {
  width: 24px;
  height: 24px;
}

.icon-btn {
  color: var(--muted);
  padding: 6px;
  border-radius: 50%;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  color: var(--text);
  background: var(--hover);
}

.lib-list,
.queue-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.lib-section-title {
  font-size: 12px;
  font-weight: 800;
  color: var(--muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 8px 16px;
  margin-top: 8px;
}

.lib-row,
.queue-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 0.15s;
  margin-bottom: 4px;
}

.lib-row:hover,
.queue-row:hover {
  background: var(--hover-strong);
}

.lib-row.now-playing {
  background: var(--hover);
}

.lib-thumb {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
  background: var(--elevated);
  flex-shrink: 0;
}

.lib-ph {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
}

.lib-meta {
  flex: 1;
  min-width: 0;
}

.lib-title-text {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lib-subtitle {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lib-fav-btn {
  color: var(--muted);
  padding: 6px;
  border-radius: 50%;
  transition: all 0.15s ease;
}

.lib-fav-btn:hover {
  color: var(--accent-bright);
  transform: scale(1.1);
}

.queue-number {
  width: 24px;
  font-size: 12px;
  font-weight: 800;
  color: var(--accent-bright);
  flex-shrink: 0;
  text-align: center;
}

.queue-thumb {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  object-fit: cover;
  background: var(--elevated);
  flex-shrink: 0;
}

.queue-meta {
  flex: 1;
  min-width: 0;
}

.queue-title {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-artist {
  font-size: 11.5px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.queue-remove-btn {
  color: var(--muted);
  padding: 6px;
  border-radius: 50%;
  opacity: 0;
  transition: all 0.15s ease;
}
</style>