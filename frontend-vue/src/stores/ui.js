import { defineStore } from "pinia";
import { ref } from "vue";
import { store } from "../utils/storage";

export const useUiStore = defineStore("ui", () => {
  // Theme state ('dark' | 'light')
  const theme = ref(store.get("theme", "dark"));

  function applyTheme(newTheme) {
    theme.value = newTheme;
    document.documentElement.setAttribute(
      "data-theme",
      newTheme === "light" ? "light" : "dark"
    );
    store.set("theme", newTheme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", newTheme === "light" ? "#ebebeb" : "#000000");
    }
  }

  function toggleTheme() {
    applyTheme(theme.value === "light" ? "dark" : "light");
  }

  // Toast notification state
  const toastMessage = ref("");
  const toastVisible = ref(false);
  let toastTimer = null;

  function showToast(msg) {
    toastMessage.value = msg;
    toastVisible.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastVisible.value = false;
    }, 2200);
  }

  // Now Playing Overlay State
  const isNowPlayingOpen = ref(true);
  const activeNpTab = ref("player"); // 'player' | 'lyrics' | 'related' | 'queue'

  function openNowPlaying(tab = "player") {
    isNowPlayingOpen.value = true;
    activeNpTab.value = tab;
    document.body.classList.add("np-open");
  }

  function closeNowPlaying() {
    isNowPlayingOpen.value = false;
    document.body.classList.remove("np-open");
  }

  function switchNpTab(tab) {
    activeNpTab.value = tab;
  }

  // Sidebar open/collapse state (default true = closed)
  const sidebarOpen = ref(store.get("sidebar_open", false));

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
    store.set("sidebar_open", sidebarOpen.value);
    showToast(sidebarOpen.value ? "Sidebar Shown" : "Sidebar Hidden");
  }

  // Mini player bar visibility state (default true = visible)
  const miniPlayerVisible = ref(store.get("mini_player_visible", true));

  function toggleMiniPlayer() {
    miniPlayerVisible.value = !miniPlayerVisible.value;
    store.set("mini_player_visible", miniPlayerVisible.value);
    showToast(miniPlayerVisible.value ? "Mini Player Shown" : "Mini Player Hidden");
  }

  // Video vs Audio mode state (default true = video mode)
  const videoMode = ref(store.get("video_mode", false));

  function toggleVideoMode() {
    videoMode.value = !videoMode.value;
    store.set("video_mode", videoMode.value);
    showToast(videoMode.value ? "Video Mode (ON)" : "Audio Mode (ON)");
  }

  // Modals state
  const addToPlaylistModal = ref({ open: false, song: null });
  const createPlaylistModal = ref({ open: false });
  const songMenuModal = ref({ open: false, song: null, meta: {} });

  function openAddToPlaylist(song) {
    addToPlaylistModal.value = { open: true, song };
  }
  function closeAddToPlaylist() {
    addToPlaylistModal.value = { open: false, song: null };
  }

  function openCreatePlaylist() {
    createPlaylistModal.value = { open: true };
  }
  function closeCreatePlaylist() {
    createPlaylistModal.value = { open: false };
  }

  function openSongMenu(song, meta = {}) {
    songMenuModal.value = { open: true, song, meta };
  }
  function closeSongMenu() {
    songMenuModal.value = { open: false, song: null, meta: {} };
  }

  return {
    theme,
    applyTheme,
    toggleTheme,
    toastMessage,
    toastVisible,
    showToast,
    isNowPlayingOpen,
    activeNpTab,
    openNowPlaying,
    closeNowPlaying,
    switchNpTab,
    addToPlaylistModal,
    openAddToPlaylist,
    closeAddToPlaylist,
    createPlaylistModal,
    openCreatePlaylist,
    closeCreatePlaylist,
    songMenuModal,
    openSongMenu,
    closeSongMenu,
    videoMode,
    toggleVideoMode,
    sidebarOpen,
    toggleSidebar,
    miniPlayerVisible,
    toggleMiniPlayer,
  };
});
