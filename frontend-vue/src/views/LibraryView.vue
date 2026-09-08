<template>
  <div class="library-view">
    <h1 class="page-title">Library</h1>

    <!-- Tab Chips -->
    <div class="chip-row">
      <button
        v-for="tab in libTabs"
        :key="tab.id"
        :class="['chip', { active: activeLibTab === tab.id }]"
        @click="goToTab(tab.id)"
      >{{ tab.label }}</button>
    </div>

    <!-- Playlists Tab -->
    <div v-if="activeLibTab === 'playlists'" class="lib-content">
      <div class="lib-actions">
        <button class="pill-btn primary" @click="openCreatePlaylistModal">
          <svg class="ic"><use href="#i-plus" /></svg>
          <span>New playlist</span>
        </button>
      </div>
      <div v-if="cards.length" class="lib-grid">
        <!-- Liked Songs card -->
        <button v-if="libraryStore.favorites.length" class="card" @click="goToRoute('/library/favorites')">
          <div class="art liked-cover">
            <svg class="ic liked-heart"><use href="#i-heart-f" /></svg>
            <div class="play-ov"><svg class="ic"><use href="#i-play" /></svg></div>
          </div>
          <div class="t">Liked Songs</div>
          <div class="s">{{ libraryStore.favorites.length }} songs</div>
        </button>
        <!-- User playlists -->
        <button
          v-for="pl in libraryStore.playlists"
          :key="pl.id"
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
      <div v-else class="empty-note">
        <p>No playlists yet</p>
        <p>Use New playlist above to create one.</p>
      </div>
    </div>

    <!-- Favorites Tab -->
    <div v-if="activeLibTab === 'favorites'" class="lib-content">
      <div v-if="libraryStore.favorites.length" class="lib-actions">
        <button class="pill-btn primary" @click="playAllFavorites">
          <svg class="ic"><use href="#i-play" /></svg>
          <span>Play all</span>
        </button>
        <button class="pill-btn" @click="shuffleAllFavorites">
          <svg class="ic"><use href="#i-shuffle" /></svg>
          <span>Shuffle</span>
        </button>
      </div>
      <div v-if="libraryStore.favorites.length" class="track-list">
        <div class="track-head"><span class="th-n">#</span><span class="th-t">Title</span></div>
        <button
          v-for="(song, i) in libraryStore.favorites"
          :key="song.videoId"
          class="track"
          :class="{ playing: playerStore.currentTrackValue?.videoId === song.videoId }"
          @click="playSong(song)"
        >
          <span class="t-num">{{ i + 1 }}</span>
          <img :src="song.thumbnail" :alt="song.title" />
          <div class="tmeta">
            <div class="tt">{{ displayTitle(song.title) }}</div>
            <div class="ts">{{ song.artist || song.subtitle }}</div>
          </div>
        </button>
      </div>
      <div v-else class="empty-note">
        <p>No liked songs yet</p>
        <p>Tap the heart on any song to save it here.</p>
      </div>
    </div>

    <!-- Saved Tab -->
    <div v-if="activeLibTab === 'saved'" class="lib-content">
      <div v-if="libraryStore.saved.length" class="lib-grid">
        <button
          v-for="item in libraryStore.saved"
          :key="item.browseId"
          class="card"
          :class="{ artist: item.type === 'artist' }"
          @click="goToItem(item)"
        >
          <div class="art">
            <img :src="item.thumbnail" :alt="item.title" />
            <div class="play-ov"><svg class="ic"><use href="#i-play" /></svg></div>
          </div>
          <div class="t">{{ item.title }}</div>
          <div class="s">{{ item.type === 'artist' ? 'Artist' : item.type === 'album' ? 'Album' : 'Playlist' }}</div>
        </button>
      </div>
      <div v-else class="empty-note">
        <p>Nothing saved yet</p>
        <p>Open any album, playlist or artist and tap Save.</p>
      </div>
    </div>

    <!-- History Tab -->
    <div v-if="activeLibTab === 'history'" class="lib-content">
      <div v-if="libraryStore.history.length" class="track-list">
        <div class="track-head"><span class="th-n">#</span><span class="th-t">Title</span></div>
        <button
          v-for="(song, i) in libraryStore.history"
          :key="'hist-' + song.videoId"
          class="track"
          :class="{ playing: playerStore.currentTrackValue?.videoId === song.videoId }"
          @click="playSong(song)"
        >
          <span class="t-num">{{ i + 1 }}</span>
          <img :src="song.thumbnail" :alt="song.title" />
          <div class="tmeta">
            <div class="tt">{{ displayTitle(song.title) }}</div>
            <div class="ts">{{ song.artist || song.subtitle }}</div>
          </div>
        </button>
      </div>
      <div v-else class="empty-note">
        <p>Nothing played yet</p>
        <p>Songs you play will show up here.</p>
      </div>
    </div>

    <!-- Stats Tab -->
    <div v-if="activeLibTab === 'stats'" class="lib-content">
      <div class="stats-cards">
        <div class="stat-card"><div class="stat-num">{{ totalPlays }}</div><div class="stat-lbl">Total plays</div></div>
        <div class="stat-card"><div class="stat-num">{{ totalMinutes }}</div><div class="stat-lbl">Minutes listened</div></div>
        <div class="stat-card"><div class="stat-num">{{ uniqueSongs }}</div><div class="stat-lbl">Unique songs</div></div>
        <div class="stat-card"><div class="stat-num">{{ uniqueArtists }}</div><div class="stat-lbl">Artists</div></div>
      </div>

      <div v-if="topArtists.length" class="shelf">
        <div class="shelf-title">Top artists</div>
        <div v-for="(a, i) in topArtists" :key="a[0]" class="stat-bar-row">
          <span class="sb-rank">{{ i + 1 }}</span>
          <span class="sb-name">{{ a[0] }}</span>
          <div class="sb-bar"><div :style="{ width: (a[1] / maxArtistPlays * 100) + '%' }"></div></div>
          <span class="sb-n">{{ a[1] }}</span>
        </div>
      </div>

      <div v-if="topSongs.length" class="shelf">
        <div class="shelf-title">Most played</div>
        <div class="track-head"><span class="th-n">#</span><span class="th-t">Title</span></div>
        <div class="track-list">
          <button
            v-for="(r, i) in topSongs"
            :key="r.videoId"
            class="track"
            @click="playSong(r)"
          >
            <span class="t-num">{{ i + 1 }}</span>
            <img :src="r.thumbnail" :alt="r.title" />
            <div class="tmeta">
              <div class="tt">{{ displayTitle(r.title) }}</div>
              <div class="ts">{{ r.artist }} · {{ r.plays }} plays · {{ Math.round(r.secs / 60) }} min</div>
            </div>
          </button>
        </div>
      </div>

      <div v-if="!topSongs.length" class="empty-note">
        <p>No stats yet</p>
        <p>Play some music — totals build up as you listen.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { useUiStore } from '../stores/ui';
