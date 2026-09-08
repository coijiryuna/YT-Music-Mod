<template>
  <div class="search-view">
    <div v-if="!searchQuery" class="page-title">Search</div>

    <div class="search-bar" :class="{ 'has-q': searchQuery }">
      <svg class="ic"><use href="#i-search" /></svg>
      <input
        id="search-input"
        v-model="searchQuery"
        type="text"
        placeholder="What do you want to play?"
        autocomplete="off"
        @keydown.enter="performSearch"
        @input="onSearchInput"
      />
      <button v-if="searchQuery" class="search-clear" @click="clearSearch">
        <svg class="ic"><use href="#i-x" /></svg>
      </button>
    </div>

    <!-- Search Suggestions -->
    <div v-if="suggestions.length" class="suggest">
      <button
        v-for="s in suggestions"
        :key="s"
        @click="applySuggestion(s)"
      >
        <svg class="ic"><use href="#i-search" /></svg>
        <span>{{ s }}</span>
      </button>
    </div>

    <!-- Search Filter Chips -->
    <div v-if="searchQuery && hasResults" class="search-chips">
      <button
        v-for="f in filters"
        :key="f.id"
        :class="['chip', { active: activeFilter === f.id }]"
        @click="setFilter(f.id)"
      >{{ f.label }}</button>
    </div>

    <!-- Recent Searches (when no query) -->
    <div v-if="!searchQuery && recentSearches.length" class="shelf">
      <div class="shelf-title recent-head">
        <span>Recent searches</span>
        <button class="q-clear" @click="clearRecentSearches">Clear</button>
      </div>
      <div class="recent-row">
        <span v-for="q in recentSearches" :key="q" class="recent-chip">
          <button class="recent-go" @click="searchFromRecent(q)">
            <svg class="ic"><use href="#i-clock" /></svg>
            <span>{{ q }}</span>
          </button>
          <button class="recent-x" @click="removeRecentSearch(q)">
            <svg class="ic"><use href="#i-x" /></svg>
          </button>
        </span>
      </div>
    </div>

    <div v-if="isSearching" class="loading-note">Searching…</div>

    <div v-else-if="hasResults" class="search-results">
      <!-- Top Result -->
      <div v-if="topResult" class="sr-top" :class="{ artist: topResult.type === 'artist' }" @click="handleResultClick(topResult)">
        <img :src="topResult.thumbnail" :alt="topResult.title" />
        <div class="sr-meta">
          <div class="sr-kicker">Top result</div>
          <div class="sr-title">{{ displayTitle(topResult.title) || topResult.title }}</div>
          <div class="sr-sub">{{ topResult.subtitle || topResult.artist || '' }}</div>
          <span class="pill-btn primary">
            <svg class="ic"><use :href="topResult.videoId ? '#i-play' : '#i-fwd'" /></svg>
            <span>{{ topResult.videoId ? 'Play' : 'Open' }}</span>
          </span>
        </div>
      </div>

      <!-- Songs Section -->
      <div v-if="results.songs.length" class="shelf">
        <div class="shelf-title">Songs</div>
        <div class="track-list">
          <button
            v-for="song in results.songs"
            :key="song.videoId"
            class="track"
            @click="playSong(song)"
          >
            <img :src="song.thumbnail" :alt="song.title" />
            <div class="tmeta">
              <div class="tt">{{ displayTitle(song.title) }}</div>
              <div class="ts">{{ song.artist || song.subtitle }}</div>
            </div>
            <div v-if="song.duration" class="tdur">{{ song.duration }}</div>
          </button>
        </div>
      </div>

      <!-- Artists Section -->
      <div v-if="results.artists.length" class="shelf">
        <div class="shelf-title">Artists</div>
        <div class="carousel-wrap">
          <button class="car-btn car-prev" @click="scrollCarousel($event, -1)"><svg class="ic"><use href="#i-back" /></svg></button>
          <div class="carousel">
            <button v-for="artist in results.artists" :key="artist.browseId" class="card artist" @click="goToRoute(`/artist/${artist.browseId}`)">
              <div class="art"><img :src="artist.thumbnail" :alt="artist.title" /></div>
              <div class="t">{{ artist.title }}</div>
              <div class="s">Artist</div>
            </button>
          </div>
          <button class="car-btn car-next" @click="scrollCarousel($event, 1)"><svg class="ic"><use href="#i-fwd" /></svg></button>
        </div>
      </div>

      <!-- Albums Section -->
      <div v-if="results.albums.length" class="shelf">
        <div class="shelf-title">Albums</div>
        <div class="carousel-wrap">
          <button class="car-btn car-prev" @click="scrollCarousel($event, -1)"><svg class="ic"><use href="#i-back" /></svg></button>
          <div class="carousel">
            <button v-for="album in results.albums" :key="album.browseId" class="card" @click="goToRoute(`/album/${album.browseId}`)">
              <div class="art"><img :src="album.thumbnail" :alt="album.title" /></div>
              <div class="t">{{ album.title }}</div>
              <div class="s">{{ album.artist }}</div>
            </button>
          </div>
          <button class="car-btn car-next" @click="scrollCarousel($event, 1)"><svg class="ic"><use href="#i-fwd" /></svg></button>
        </div>
      </div>

      <!-- Playlists Section -->
      <div v-if="results.playlists.length" class="shelf">
        <div class="shelf-title">Playlists</div>
        <div class="carousel-wrap">
          <button class="car-btn car-prev" @click="scrollCarousel($event, -1)"><svg class="ic"><use href="#i-back" /></svg></button>
          <div class="carousel">
            <button v-for="pl in results.playlists" :key="pl.browseId" class="card" @click="goToRoute(`/playlist/${pl.browseId}`)">
              <div class="art"><img :src="pl.thumbnail" :alt="pl.title" /></div>
              <div class="t">{{ pl.title }}</div>
              <div class="s">{{ pl.subtitle || 'Playlist' }}</div>
            </button>
          </div>
          <button class="car-btn car-next" @click="scrollCarousel($event, 1)"><svg class="ic"><use href="#i-fwd" /></svg></button>
        </div>
      </div>
    </div>

    <!-- Browse All (Mood Grid when no query) -->
    <div v-if="!searchQuery && !isSearching" id="browse-all">
      <div class="shelf-title">Browse all</div>
      <div v-if="moodCategories.length" class="mood-grid">
        <button
          v-for="(cat, i) in moodCategories"
          :key="cat.browseId || cat.title"
          class="mood-card"
          :style="{ '--mc': cat.color || moodColors[i % moodColors.length] }"
          @click="goToMood(cat)"
        >{{ cat.title }}</button>
      </div>
      <div v-else class="loading-note">Loading…</div>
    </div>

    <div v-if="!isSearching && searchQuery && !hasResults" class="empty-note">
      <p>No results found for "{{ searchQuery }}"</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLibraryStore } from '../stores/library';
