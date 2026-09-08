<template>
  <div class="library-container">
    <div class="library-header">
      <h1>Your Library</h1>
      <div class="library-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="setActiveTab(tab.id)"
        >
          <svg class="ic"><use :href="`#${tab.icon}`" /></svg>
          <span>{{ tab.label }}</span>
          <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <div class="library-content">
      <!-- Favorites Tab -->
      <div v-if="activeTab === 'favorites'" class="tab-content">
        <div v-if="favorites.length" class="grid-layout">
          <button
            v-for="song in favorites"
            :key="song.videoId"
            class="library-card"
            @click="playSong(song)"
          >
            <div class="card-art">
              <img :src="song.thumbnail" :alt="song.title" />
              <div class="play-overlay">
                <svg class="ic"><use href="#i-play" /></svg>
              </div>
            </div>
            <div class="card-info">
              <div class="card-title">{{ displayTitle(song.title) }}</div>
              <div class="card-artist">{{ song.artist || song.subtitle }}</div>
            </div>
            <button class="fav-btn" @click.stop="toggleFavorite(song)">
              <svg class="ic"><use href="#i-heart-f" /></svg>
            </button>
          </button>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">
            <svg class="ic"><use href="#i-heart-o" /></svg>
          </div>
          <h3>No favorites yet</h3>
          <p>Tap the heart icon on songs to add them here</p>
        </div>
      </div>

      <!-- Playlists Tab -->
      <div v-if="activeTab === 'playlists'" class="tab-content">
        <div class="playlist-actions">
          <button class="btn-primary" @click="openCreatePlaylist">
            <svg class="ic"><use href="#i-plus" /></svg>
            <span>New Playlist</span>
          </button>
        </div>

        <div v-if="playlists.length" class="grid-layout">
          <button
            v-for="playlist in playlists"
            :key="playlist.id"
            class="library-card"
            @click="goToPlaylist(playlist.id)"
          >
            <div class="card-art">
              <img v-if="playlist.tracks[0]" :src="playlist.tracks[0].thumbnail" :alt="playlist.name" />
              <div v-else class="art-placeholder">
                <svg class="ic"><use href="#i-note" /></svg>
              </div>
              <div class="play-overlay">
                <svg class="ic"><use href="#i-play" /></svg>
              </div>
            </div>
            <div class="card-info">
              <div class="card-title">{{ playlist.name }}</div>
              <div class="card-artist">{{ playlist.tracks.length }} songs</div>
            </div>
            <button class="menu-btn" @click.stop="openPlaylistMenu(playlist.id)">
              <svg class="ic"><use href="#i-more" /></svg>
            </button>
          </button>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">
            <svg class="ic"><use href="#i-plus" /></svg>
          </div>
          <h3>No playlists yet</h3>
          <p>Create your first playlist to get started</p>
        </div>
      </div>

      <!-- Saved Tab -->
      <div v-if="activeTab === 'saved'" class="tab-content">
        <div v-if="saved.length" class="grid-layout">
          <button
            v-for="item in saved"
            :key="item.browseId"
            class="library-card"
            @click="goToItem(item)"
          >
            <div class="card-art" :class="{ round: item.type === 'artist' }">
              <img :src="item.thumbnail" :alt="item.title" />
              <div class="play-overlay">
                <svg class="ic"><use href="#i-play" /></svg>
              </div>
            </div>
            <div class="card-info">
              <div class="card-title">{{ item.title }}</div>
              <div class="card-artist">{{ getItemType(item.type) }}</div>
            </div>
          </button>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">
            <svg class="ic"><use href="#i-library" /></svg>
          </div>
          <h3>No saved items</h3>
          <p>Save albums, artists, and playlists to see them here</p>
        </div>
      </div>

      <!-- History Tab -->
      <div v-if="activeTab === 'history'" class="tab-content">
        <div v-if="history.length" class="history-list">
          <button
            v-for="song in history.slice(0, 50)"
            :key="song.videoId"
            class="history-row"
            @click="playSong(song)"
          >
            <div class="history-number">{{ history.indexOf(song) + 1 }}</div>
            <div class="history-art">
              <img :src="song.thumbnail" :alt="song.title" />
            </div>
            <div class="history-info">
              <div class="history-title">{{ displayTitle(song.title) }}</div>
              <div class="history-artist">{{ song.artist || song.subtitle }}</div>
              <div class="history-time">{{ formatTime(song.playedAt) }}</div>
            </div>
          </button>
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">
            <svg class="ic"><use href="#i-clock" /></svg>
          </div>
          <h3>No listening history</h3>
          <p>Play some songs to see your history here</p>
        </div>
      </div>

      <!-- Stats Tab -->
      <div v-if="activeTab === 'stats'" class="tab-content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <svg class="ic"><use href="#i-play" /></svg>
            </div>
            <div class="stat-value">{{ totalPlays }}</div>
            <div class="stat-label">Total Plays</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <svg class="ic"><use href="#i-clock" /></svg>
            </div>
            <div class="stat-value">{{ totalMinutes }} min</div>
            <div class="stat-label">Listening Time</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <svg class="ic"><use href="#i-heart-f" /></svg>
            </div>
            <div class="stat-value">{{ favorites.length }}</div>
            <div class="stat-label">Favorites</div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <svg class="ic"><use href="#i-queue" /></svg>
            </div>
            <div class="stat-value">{{ playlists.length }}</div>
            <div class="stat-label">Playlists</div>
          </div>
        </div>

        <!-- Top Artists -->
        <div v-if="topArtists.length" class="top-artists-section">
          <h3 class="section-title">Top Artists</h3>
          <div class="carousel">
            <button
              v-for="artist in topArtists"
              :key="artist.id"
              class="artist-card"
              @click="goToArtist(artist.id)"
            >
              <div class="artist-art">
                <img :src="artist.thumbnail" :alt="artist.title" />
              </div>
              <div class="artist-name">{{ artist.title }}</div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <!-- Create Playlist Modal -->
      <div v-if="showCreatePlaylistModal" class="modal-overlay" @click="closeCreatePlaylist">
        <div class="modal-content" @click.stop>
          <h2>Create New Playlist</h2>
          <input
            v-model="newPlaylistName"
            type="text"
            placeholder="Playlist name"
            @keyup.enter="createPlaylist"
          />
          <div class="modal-actions">
            <button class="btn-primary" @click="createPlaylist">Create</button>
            <button class="btn-secondary" @click="closeCreatePlaylist">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Playlist Menu Modal -->
      <div v-if="showPlaylistMenu" class="modal-overlay" @click="closePlaylistMenu">
        <div class="modal-content" @click.stop>
          <h2>Playlist Options</h2>
          <button class="menu-item" @click="renamePlaylist">
            <svg class="ic"><use href="#i-edit" /></svg>
            <span>Rename</span>
          </button>
          <button class="menu-item" @click="deletePlaylist">
            <svg class="ic"><use href="#i-trash" /></svg>
            <span>Delete</span>
          </button>
          <button class="menu-item" @click="sharePlaylist">
            <svg class="ic"><use href="#i-share" /></svg>
            <span>Share</span>
          </button>
          <button class="modal-close" @click="closePlaylistMenu">Close</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLibraryStore } from '../stores/library';
