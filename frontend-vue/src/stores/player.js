import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { store } from "../utils/storage";
import { useUiStore } from "./ui";
import { useLibraryStore } from "./library";

export const usePlayerStore = defineStore("player", () => {
  // Player state
  const currentTrack = ref(null);
  const queue = ref([]);
  const currentIndex = ref(-1);
  const isPlaying = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const volume = ref(store.get("vol", 100));
  const shuffle = ref(false);
  const repeat = ref(0); // 0 none, 1 all, 2 one
  const speed = ref(store.get("speed", 1));
  const lyrics = ref({ synced: null, plain: null, source: null, lines: [] });
  const lyricsBrowseId = ref(null);
  const relatedBrowseId = ref(null);
  const relatedLoaded = ref(false);
  const cued = ref(false);
  const pending = ref(null);
  const loadId = ref(0);
  const queueFetching = ref(false);
  const hq = ref(store.get("yt_hq", false));
  const quality = ref("hd720");
  const sbEnabled = ref(store.get("sb_on", true));
  const sbSegments = ref([]);
  const floatOn = ref(false);
  const sleepTimer = ref(null); // { remaining: seconds, timerId: interval }
  const ytInitialized = ref(false);

  // Computed properties
  const currentTrackValue = computed(() => {
    return queue.value[currentIndex.value] || null;
  });

  const canGoPrevious = computed(() => {
    return (
      currentIndex.value > 0 ||
      (currentTrackValue.value && currentTime.value > 4)
    );
  });

  const canGoNext = computed(() => {
    return queue.value.length > 1;
  });

  const playIcon = computed(() => {
    return isPlaying.value ? "#i-pause" : "#i-play";
  });

  const repeatIcon = computed(() => {
    return repeat.value === 2 ? "#i-repeat-1" : "#i-repeat";
  });

  const userQueueCount = computed(() => {
    return queue.value.filter((q, i) => i > currentIndex.value && q._user)
      .length;
  });

  // Actions — these delegate to useYouTube composable when available,
  // but can also work standalone (for SSR / testing)

  function playQueueIndex(index) {
    if (index < 0 || index >= queue.value.length) return;
    currentIndex.value = index;
    currentTrack.value = queue.value[index];
    isPlaying.value = true;
    loadId.value++;
    ytInitialized.value = true;

    const libraryStore = useLibraryStore();
    libraryStore.pushHistory(queue.value[index]);
    document.title = `${queue.value[index].title} • Rifa Music`;
  }

  function playTrack(track, trackQueue = null, index = null) {
    if (!track || !track.videoId) return;
    const libraryStore = useLibraryStore();

    cued.value = false;
    pending.value = null;

    if (trackQueue) {
      queue.value = trackQueue.map((q) => ({ ...q, _user: false }));
      let idx =
        index ?? trackQueue.findIndex((q) => q.videoId === track.videoId);
      if (!Number.isFinite(idx) || idx < 0) idx = 0;
      currentIndex.value = idx;
    } else {
      queue.value = [{ ...track, _user: false }];
      currentIndex.value = 0;
    }
    currentTrack.value = track;
    isPlaying.value = true;
    currentTime.value = 0;
    duration.value = 0;
    lyrics.value = { synced: null, plain: null, source: null, lines: [] };
    relatedBrowseId.value = null;
    relatedLoaded.value = false;
    loadId.value++;

    // Mark as YT-initialized so App.vue can call startCurrent()
    ytInitialized.value = true;

    // Update document title
    document.title = `${track.title} • Rifa Music`;
  }

  const uiStore = useUiStore();

  function togglePlay() {
    if (!currentTrackValue.value) return;
    isPlaying.value = !isPlaying.value;
    if (!uiStore.videoMode) {
      uiStore.videoMode = true;
    }
  }

  function nextTrack(auto = false) {
    if (cued.value) {
      if (auto) return;
      togglePlay();
      return;
    }

    if (repeat.value === 2 && auto) {
      currentTime.value = 0;
      isPlaying.value = true;
      return;
    }

    if (!queue.value.length) return;
    let ni;
    if (shuffle.value) {
      const userNext = queue.value.findIndex(
        (q, i) => i > currentIndex.value && q._user,
      );
      if (userNext >= 0) ni = userNext;
      else {
        const others = queue.value
          .map((_, i) => i)
          .filter((i) => i !== currentIndex.value);
        if (!others.length) {
          if (repeat.value === 1) ni = currentIndex.value;
          else return;
        } else ni = others[Math.floor(Math.random() * others.length)];
      }
    } else ni = currentIndex.value + 1;

    if (ni >= queue.value.length) {
      if (repeat.value === 1) ni = 0;
      else return;
    }

    currentIndex.value = ni;
    currentTrack.value = queue.value[ni];
    isPlaying.value = true;
    loadId.value++;
    ytInitialized.value = true;

    const libraryStore = useLibraryStore();
    libraryStore.pushHistory(queue.value[ni]);
    document.title = `${queue.value[ni].title} • Rifa Music`;
  }

  function previousTrack() {
    if (cued.value) {
      togglePlay();
      return;
    }

    if (currentTime.value > 4) {
      currentTime.value = 0;
      return;
    }

    if (currentIndex.value > 0) {
      currentIndex.value--;
      currentTrack.value = queue.value[currentIndex.value];
      isPlaying.value = true;
      loadId.value++;
      ytInitialized.value = true;
    }
  }

  function toggleShuffle() {
    shuffle.value = !shuffle.value;
    store.set("shuffle", shuffle.value);
  }

  function toggleRepeat() {
    repeat.value = repeat.value === 0 ? 1 : repeat.value === 1 ? 2 : 0;
    store.set("repeat", repeat.value);
  }

  function updateProgress(time, dur) {
    currentTime.value = time;
    duration.value = dur;
  }

  function setVolume(vol) {
    volume.value = vol;
    store.set("vol", vol);
  }

  function changeSpeed(newSpeed) {
    speed.value = newSpeed;
    store.set("speed", newSpeed);
  }

  function toggleHQ() {
    hq.value = !hq.value;
    store.set("yt_hq", hq.value);
  }

  function toggleSB() {
    sbEnabled.value = !sbEnabled.value;
    store.set("sb_on", sbEnabled.value);
  }

  function setLyrics(lyricsData) {
    lyrics.value = lyricsData;
  }

  function setQueue(newQueue, index = 0) {
    queue.value = newQueue;
    currentIndex.value = index;
    currentTrack.value = newQueue[index] || null;
  }

  function addToQueue(track, playNext = false) {
    if (!track || !track.videoId) return;
    const ui = useUiStore();
    if (!currentTrackValue.value) {
      playTrack(track);
      return;
    }
    if (!playNext) {
      const alreadyQueued = queue.value.some(
        (q, i) =>
          i > currentIndex.value && q._user && q.videoId === track.videoId,
      );
      if (alreadyQueued) {
        ui.showToast("Already in your queue");
        return;
      }
    }
    if (playNext) {
      queue.value.splice(currentIndex.value + 1, 0, { ...track, _user: true });
      ui.showToast("Playing next");
    } else {
      let i = currentIndex.value + 1;
      while (i < queue.value.length && queue.value[i]._user) i++;
      queue.value.splice(i, 0, { ...track, _user: true });
      ui.showToast("Added to your queue");
    }
  }

  function removeFromQueue(index) {
    if (
      index < 0 ||
      index >= queue.value.length ||
      index === currentIndex.value
    )
      return;
    if (index < currentIndex.value) currentIndex.value--;
    queue.value.splice(index, 1);
    currentTrack.value = queue.value[currentIndex.value] || null;
  }

  function clearUserQueue() {
    queue.value = queue.value.filter(
      (q, i) => i <= currentIndex.value || !q._user,
    );
    const ui = useUiStore();
    ui.showToast("Queue cleared");
  }

  function clearQueue() {
    queue.value = [];
    currentIndex.value = -1;
    currentTrack.value = null;
    isPlaying.value = false;
  }

  function setCued(value) {
    cued.value = value;
  }

  function setPending(track) {
    pending.value = track;
  }

  function setQueueFetching(value) {
    queueFetching.value = value;
  }

  function setRelatedBrowseId(id) {
    relatedBrowseId.value = id;
  }

  function setRelatedLoaded(value) {
    relatedLoaded.value = value;
  }

  function setLyricsBrowseId(id) {
    lyricsBrowseId.value = id;
  }

  function setFloatOn(value) {
    floatOn.value = value;
  }

  // Sleep timer
  function setSleepTimer(seconds) {
    clearSleepTimer();
    if (seconds <= 0) return;
    sleepTimer.value = {
      remaining: seconds,
      timerId: setInterval(() => {
        sleepTimer.value.remaining--;
        if (sleepTimer.value.remaining <= 0) {
          clearSleepTimer();
          // Pause when timer expires
          isPlaying.value = false;
          const ui = useUiStore();
          ui.showToast("Sleep timer ended — paused");
        }
      }, 1000),
    };
  }

  function clearSleepTimer() {
    if (sleepTimer.value?.timerId) {
      clearInterval(sleepTimer.value.timerId);
    }
    sleepTimer.value = null;
  }

  return {
    // State
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    speed,
    lyrics,
    lyricsBrowseId,
    relatedBrowseId,
    relatedLoaded,
    cued,
    pending,
    loadId,
    queueFetching,
    hq,
    quality,
    sbEnabled,
    sbSegments,
    floatOn,
    sleepTimer,
    ytInitialized,

    // Computed
    currentTrackValue,
    canGoPrevious,
    canGoNext,
    playIcon,
    repeatIcon,
    userQueueCount,

    // Actions
    playTrack,
    playQueueIndex,
    togglePlay,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleRepeat,
    updateProgress,
    setVolume,
    changeSpeed,
    toggleHQ,
    toggleSB,
    setLyrics,
    setQueue,
    addToQueue,
    removeFromQueue,
    clearUserQueue,
    clearQueue,
    setCued,
    setPending,
    setQueueFetching,
    setRelatedBrowseId,
    setRelatedLoaded,
    setLyricsBrowseId,
    setFloatOn,
    setSleepTimer,
    clearSleepTimer,
  };
});