import { usePlayerStore } from '../stores/player';
import { useApi } from '../composables/useApi';
import { store } from '../utils/storage';
import { displayTitle, songFromItem } from '../utils/helpers';

const route = useRoute();
const router = useRouter();
const libraryStore = useLibraryStore();
const playerStore = usePlayerStore();
const api = useApi();

const searchQuery = ref('');
const isSearching = ref(false);
const suggestions = ref([]);
const results = ref({ songs: [], artists: [], albums: [], playlists: [] });
const topResult = ref(null);
const activeFilter = ref('all');
const moodCategories = ref([]);
const recentSearches = ref(store.get('srec', []).filter(Boolean).slice(0, 8));
let sugTimeout = null;

const moodColors = ['#1db954','#e13300','#7358ff','#e8115b','#148a08','#dc148c','#537aa1','#8d67ab','#e91429','#1e3264','#477d95','#af2896','#ba5d07','#0d73ec','#8c1932','#bc5900'];

const filters = [
  { id: 'all', label: 'All' },
  { id: 'songs', label: 'Songs' },
  { id: 'videos', label: 'Videos' },
  { id: 'albums', label: 'Albums' },
  { id: 'artists', label: 'Artists' },
  { id: 'playlists', label: 'Playlists' },
];

const hasResults = computed(() =>
  results.value.songs.length > 0 ||
  results.value.artists.length > 0 ||
  results.value.albums.length > 0 ||
  results.value.playlists.length > 0 ||
  topResult.value !== null
);

async function performSearch() {
  const q = searchQuery.value.trim();
  if (!q) { results.value = { songs: [], artists: [], albums: [], playlists: [] }; topResult.value = null; return; }
  isSearching.value = true;
  results.value = { songs: [], artists: [], albums: [], playlists: [] };
  topResult.value = null;
  suggestions.value = [];
  pushRecentSearch(q);
  try {
    const filterParam = activeFilter.value !== 'all' ? `&filter=${activeFilter.value}` : '';
    const data = await api.search(q, activeFilter.value !== 'all' ? activeFilter.value : '');
    const sections = data.sections || [];
    const leftover = [];
    for (const sec of sections) {
      if (/^top result$/i.test(sec.title || '') && sec.items?.[0]) {
        topResult.value = sec.items[0];
        continue;
      }
      leftover.push(...(sec.items || []));
    }
    // Classify leftover items
    for (const item of leftover) {
      const type = item.type || (item.videoId ? 'song' : 'browse');
      if (type === 'song' || type === 'video') results.value.songs.push(songFromItem(item));
      else if (type === 'artist') results.value.artists.push(item);
      else if (type === 'album') results.value.albums.push(item);
      else if (type === 'playlist') results.value.playlists.push(item);
    }
  } catch (error) {
    console.error('Search failed:', error);
  } finally {
    isSearching.value = false;
  }
}

