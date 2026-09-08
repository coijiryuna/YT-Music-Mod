import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { store } from "../utils/storage";
import { useUiStore } from "./ui";

export const useLibraryStore = defineStore("library", () => {
  const favorites = ref(store.get("fav", []));
  const playlists = ref(store.get("pls", []));
  const saved = ref(store.get("sav", []));
  const history = ref(store.get("hist", []));
  const stats = ref(store.get("stats", {}));

  // Favorites
  function isFav(videoId) {
    return favorites.value.some((s) => s.videoId === videoId);
  }

  function toggleFav(song) {
    const ui = useUiStore();
    if (isFav(song.videoId)) {
      favorites.value = favorites.value.filter((s) => s.videoId !== song.videoId);
      ui.showToast("Removed from favorites");
    } else {
      favorites.value.unshift(song);
      ui.showToast("Added to favorites");
    }
    store.set("fav", favorites.value);
  }

  // Playlists
  function createPlaylist(name) {
    const n = String(name || "").trim();
    if (!n) return null;
    const pl = { id: "local_" + Date.now(), name: n, tracks: [] };
    playlists.value.unshift(pl);
    store.set("pls", playlists.value);
    const ui = useUiStore();
    ui.showToast(`Created playlist "${n}"`);
    return pl;
  }

  function addToPlaylist(pid, song) {
    const pl = playlists.value.find((p) => p.id === pid);
    if (!pl) return;
    if (!pl.tracks.some((t) => t.videoId === song.videoId)) {
      pl.tracks.push(song);
      store.set("pls", playlists.value);
      const ui = useUiStore();
      ui.showToast(`Added to "${pl.name}"`);
    } else {
      const ui = useUiStore();
      ui.showToast(`Already in "${pl.name}"`);
    }
  }

  function removeFromPlaylist(pid, videoId) {
    const pl = playlists.value.find((p) => p.id === pid);
    if (!pl) return;
    pl.tracks = pl.tracks.filter((t) => t.videoId !== videoId);
    store.set("pls", playlists.value);
    const ui = useUiStore();
    ui.showToast("Removed track from playlist");
  }

  function deletePlaylist(pid) {
    playlists.value = playlists.value.filter((p) => p.id !== pid);
    store.set("pls", playlists.value);
    const ui = useUiStore();
    ui.showToast("Deleted playlist");
  }

  function renamePlaylist(pid, name) {
    const n = String(name || "").trim();
    if (!n) return;
    const pl = playlists.value.find((p) => p.id === pid);
    if (!pl) return;
    pl.name = n;
    store.set("pls", playlists.value);
    const ui = useUiStore();
    ui.showToast("Playlist renamed");
  }

  function moveInPlaylist(pid, from, dir) {
    const pl = playlists.value.find((p) => p.id === pid);
    if (!pl) return false;
    const to = from + dir;
    if (to < 0 || to >= pl.tracks.length) return false;
    const [item] = pl.tracks.splice(from, 1);
    pl.tracks.splice(to, 0, item);
    store.set("pls", playlists.value);
    return true;
  }

  // Saved items (Albums, Artists, Playlists)
  function isSaved(browseId) {
    return saved.value.some((s) => s.browseId === browseId);
  }

  function toggleSaved(item) {
    const ui = useUiStore();
    if (isSaved(item.browseId)) {
      saved.value = saved.value.filter((s) => s.browseId !== item.browseId);
      ui.showToast("Removed from library");
    } else {
      saved.value.unshift(item);
      ui.showToast("Saved to library");
    }
    store.set("sav", saved.value);
  }

  // History & Scrobble Stats
  function pushHistory(song) {
    if (!song || !song.videoId) return;
    let h = history.value.filter((s) => s.videoId !== song.videoId);
    h.unshift({ ...song, playedAt: Date.now() });
    history.value = h.slice(0, 100);
    store.set("hist", history.value);

    // Scrobble play count
    const st = { ...stats.value };
    const k = song.videoId;
    if (!st[k]) {
      st[k] = {
        title: song.title,
        artist: song.artist || "",
        thumbnail: song.thumbnail,
        plays: 0,
        secs: 0,
        last: 0,
      };
    }
    st[k].plays++;
    st[k].last = Date.now();
    st[k].title = song.title;
    st[k].thumbnail = song.thumbnail;
    stats.value = st;
    store.set("stats", st);
  }

  function addListenTime(videoId, secs) {
    if (!videoId || !stats.value[videoId]) return;
    const st = { ...stats.value };
    st[videoId].secs = (st[videoId].secs || 0) + secs;
    stats.value = st;
    store.set("stats", st);
  }

  return {
    favorites,
    playlists,
    saved,
    history,
    stats,
    isFav,
    toggleFav,
    createPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    deletePlaylist,
    renamePlaylist,
    moveInPlaylist,
    isSaved,
    toggleSaved,
    pushHistory,
    addListenTime,
  };
});
