/**
 * useYouTube.js — YouTube IFrame Player API wrapper for Vue
 * Loads the YT API, creates a player instance, and provides
 * reactive bindings to player state.
 */
import { ref, watch } from "vue";
import { usePlayerStore } from "../stores/player";
import { useLibraryStore } from "../stores/library";
import { useUiStore } from "../stores/ui";
import { normalizeSong, displayTitle, applyTint } from "../utils/helpers";
import { api } from "./useApi";

// Singleton state
const ytReady = ref(false);
const ytPlayer = ref(null);
let apiLoading = false;

const QUALITY_RANK = [
  "highres",
  "hd2160",
  "hd1440",
  "hd1080",
  "hd720",
  "large",
  "medium",
  "small",
  "tiny",
];

function qualityRank(q) {
  const i = QUALITY_RANK.indexOf(q);
  return i < 0 ? 99 : i;
}

function bestQuality() {
  if (!ytPlayer.value || !ytReady.value) return "highres";
  const levels = ytPlayer.value.getAvailableQualityLevels?.() || [];
  return QUALITY_RANK.find((q) => levels.includes(q)) || levels[0] || "highres";
}

function suggestedQuality() {
  const playerStore = usePlayerStore();
  return playerStore.hq ? "highres" : "hd720";
}

function applyPlaybackQuality() {
  if (!ytPlayer.value || !ytReady.value) return;
  const playerStore = usePlayerStore();
  if (playerStore.hq) {
    const best = bestQuality();
    playerStore.quality = best;
    try {
      ytPlayer.value.setSize(1920, 1080);
    } catch {}
    try {
      ytPlayer.value.setPlaybackQuality(best);
    } catch {}
  } else {
    playerStore.quality = "hd720";
    try {
      ytPlayer.value.setSize(720, 720);
    } catch {}
    try {
      ytPlayer.value.setPlaybackQuality("hd720");
    } catch {}
  }
}

function slimSong(s) {
  if (!s || !s.videoId) return null;
  return {
    videoId: s.videoId,
    title: s.title || "",
    artist: s.artist || s.subtitle || "",
    thumbnail: s.thumbnail || "",
    duration: s.duration || "",
    playlistId: s.playlistId || "",
    _user: !!s._user,
  };
}

import { store as storageStore } from "../utils/storage";

/** Persist queue to localStorage */
function persistQueue() {
  const playerStore = usePlayerStore();
  try {
    if (!playerStore.queue.length) {
      localStorage.removeItem("smw_qstate");
      return;
    }
    const q = playerStore.queue.map(slimSong).filter(Boolean).slice(0, 80);
    storageStore.set("qstate", {
      queue: q,
      index: Math.min(Math.max(0, playerStore.currentIndex), q.length - 1),
      shuffle: !!playerStore.shuffle,
      repeat: playerStore.repeat || 0,
      speed: playerStore.speed || 1,
    });
  } catch {}
}

/** Restore queue from localStorage */
function restoreQueue() {
  const playerStore = usePlayerStore();
  const st = storageStore.get("qstate", null);
  if (!st || !Array.isArray(st.queue) || !st.queue.length) return false;
  playerStore.setQueue(
    st.queue.map((s) => ({ ...normalizeSong(s), _user: !!s._user })),
    Math.min(Math.max(0, Number(st.index) || 0), st.queue.length - 1),
  );
  playerStore.shuffle = !!st.shuffle;
  playerStore.repeat = st.repeat === 1 || st.repeat === 2 ? st.repeat : 0;
  if (typeof st.speed === "number" && st.speed > 0)
    playerStore.speed = st.speed;
  playerStore.setCued(true);
  playerStore.setPending(null);
  const s = playerStore.currentTrackValue;
  if (!s) return false;
  // Cue the video (don't play yet)
  const tryCue = () => {
    if (!ytReady.value) return setTimeout(tryCue, 300);
    try {
      ytPlayer.value.cueVideoById({
        videoId: s.videoId,
        suggestedQuality: suggestedQuality(),
      });
      ytPlayer.value.setPlaybackRate(playerStore.speed);
    } catch {}
  };
  tryCue();
  return true;
}

