<template>
  <div class="playlist-view">
    <div v-if="isLoading" class="loading-note">Loading playlist...</div>

    <div v-else-if="playlist">
      <div class="detail-head">
        <img :src="playlist.thumbnail || ''" :alt="playlist.title" />
        <div class="detail-info">
          <div class="detail-kicker">Playlist</div>
          <h1>{{ playlist.title }}</h1>
          <div class="sub">{{ playlist.description || `${playlist.tracks?.length || 0} songs` }}</div>
          <div class="detail-actions">
            <button class="pill-btn primary" @click="playPlaylist">
              <svg class="ic"><use href="#i-play" /></svg>
              <span>Play</span>
            </button>
            <button v-if="!isLocal" class="pill-btn" @click="toggleSavePlaylist">
              <svg class="ic"><use :href="isPlaylistSaved ? '#i-heart-f' : '#i-heart-o'" /></svg>
              <span>{{ isPlaylistSaved ? 'Saved' : 'Save' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Tracks List -->
      <div class="shelf" v-if="playlist.tracks?.length">
        <div class="shelf-title">Tracks</div>
        <div class="track-list">
          <button
            v-for="(track, index) in playlist.tracks"
            :key="track.videoId || index"
            class="track"
            :class="{ playing: playerStore.currentTrack?.videoId === track.videoId }"
            @click="playTrack(track)"
          >
            <span class="t-num">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="art">
              <img :src="track.thumbnail || playlist.thumbnail || ''" :alt="track.title" />
            </div>
            <div class="tmeta">
              <div class="tt">{{ displayTitle(track.title) }}</div>
              <div class="ts">{{ track.artist || track.subtitle || playlist.creator }}</div>
            </div>
            <div class="tdur">{{ track.duration }}</div>
            <button class="tbtn btn-fav" @click.stop="toggleFavorite(track)">
              <svg class="ic"><use :href="libraryStore.isFav(track?.videoId) ? '#i-heart-f' : '#i-heart-o'" /></svg>
            </button>
            <button class="tbtn btn-queue" @click.stop="queueTrack(track)">
              <svg class="ic"><use href="#i-queue" /></svg>
            </button>
          </button>
        </div>
      </div>

      <div v-else class="empty-note">
        <p>This playlist is empty</p>
      </div>
    </div>

    <div v-else class="empty-note">
      <p>Playlist not found</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { useApi } from '../composables/useApi';
import { displayTitle, songFromItem } from '../utils/helpers';

const route = useRoute();
const router = useRouter();
const libraryStore = useLibraryStore();
const playerStore = usePlayerStore();
const api = useApi();

const playlist = ref(null);
const isLoading = ref(true);
const isLocal = ref(false);

const isPlaylistSaved = computed(() => {
  if (!playlist.value?.browseId) return false;
  return libraryStore.isSaved(playlist.value.browseId);
});

function playTrack(track) {
  if (!track) return;
  playerStore.playTrack(track);
  libraryStore.pushHistory(track);
}

function playPlaylist() {
  if (!playlist.value?.tracks?.length) return;
  playerStore.setQueue(playlist.value.tracks, 0);
  playerStore.playTrack(playlist.value.tracks[0]);
  libraryStore.pushHistory(playlist.value.tracks[0]);
}

function toggleFavorite(track) {
  if (track) libraryStore.toggleFav(track);
}

function queueTrack(track) {
  if (track) playerStore.addToQueue(track);
}

function toggleSavePlaylist() {
  if (!playlist.value) return;
  libraryStore.toggleSaved({
    browseId: playlist.value.browseId || route.params.id,
    title: playlist.value.title,
    thumbnail: playlist.value.thumbnail,
    type: 'playlist',
  });
}

onMounted(loadPlaylist);
watch(() => route.params.id, loadPlaylist);

async function loadPlaylist() {
  const playlistId = route.params.id;
  if (!playlistId) return;
  isLoading.value = true;
  playlist.value = null;

  // Check if it's a local playlist first
  const localPlaylist = libraryStore.playlists.find(p => p.id === playlistId);
  if (localPlaylist) {
    isLocal.value = true;
    playlist.value = {
      id: localPlaylist.id,
      browseId: localPlaylist.id,
      title: localPlaylist.name,
      thumbnail: localPlaylist.tracks[0]?.thumbnail || '',
      creator: 'You',
      description: `${localPlaylist.tracks.length} songs`,
      tracks: localPlaylist.tracks,
    };
    isLoading.value = false;
    return;
  }

  // Otherwise, fetch from API
  const params = route.query.params || '';
  try {
    const data = await api.getBrowse(playlistId, params);
    // Server response: { header: { title, subtitle, thumbnail, description }, tracks: [...], sections: [], playlistId }
    const header = data.header || {};
    const tracks = (data.tracks || []).map(songFromItem).filter(Boolean);
    // If no tracks at root, try sections
    if (!tracks.length && data.sections?.length) {
      const tracksSection = data.sections.find(s => s.items?.some(i => i.videoId)) || data.sections[0];
      tracks.push(...(tracksSection?.items || []).map(songFromItem).filter(Boolean));
    }
    playlist.value = {
      browseId: playlistId,
      title: header.title || data.title || 'Unknown Playlist',
      thumbnail: header.thumbnail || data.thumbnail || '',
      creator: header.subtitle || data.subtitle || '',
      description: header.subtitle || header.description || data.subtitle || `${tracks.length} songs`,
      tracks: tracks,
    };
  } catch (error) {
    console.error('Failed to load playlist:', error);
    playlist.value = null;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.playlist-view {
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

.track-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.track .art {
  width: 40px;
  height: 40px;
}

.track .tmeta {
  flex: 1;
  min-width: 0;
}

.track .tt {
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.track .ts {
  font-size: 13px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 3px;
}

.loading-note {
  color: var(--muted);
  font-size: 14.5px;
  padding: 48px 0;
  text-align: center;
}
</style>