function onSearchInput() {
  clearTimeout(sugTimeout);
  const v = searchQuery.value.trim();
  if (!v) { suggestions.value = []; return; }
  sugTimeout = setTimeout(async () => {
    try {
      const d = await api.getSearchSuggestions(v);
      suggestions.value = (d.suggestions || []).slice(0, 6);
    } catch { suggestions.value = []; }
  }, 220);
}

function applySuggestion(s) {
  searchQuery.value = s;
  pushRecentSearch(s);
  router.push(`/search/${encodeURIComponent(s)}`);
  performSearch();
}

function clearSearch() {
  searchQuery.value = '';
  results.value = { songs: [], artists: [], albums: [], playlists: [] };
  topResult.value = null;
  suggestions.value = [];
  router.push('/search');
}

function setFilter(f) {
  activeFilter.value = f;
  if (searchQuery.value) performSearch();
}

function playSong(song) {
  if (!song) return;
  playerStore.playTrack(song);
  libraryStore.pushHistory(song);
}

function handleResultClick(item) {
  if (item.videoId) playSong(item);
  else if (item.browseId) {
    if (item.type === 'artist') goToRoute(`/artist/${item.browseId}`);
    else if (item.type === 'album') goToRoute(`/album/${item.browseId}`);
    else goToRoute(`/playlist/${item.browseId}`);
  }
}

function goToRoute(path) { router.push(path); }

function goToMood(cat) {
  if (cat.params) {
    router.push(`/browse/${cat.browseId}?params=${encodeURIComponent(cat.params)}`);
  } else {
    router.push(`/browse/${cat.browseId}`);
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

// Recent searches
function pushRecentSearch(q) {
  q = String(q || '').trim();
  if (!q) return;
  const list = [q, ...store.get('srec', []).filter(x => String(x).toLowerCase() !== q.toLowerCase())].slice(0, 8);
  store.set('srec', list);
  recentSearches.value = list;
}
function removeRecentSearch(q) {
  const list = store.get('srec', []).filter(x => x !== q);
  store.set('srec', list);
  recentSearches.value = list;
}
function clearRecentSearches() {
  store.set('srec', []);
  recentSearches.value = [];
}
function searchFromRecent(q) {
  searchQuery.value = q;
  router.push(`/search/${encodeURIComponent(q)}`);
  performSearch();
}

watch(() => route.params.query, (newQuery) => {
  if (newQuery) {
    searchQuery.value = decodeURIComponent(newQuery);
    performSearch();
  } else {
    searchQuery.value = '';
    results.value = { songs: [], artists: [], albums: [], playlists: [] };
    topResult.value = null;
  }
});

onMounted(async () => {
  const query = route.params.query;
  if (query) {
    searchQuery.value = decodeURIComponent(query);
    performSearch();
  }
  // Load mood categories for browse-all
  if (!query) {
    try {
      const d = await api.getMoods();
      moodCategories.value = d.categories || d.moods || d || [];
    } catch { moodCategories.value = []; }
  }
});
</script>

<style scoped>
.search-view {
  padding: 0 24px 48px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--elevated);
  border-radius: 999px;
  padding: 0 16px;
  margin-bottom: 16px;
  height: 42px;
  border: 2px solid transparent;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}

.search-bar:focus-within {
  border-color: var(--text);
  background: var(--card-hover);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--text) 8%, transparent);
}

.search-bar input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 15px;
  font-weight: 500;
}

.search-bar input::placeholder {
  color: var(--muted);
}

.search-clear {
  color: var(--muted);
  padding: 4px;
}

.search-clear:hover {
  color: var(--text);
}

.suggest {
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
}

.suggest button {
  text-align: left;
  padding: 10px 18px;
  border-radius: 6px;
  color: var(--muted);
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}

.suggest button:hover {
  background: var(--hover-strong);
  color: var(--text);
}

.search-chips {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

/* Top result */
.sr-top {
  display: flex;
  gap: 16px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.sr-top:hover {
  background: var(--hover-strong);
}

.sr-top img {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
}

.sr-top.artist img {
  border-radius: 50%;
}

.sr-meta {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 6px;
  min-width: 0;
}

.sr-kicker {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.sr-title {
  font-size: 22px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sr-sub {
  font-size: 14px;
  color: var(--muted);
}

/* Recent searches */
.recent-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.recent-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--hover-strong);
  border-radius: 999px;
  padding: 2px 4px 2px 12px;
  font-size: 13px;
}

.recent-go {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  font-weight: 600;
}

.recent-x {
  color: var(--muted);
  padding: 6px;
  border-radius: 50%;
}

.recent-x:hover {
  color: var(--text);
  background: var(--hover);
}

.q-clear {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--hover-strong);
}

.q-clear:hover {
  color: var(--text);
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
</style>