/** Fetch radio queue from /api/next */
async function fetchQueue(song) {
  const playerStore = usePlayerStore();
  if (!song?.videoId) return;
  const vid = song.videoId;
  const loadId = playerStore.loadId;
  playerStore.setQueueFetching(true);
  try {
    const d = await api(
      `/api/next?videoId=${encodeURIComponent(song.videoId)}${song.playlistId ? `&playlistId=${encodeURIComponent(song.playlistId)}` : ""}`,
    );
    if (playerStore.cued || loadId !== playerStore.loadId) return;
    if (
      !vid ||
      !playerStore.currentTrackValue ||
      playerStore.currentTrackValue.videoId !== vid
    )
      return;
    playerStore.setLyricsBrowseId(d.lyricsBrowseId || null);
    playerStore.setRelatedBrowseId(d.relatedBrowseId || null);
    if (d.queue && d.queue.length > 1) {
      const current = playerStore.currentTrackValue;
      const userUpcoming = playerStore.queue.filter(
        (q, i) => i > playerStore.currentIndex && q._user,
      );
      const radio = d.queue
        .filter((q) => q.videoId && q.videoId !== current?.videoId)
        .filter((q) => !userUpcoming.some((u) => u.videoId === q.videoId))
        .map((q) => ({ ...normalizeSong(q), artist: q.artist, _user: false }));
      playerStore.setQueue(
        [current, ...userUpcoming, ...radio].filter(Boolean),
        0,
      );
    }
  } catch (e) {
    console.warn("queue fail", e);
  } finally {
    if (loadId === playerStore.loadId) playerStore.setQueueFetching(false);
  }
}

/** Start playing the current track on the YT player */
function startCurrent() {
  const playerStore = usePlayerStore();
  const libraryStore = useLibraryStore();
  playerStore.setCued(false);
  playerStore.setPending(null);
  const s = playerStore.currentTrackValue;
  if (!s) return;
  // Don't increment loadId here — it's already set by playTrack/nextTrack in the store.
  // Incrementing here would trigger the watch() in App.vue recursively.
  const loadId = playerStore.loadId;

  const tryPlay = () => {
    if (loadId !== playerStore.loadId) return;
    if (!ytReady.value) return setTimeout(tryPlay, 300);
    ytPlayer.value.loadVideoById({
      videoId: s.videoId,
      suggestedQuality: suggestedQuality(),
    });
    ytPlayer.value.setPlaybackRate(playerStore.speed);
    ytPlayer.value.playVideo();
    applyPlaybackQuality();
    setTimeout(applyPlaybackQuality, 400);
    setTimeout(applyPlaybackQuality, 1600);
  };
  tryPlay();

  libraryStore.pushHistory(s);
  playerStore.setLyrics({ synced: null, plain: null, source: null, lines: [] });
  playerStore.setRelatedBrowseId(null);
  playerStore.setRelatedLoaded(false);

  // Update UI
  document.title = `${s.title} • Rifa Music`;
  applyTint(s.videoId || s.title);

  // MediaSession
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: s.title,
      artist: s.artist || "",
      artwork: s.thumbnail ? [{ src: s.thumbnail, sizes: "544x544" }] : [],
    });
    navigator.mediaSession.setActionHandler("previoustrack", () => prevTrack());
    navigator.mediaSession.setActionHandler("nexttrack", () =>
      nextTrack(false),
    );
    navigator.mediaSession.setActionHandler("play", () =>
      ytPlayer.value?.playVideo(),
    );
    navigator.mediaSession.setActionHandler("pause", () =>
      ytPlayer.value?.pauseVideo(),
    );
  }

  // Fetch radio queue
  fetchQueue(s);
}

/** Next track */
function nextTrack(auto = false) {
  const playerStore = usePlayerStore();
  if (playerStore.cued) {
    if (auto) return;
    togglePlay();
    return;
  }
  if (playerStore.repeat === 2 && auto) {
    if (ytPlayer.value && ytReady.value) {
      try {
        ytPlayer.value.seekTo(0, true);
        ytPlayer.value.playVideo();
      } catch {}
    }
    return;
  }
  playerStore.nextTrack(auto);
}

/** Previous track */
function prevTrack() {
  const playerStore = usePlayerStore();
  if (playerStore.cued) {
    togglePlay();
    return;
  }
  if (ytPlayer.value?.getCurrentTime?.() > 4) {
    try {
      ytPlayer.value.seekTo(0, true);
    } catch {}
    return;
  }
  playerStore.previousTrack();
}

/** Toggle play/pause */
function togglePlay() {
  const playerStore = usePlayerStore();
  if (!playerStore.currentTrackValue) return;
  if (playerStore.cued) {
    const s = playerStore.currentTrackValue;
    startCurrent();
    return;
  }
  if (!ytPlayer.value || !ytReady.value) return;
  const st = ytPlayer.value.getPlayerState();
  if (st === 1)
    ytPlayer.value.pauseVideo(); // YT.PlayerState.PLAYING
  else ytPlayer.value.playVideo();
}

