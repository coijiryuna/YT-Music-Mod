<template>
  <div class="album-view">
    <div v-if="isLoading" class="loading-note">Loading album...</div>

    <div v-else-if="album">
      <div class="detail-head">
        <img :src="album.thumbnail || ''" :alt="album.title" />
        <div class="detail-info">
          <div class="detail-kicker">Album</div>
          <h1>{{ album.title }}</h1>
          <div class="sub">{{ album.artist }}<template v-if="album.year"> &bull; {{ album.year }}</template> &bull; {{ album.tracks?.length || 0 }} songs</div>
          <div class="detail-actions">
            <button class="pill-btn primary" @click="playAlbum">
              <svg class="ic"><use href="#i-play" /></svg>
              <span>Play</span>
            </button>
            <button class="pill-btn" @click="toggleSaveAlbum">
              <svg class="ic"><use :href="isAlbumSaved ? '#i-heart-f' : '#i-heart-o'" /></svg>
              <span>{{ isAlbumSaved ? 'Saved' : 'Save' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Tracks List -->
      <div class="shelf" v-if="album.tracks?.length">
        <div class="shelf-title">Tracks</div>
        <div class="track-list">
          <button
            v-for="(track, index) in album.tracks"
            :key="track.videoId || index"
            class="track"
            :class="{ playing: playerStore.currentTrack?.videoId === track.videoId }"
            @click="playTrack(track)"
          >
            <span class="t-num">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="art">
              <img :src="track.thumbnail || album.thumbnail || ''" :alt="track.title" />
            </div>
            <div class="tmeta">
              <div class="tt">{{ displayTitle(track.title) }}</div>
              <div class="ts">{{ track.artist || album.artist }}</div>
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

      <!-- Related Artists -->
      <div class="shelf" v-if="relatedArtists.length">
        <div class="shelf-title">Related Artists</div>
        <div class="carousel-wrap">
          <button class="car-btn car-prev" @click="scrollCarousel(-1)">
            <svg class="ic"><use href="#i-back" /></svg>
          </button>
          <div class="carousel" ref="carousel">
            <button
              v-for="artist in relatedArtists"
              :key="artist.browseId || artist.id"
              class="card artist"
              @click="goToRoute(`/artist/${artist.browseId || artist.id}`)"
            >
              <div class="art">
                <img :src="artist.thumbnail" :alt="artist.title" />
              </div>
              <div class="t">{{ artist.title }}</div>
              <div class="s">Artist</div>
            </button>
          </div>
          <button class="car-btn car-next" @click="scrollCarousel(1)">
            <svg class="ic"><use href="#i-fwd" /></svg>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-note">
      <p>Album not found</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
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

const album = ref(null);
const relatedArtists = ref([]);
const isLoading = ref(true);

const isAlbumSaved = computed(() => {
  if (!album.value?.browseId) return false;
  return libraryStore.isSaved(album.value.browseId);
});

function goToRoute(path) {
  router.push(path);
}

function playTrack(track) {
  if (!track) return;
  playerStore.playTrack(track);
  libraryStore.pushHistory(track);
}

function playAlbum() {
  if (!album.value?.tracks?.length) return;
  playerStore.setQueue(album.value.tracks, 0);
  playerStore.playTrack(album.value.tracks[0]);
  libraryStore.pushHistory(album.value.tracks[0]);
}

function toggleFavorite(track) {
  if (track) libraryStore.toggleFav(track);
}

function queueTrack(track) {
  if (track) playerStore.addToQueue(track);
}

function toggleSaveAlbum() {
  if (!album.value) return;
  libraryStore.toggleSaved({
    browseId: album.value.browseId || route.params.id,
    title: album.value.title,
    thumbnail: album.value.thumbnail,
    type: 'album',
  });
}

function scrollCarousel(direction) {
  const carousel = document.querySelector('.carousel');
  if (carousel) {
    const scrollAmount = direction > 0 ? 300 : -300;
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}

onMounted(async () => {
  const albumId = route.params.id;
  const params = route.query.params || '';
  try {
    const data = await api.getBrowse(albumId, params);
    // Server /api/browse returns { title, subtitle, thumbnail, sections: [...] }
    const sections = data.sections || [];
    // Find the tracks section (usually the first section with items that have videoId)
    const tracksSection = sections.find(s => s.items?.some(i => i.videoId)) || sections[0];
    const tracks = (tracksSection?.items || []).map(songFromItem).filter(Boolean);
    // Find related artists section
    const artistsSection = sections.find(s => s.title?.toLowerCase().includes('artist') || s.items?.every(i => i.type === 'artist'));
    album.value = {
      browseId: albumId,
      title: data.title || 'Unknown Album',
      artist: data.subtitle || '',
      year: '',
      thumbnail: data.thumbnail || '',
      tracks: tracks,
    };
    relatedArtists.value = artistsSection?.items || [];
  } catch (error) {
    console.error('Failed to load album:', error);
    album.value = null;
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.album-view {
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
