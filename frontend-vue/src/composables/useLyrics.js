/**
 * useLyrics.js — Lyrics loading, parsing, and rendering composable
 * Mirrors loadLyrics() / renderLyrics() / maybeRetryLyrics() from public/app.js
 */
import { ref } from 'vue';
import { usePlayerStore } from '../stores/player';
import { useUiStore } from '../stores/ui';
import { api } from './useApi';
import { parseLRC, displayTitle, looksLikePlays } from '../utils/helpers';

let lyricsReqId = 0;
let lastLyricsDuration = 0;
let lyricsRetried = false;

export function useLyrics() {
  const lyricsLoading = ref(false);

  /**
   * Load lyrics for a song
   * @param {Object} song - The song object
   * @param {Object} options - { silent: boolean, duration: number }
   */
  async function loadLyrics(song, { silent = false, duration = 0 } = {}) {
    const playerStore = usePlayerStore();
    if (!song) return;

    const myReq = ++lyricsReqId;
    lastLyricsDuration = duration;

    const artist = [song.artist, song.artists?.[0]?.name, song.subtitle]
      .map(x => String(x || '').split('•')[0].replace(/\s*-\s*topic$/i, '').trim())
      .find(x => x && !looksLikePlays(x)) || '';
    const title = displayTitle(song.title) || song.title;

    if (!silent) {
      lyricsLoading.value = true;
    }

    try {
      const d = await api(
        `/api/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&duration=${duration}&browseId=${encodeURIComponent(playerStore.lyricsBrowseId || '')}`
      );
      if (myReq !== lyricsReqId) return; // superseded
      // Never downgrade: keep existing synced lyrics if retry found less
      if (playerStore.lyrics.synced && !d.synced) return;
      playerStore.setLyrics({
        ...d,
        lines: d.synced ? parseLRC(d.synced) : [],
      });
    } catch {
      if (myReq !== lyricsReqId) return;
      if (!playerStore.lyrics.synced && !playerStore.lyrics.plain) {
        playerStore.setLyrics({ synced: null, plain: null, source: null, lines: [] });
      }
    } finally {
      lyricsLoading.value = false;
    }
  }

  /**
   * Retry lyrics once the real duration is known
   * @param {number} duration - The actual duration from YT player
   */
  function maybeRetryLyrics(duration) {
    const playerStore = usePlayerStore();
    const s = playerStore.currentTrackValue;
    if (!s || !duration) return;

    const noLyrics = !playerStore.lyrics.synced && !playerStore.lyrics.plain;
    const durChanged = Math.abs(duration - (lastLyricsDuration || 0)) > 2;
    if ((noLyrics || (durChanged && !playerStore.lyrics.synced)) && !lyricsRetried) {
      lyricsRetried = true;
      loadLyrics(s, { silent: true, duration });
    }
  }

  /**
   * Get the index of the currently active lyric line
   */
  function getActiveLyricIndex(currentTime) {
    const playerStore = usePlayerStore();
    const lines = playerStore.lyrics.lines;
    if (!lines.length) return -1;
    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].t - 0.2) idx = i;
      else break;
    }
    return idx;
  }

  /**
   * Get preview text for the current lyric line
   */
  function getLyricPreview(currentTime) {
    const playerStore = usePlayerStore();
    if (playerStore.lyrics.plain && !playerStore.lyrics.lines.length) {
      const first = String(playerStore.lyrics.plain).split('\n').map(x => x.trim()).find(Boolean) || '';
      return first;
    }
    const idx = getActiveLyricIndex(currentTime);
    return idx >= 0 ? playerStore.lyrics.lines[idx].text : '';
  }

  function resetRetry() {
    lyricsRetried = false;
  }

  return {
    lyricsLoading,
    loadLyrics,
    maybeRetryLyrics,
    getActiveLyricIndex,
    getLyricPreview,
    resetRetry,
  };
}