/** Load YT IFrame API and create player */
function initYouTubePlayer() {
  if (apiLoading) return;
  apiLoading = true;

  window.onYouTubeIframeAPIReady = () => {
    const playerStore = usePlayerStore();
    ytPlayer.value = new YT.Player("yt-player", {
      height: "720",
      width: "720",
      host: "https://www.youtube-nocookie.com",
      playerVars: {
        playsinline: 1,
        controls: 0,
        disablekb: 1,
        origin: "*",
        html5: { playerapi: 1 }, // Pastikan API HTML5 aktif
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        fs: 0,
        vq: "hd2160",
      },
      events: {
        onReady: () => {
          ytReady.value = true;
          const v = playerStore.volume;
          ytPlayer.value.setVolume(Number(v));
          applyPlaybackQuality();
          // Try to restore queue
          if (!playerStore.currentTrackValue) restoreQueue();
        },
        onStateChange: (e) => {
          if (e.data === 0) {
            // ENDED
            try {
              const vid = ytPlayer.value.getVideoData?.()?.video_id;
              if (
                vid &&
                playerStore.currentTrackValue &&
                vid !== playerStore.currentTrackValue.videoId
              )
                return;
            } catch {}
            nextTrack(true);
          }
          if (e.data === 1) {
            // PLAYING
            applyPlaybackQuality();
            setTimeout(applyPlaybackQuality, 500);
            setTimeout(applyPlaybackQuality, 2000);
          }
          if (e.data === 3) applyPlaybackQuality(); // BUFFERING
          playerStore.isPlaying = e.data === 1;
          document.body.classList.toggle("paused", e.data !== 1);
        },
        onPlaybackQualityChange: (e) => {
          const playerStore = usePlayerStore();
          if (!playerStore.hq) return;
          const best = bestQuality();
          if (e.data && qualityRank(e.data) > qualityRank(best))
            applyPlaybackQuality();
        },
        onError: () => {
          const ui = useUiStore();
          ui.showToast("Track unavailable, skipping…");
          setTimeout(() => nextTrack(true), 800);
        },
      },
    });
  };

  const s = document.createElement("script");
  s.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(s);
}

/** Progress tick loop — call every 400ms */
function progressTick() {
  const playerStore = usePlayerStore();
  const libraryStore = useLibraryStore();
  if (!ytPlayer.value || !ytReady.value || !playerStore.currentTrackValue)
    return;
  if (!ytPlayer.value.getDuration) return;

  const cur = ytPlayer.value.getCurrentTime?.() || 0;
  const dur = ytPlayer.value.getDuration?.() || 0;
  const playing = ytPlayer.value.getPlayerState?.() === 1;

  // Local scrobble: accumulate listen time
  if (playing && playerStore.currentTrackValue?.videoId) {
    libraryStore.addListenTime(playerStore.currentTrackValue.videoId, 0.4);
  }

  // SponsorBlock auto-skip
  if (playing && playerStore.sbEnabled && playerStore.sbSegments.length) {
    const seg = playerStore.sbSegments.find(
      (g) => cur >= g.start && cur < g.end - 0.3,
    );
    if (seg) {
      ytPlayer.value.seekTo(seg.end, true);
      const ui = useUiStore();
      ui.showToast(
        `⏩ Skipped ${seg.category.replace("_", " ")} (SponsorBlock)`,
      );
    }
  }

  // Update progress
  playerStore.updateProgress(cur, dur);

  // Persist queue periodically
  persistQueue();
}

/** Seek to position */
function seekTo(fraction) {
  const playerStore = usePlayerStore();
  if (!ytPlayer.value || !ytReady.value || !playerStore.duration) return;
  const time = fraction * playerStore.duration;
  ytPlayer.value.seekTo(time, true);
}

/** Set volume on YT player */
function setVolume(vol) {
  const playerStore = usePlayerStore();
  playerStore.setVolume(vol);
  if (ytPlayer.value && ytReady.value) {
    ytPlayer.value.setVolume(vol);
  }
}

/** Toggle HQ quality */
function toggleQuality() {
  const playerStore = usePlayerStore();
  const ui = useUiStore();
  playerStore.toggleHQ();
  ui.showToast(playerStore.hq ? "YouTube max quality" : "YouTube Music audio");
  applyPlaybackQuality();
}

export function useYouTube() {
  return {
    ytReady,
    ytPlayer,
    initYouTubePlayer,
    startCurrent,
    nextTrack,
    prevTrack,
    togglePlay,
    progressTick,
    seekTo,
    setVolume,
    applyPlaybackQuality,
    toggleQuality,
    persistQueue,
    restoreQueue,
    fetchQueue,
    suggestedQuality,
  };
}