import { displayTitle, applyTint } from '../utils/helpers';

const route = useRoute();
const router = useRouter();
const libraryStore = useLibraryStore();
const playerStore = usePlayerStore();
const uiStore = useUiStore();

const activeLibTab = ref('playlists');

const libTabs = [
  { id: 'playlists', label: 'Playlists' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'saved', label: 'Saved' },
  { id: 'history', label: 'History' },
  { id: 'stats', label: 'Stats' },
];

const cards = computed(() => {
  return libraryStore.playlists.length > 0 || libraryStore.favorites.length > 0;
});

const statsRows = computed(() => {
  return Object.entries(libraryStore.stats).map(([videoId, v]) => ({ videoId, ...v }));
});

const totalPlays = computed(() => statsRows.value.reduce((a, r) => a + (r.plays || 0), 0));
const totalMinutes = computed(() => Math.round(statsRows.value.reduce((a, r) => a + (r.secs || 0), 0) / 60));
const uniqueSongs = computed(() => statsRows.value.length);
const uniqueArtists = computed(() => {
  const byArtist = {};
  statsRows.value.forEach(r => {
    const a = (r.artist || 'Unknown').split(',')[0].trim() || 'Unknown';
    byArtist[a] = (byArtist[a] || 0) + r.plays;
  });
  return Object.keys(byArtist).length;
});