import { displayTitle } from '../utils/helpers';

const router = useRouter();
const libraryStore = useLibraryStore();

const activeTab = ref('favorites');
const showCreatePlaylistModal = ref(false);
const showPlaylistMenu = ref(false);
const selectedPlaylistId = ref(null);
const newPlaylistName = ref('');

const tabs = [
  { id: 'favorites', label: 'Favorites', icon: 'i-heart-f', count: 0 },
  { id: 'playlists', label: 'Playlists', icon: 'i-plus', count: 0 },
  { id: 'saved', label: 'Saved', icon: 'i-library', count: 0 },
  { id: 'history', label: 'History', icon: 'i-clock', count: 0 },
  { id: 'stats', label: 'Stats', icon: 'i-chart', count: 0 },
];

const favorites = computed(() => libraryStore.favorites);
const playlists = computed(() => libraryStore.playlists);
const saved = computed(() => libraryStore.saved);
const history = computed(() => libraryStore.history);
const stats = computed(() => libraryStore.stats);

const totalPlays = computed(() => {
  return Object.values(stats.value).reduce((sum, stat) => sum + (stat.plays || 0), 0);
});

const totalMinutes = computed(() => {
  return Math.round(Object.values(stats.value).reduce((sum, stat) => sum + (stat.secs || 0), 0) / 60);
});

