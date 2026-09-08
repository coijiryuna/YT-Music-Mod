<template>
  <div class="artist-view">
    <div v-if="isLoading" class="loading-note">Loading artist...</div>

    <div v-else-if="artist">
      <div class="detail-head artist">
        <img :src="artist.thumbnail || ''" :alt="artist.title" />
        <div class="detail-info">
          <div class="detail-kicker">Artist</div>
          <h1>{{ artist.title }}</h1>
          <div class="sub">{{ artist.followers || '0 followers' }}<template v-if="artist.genres?.length"> &bull; {{ artist.genres.join(', ') }}</template></div>
          <div class="detail-actions">
            <button class="pill-btn primary" @click="playArtistTopTracks">
              <svg class="ic"><use href="#i-play" /></svg>
              <span>Play</span>
            </button>
            <button class="pill-btn" @click="toggleSaveArtist">
              <svg class="ic"><use :href="isArtistSaved ? '#i-heart-f' : '#i-heart-o'" /></svg>
              <span>{{ isArtistSaved ? 'Saved' : 'Save' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Top Tracks -->
      <div class="shelf" v-if="topTracks.length">
        <div class="shelf-title">Top Tracks</div>
        <div class="track-list">
          <button
            v-for="(track, index) in topTracks"
            :key="track.videoId || index"
            class="track"
            :class="{ playing: playerStore.currentTrack?.videoId === track.videoId }"
            @click="playTrack(track)"
          >
            <span class="t-num">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="art">
              <img :src="track.thumbnail || artist.thumbnail || ''" :alt="track.title" />
            </div>
            <div class="tmeta">
              <div class="tt">{{ displayTitle(track.title) }}</div>
              <div class="ts">{{ track.artist || artist.title }}</div>
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

      <!-- Albums -->
      <div class="shelf" v-if="albums.length">
        <div class="shelf-title">Albums</div>
        <div class="carousel-wrap">
          <button class="car-btn car-prev" @click="scrollCarousel(-1)">
            <svg class="ic"><use href="#i-back" /></svg>
          </button>
          <div class="carousel" ref="carousel">
            <button
              v-for="album in albums"
              :key="album.browseId || album.id"
              class="card"
              @click="goToRoute(`/album/${album.browseId || album.id}`)"
            >
              <div class="art">
                <img :src="album.thumbnail" :alt="album.title" />
              </div>
              <div class="t">{{ album.title }}</div>
              <div class="s">{{ album.year }}</div>
            </button>
          </div>
          <button class="car-btn car-next" @click="scrollCarousel(1)">
            <svg class="ic"><use href="#i-fwd" /></svg>
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
              v-for="relatedArtist in relatedArtists"
              :key="relatedArtist.browseId || relatedArtist.id"
              class="card artist"
              @click="goToRoute(`/artist/${relatedArtist.browseId || relatedArtist.id}`)"
            >
              <div class="art">
                <img :src="relatedArtist.thumbnail" :alt="relatedArtist.title" />
              </div>
              <div class="t">{{ relatedArtist.title }}</div>
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
      <p>Artist not found</p>
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

const artist = ref(null);
const topTracks = ref([]);
const albums = ref([]);
const relatedArtists = ref([]);
const isLoading = ref(true);

const isArtistSaved = computed(() => {
  if (!artist.value?.browseId) return false;
  return libraryStore.isSaved(artist.value.browseId);
});

function goToRoute(path) {
  router.push(path);
}

function playTrack(track) {
  if (!track) return;
  playerStore.playTrack(track);
  libraryStore.pushHistory(track);
}

function playArtistTopTracks() {
  if (!topTracks.value.length) return;
  playerStore.setQueue(topTracks.value, 0);
  playerStore.playTrack(topTracks.value[0]);
  libraryStore.pushHistory(topTracks.value[0]);
}

function toggleFavorite(track) {
  if (track) libraryStore.toggleFav(track);
}

function queueTrack(track) {
  if (track) playerStore.addToQueue(track);
}

function toggleSaveArtist() {
  if (!artist.value) return;
  libraryStore.toggleSaved({
    browseId: artist.value.browseId || route.params.id,
    title: artist.value.title,
    thumbnail: artist.value.thumbnail,
    type: 'artist',
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
  const artistId = route.params.id;
  const params = route.query.params || '';
  try {
    const data = await api.getBrowse(artistId, params);
    // Server /api/browse returns { title, subtitle, thumbnail, sections: [...] }
    const sections = data.sections || [];
    // Find sections by title or content type
    const topTracksSection = sections.find(s => s.title?.toLowerCase().includes('top') || s.title?.toLowerCase().includes('song'));
    const albumsSection = sections.find(s => s.title?.toLowerCase().includes('album'));
    const relatedArtistsSection = sections.find(s => s.title?.toLowerCase().includes('related') || s.title?.toLowerCase().includes('similar'));
    artist.value = {
      browseId: artistId,
      title: data.title || 'Unknown Artist',
      thumbnail: data.thumbnail || '',
      followers: data.subtitle || '',
      genres: [],
    };
    topTracks.value = (topTracksSection?.items || []).map(songFromItem).filter(Boolean);
    albums.value = albumsSection?.items || [];
    relatedArtists.value = relatedArtistsSection?.items || [];
  } catch (error) {
    console.error('Failed to load artist:', error);
    artist.value = null;
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.artist-view {
  padding: 0 24px 48px;
}

.detail-head.artist img {
  border-radius: 50%;
}

.loading-note {
  color: var(--muted);
  font-size: 14.5px;
  padding: 48px 0;
  text-align: center;
}
</style>