const topArtists = computed(() => {
  const byArtist = {};
  statsRows.value.forEach(r => {
    const a = (r.artist || 'Unknown').split(',')[0].trim() || 'Unknown';
    byArtist[a] = (byArtist[a] || 0) + r.plays;
  });
  return Object.entries(byArtist).sort((x, y) => y[1] - x[1]).slice(0, 10);
});

const maxArtistPlays = computed(() => topArtists.value[0] ? topArtists.value[0][1] : 1);

const topSongs = computed(() => [...statsRows.value].sort((x, y) => y.plays - x.plays).slice(0, 20));

function goToRoute(path) { router.push(path); }
function goToTab(tab) {
  if (tab === 'stats') { activeLibTab.value = 'stats'; return; }
  activeLibTab.value = tab;
}
function goToItem(item) {
  if (item.type === 'artist') goToRoute(`/artist/${item.browseId}`);
  else if (item.type === 'album') goToRoute(`/album/${item.browseId}`);
  else goToRoute(`/playlist/${item.browseId}`);
}
function playSong(song) {
  if (!song) return;
  playerStore.playTrack(song);
  libraryStore.pushHistory(song);
}
function openCreatePlaylistModal() { uiStore.openCreatePlaylist(); }

function playAllFavorites() {
  const q = [...libraryStore.favorites];
  if (q.length) { playerStore.setQueue(q, 0); playerStore.playTrack(q[0]); }
}
function shuffleAllFavorites() {
  const q = [...libraryStore.favorites].sort(() => Math.random() - 0.5);
  if (q.length) { playerStore.setQueue(q, 0); playerStore.playTrack(q[0]); }
}

onMounted(() => {
  applyTint('library');
  const path = route.path;
  if (path.includes('/favorites')) activeLibTab.value = 'favorites';
  else if (path.includes('/saved')) activeLibTab.value = 'saved';
  else if (path.includes('/history')) activeLibTab.value = 'history';
  else if (path.includes('/stats')) activeLibTab.value = 'stats';
  else activeLibTab.value = 'playlists';
});

watch(() => route.path, (newPath) => {
  if (newPath.includes('/favorites')) activeLibTab.value = 'favorites';
  else if (newPath.includes('/saved')) activeLibTab.value = 'saved';
  else if (newPath.includes('/history')) activeLibTab.value = 'history';
  else if (newPath.includes('/stats')) activeLibTab.value = 'stats';
});
</script>

<style scoped>
.library-view {
  padding: 0 24px 48px;
}

.chip-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.lib-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--text) 28%, transparent);
  border-radius: 999px;
  font-size: 13.5px;
  font-weight: 700;
  transition: transform 0.12s, border-color 0.15s;
}

.pill-btn .ic { width: 15px; height: 15px; }

.pill-btn:hover { border-color: var(--text); transform: scale(1.04); }

.pill-btn.primary {
  background: var(--accent-bright);
  border-color: transparent;
  color: #000;
}

.liked-cover {
  background: linear-gradient(135deg, #450af5 0%, #8d67ab 48%, #1db954 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.liked-heart {
  width: 64px;
  height: 64px;
  color: #fff;
}

.track-head {
  display: flex;
  align-items: center;
  padding: 6px 14px 8px;
  margin: 8px 0 2px;
  border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
  color: var(--muted);
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.th-n { width: 22px; text-align: center; margin-right: 54px; }
.th-t { flex: 1; }

.track-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stats-cards {
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
}

.stat-num { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
.stat-lbl { font-size: 13px; color: var(--muted); }

.stat-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
}

.sb-rank { width: 22px; font-weight: 800; color: var(--muted); text-align: center; }
.sb-name { font-weight: 600; min-width: 100px; }
.sb-bar { flex: 1; height: 4px; background: var(--bar-bg); border-radius: 2px; overflow: hidden; }
.sb-bar div { height: 100%; background: var(--accent-bright); border-radius: 2px; }
.sb-n { font-weight: 700; font-variant-numeric: tabular-nums; min-width: 30px; text-align: right; }

.empty-note {
  color: var(--muted);
  font-size: 14.5px;
  padding: 48px 0;
  text-align: center;
}
</style>