const topArtists = computed(() => {
  // This would be calculated from stats
  return [
    { id: 'artist1', title: 'The Weeknd', thumbnail: '/logo-64.png' },
    { id: 'artist2', title: 'Ed Sheeran', thumbnail: '/logo-64.png' },
    { id: 'artist3', title: 'Dua Lipa', thumbnail: '/logo-64.png' },
  ];
});

function setActiveTab(tabId) {
  activeTab.value = tabId;
}

function playSong(song) {
  // This would integrate with the player
  console.log('Playing song:', song);
}

function toggleFavorite(song) {
  libraryStore.toggleFav(song);
}

function goToPlaylist(playlistId) {
  router.push(`/library/playlist/${playlistId}`);
}

function goToItem(item) {
  if (item.type === 'artist') {
    router.push(`/artist/${item.browseId}`);
  } else if (item.type === 'album') {
    router.push(`/album/${item.browseId}`);
  } else if (item.type === 'playlist') {
    router.push(`/playlist/${item.browseId}`);
  }
}

function getItemType(type) {
  const types = {
    artist: 'Artist',
    album: 'Album',
    playlist: 'Playlist',
  };
  return types[type] || type;
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

function goToArtist(artistId) {
  router.push(`/artist/${artistId}`);
}

function openCreatePlaylist() {
  showCreatePlaylistModal.value = true;
}

function closeCreatePlaylist() {
  showCreatePlaylistModal.value = false;
  newPlaylistName.value = '';
}

function createPlaylist() {
  if (!newPlaylistName.value) return;
  libraryStore.createPlaylist(newPlaylistName.value);
  closeCreatePlaylist();
}

function openPlaylistMenu(playlistId) {
  selectedPlaylistId.value = playlistId;
  showPlaylistMenu.value = true;
}

function closePlaylistMenu() {
  showPlaylistMenu.value = false;
  selectedPlaylistId.value = null;
}

function renamePlaylist() {
  // This would open a rename dialog
  console.log('Renaming playlist:', selectedPlaylistId.value);
  closePlaylistMenu();
}

function deletePlaylist() {
  if (selectedPlaylistId.value && confirm('Are you sure you want to delete this playlist?')) {
    libraryStore.deletePlaylist(selectedPlaylistId.value);
    closePlaylistMenu();
  }
}

function sharePlaylist() {
  // This would open a share dialog
  console.log('Sharing playlist:', selectedPlaylistId.value);
  closePlaylistMenu();
}

onMounted(() => {
  // Update tab counts
  tabs[0].count = favorites.value.length;
  tabs[1].count = playlists.value.length;
  tabs[2].count = saved.value.length;
  tabs[3].count = history.value.length;
});
</script>

<style scoped>
.library-container {
    padding: 0 24px 48px;
    height: 100%;
}

.library-header {
    margin-bottom: 24px;
}

.library-header h1 {
    font-size: 32px;
    font-weight: 800;
    margin-bottom: 16px;
}

.library-tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.tab-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--hover-strong);
    border-radius: 999px;
    font-size: 13px;
    color: var(--text);
    font-weight: 600;
    transition: all 0.15s ease;
}

.tab-btn.active {
    background: var(--chip-on-bg);
    color: var(--chip-on-fg);
}

.tab-btn .ic {
    width: 16px;
    height: 16px;
}

.tab-count {
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
}

html[data-theme="light"] .tab-count {
    background: rgba(0, 0, 0, 0.1);
}

.library-content {
    min-height: 400px;
}

.tab-content {
    margin-top: 24px;
}

.grid-layout {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
}

.library-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: var(--elevated);
    border-radius: var(--radius);
    transition: all 0.15s ease;
    text-align: left;
}

.library-card:hover {
    background: var(--card-hover);
    transform: scale(1.02);
}

.card-art {
    position: relative;
    width: 100%;
    height: 180px;
    border-radius: 8px;
    overflow: hidden;
}

.card-art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.art-placeholder {
    width: 100%;
    height: 100%;
    background: var(--elevated);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted);
}

.play-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.15s ease;
}

.library-card:hover .play-overlay {
    opacity: 1;
}

.card-info {
    flex: 1;
    min-width: 0;
}

.card-title {
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.card-artist {
    font-size: 13px;
    color: var(--muted);
    margin-top: 4px;
}

.fav-btn,
.menu-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: transparent;
    color: var(--muted);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
}

.fav-btn:hover {
    color: var(--accent-bright);
}

.menu-btn:hover {
    color: var(--text);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 0;
    text-align: center;
}

.empty-icon {
    width: 64px;
    height: 64px;
    background: var(--elevated);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    color: var(--muted);
}

.empty-state h3 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 8px;
}

.empty-state p {
    color: var(--muted);
    font-size: 14px;
}

.playlist-actions {
    margin-bottom: 24px;
}

.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: var(--accent-bright);
    color: #000;
    border: none;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
}

.btn-primary:hover {
    transform: scale(1.04);
    background: #3be477;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.modal-content {
    background: var(--main-bg);
    padding: 24px;
    border-radius: var(--radius);
    width: 90%;
    max-width: 500px;
}

.modal-content h2 {
    font-size: 20px;
    margin-bottom: 16px;
}

.modal-content input {
    width: 100%;
    padding: 12px;
    margin-bottom: 16px;
    background: var(--elevated);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    font-size: 14px;
}

.modal-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
}

.btn-secondary {
    padding: 12px 24px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
}

.btn-secondary:hover {
    background: var(--hover);
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    color: var(--text);
    font-size: 14px;
    cursor: pointer;
    transition: background 0.15s ease;
}

.menu-item:hover {
    background: var(--hover);
}

.menu-item .ic {
    width: 20px;
    height: 20px;
}

.modal-close {
    margin-top: 16px;
    padding: 12px 24px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    width: 100%;
}

.modal-close:hover {
    background: var(--hover);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
}

.stat-card {
    background: var(--elevated);
    border-radius: var(--radius);
    padding: 20px;
    text-align: center;
    transition: all 0.15s ease;
}

.stat-card:hover {
    transform: scale(1.02);
    background: var(--card-hover);
}

.stat-icon {
    width: 40px;
    height: 40px;
    margin: 0 auto 12px;
    color: var(--accent-bright);
}

.stat-value {
    font-size: 28px;
    font-weight: 800;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 13px;
    color: var(--muted);
}

.top-artists-section {
    margin-top: 32px;
}

.section-title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 16px;
}

.carousel {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 140px;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 8px;
    scroll-snap-type: x proximity;
}

.artist-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: var(--elevated);
    border-radius: var(--radius);
    transition: all 0.15s ease;
    text-align: center;
}

.artist-card:hover {
    background: var(--card-hover);
    transform: scale(1.02);
}

.artist-art {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
}

.artist-art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.artist-name {
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
}
</style>