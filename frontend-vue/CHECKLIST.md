# 📋 Checklist Perbaikan Frontend Vue — YT-Music-Mod

> Dokumen ini mencatat semua perbaikan yang telah dilakukan pada frontend Vue.js.
> Tanggal: 2026-09-06

---

## 🔴 Masalah Kritis (Sudah Diperbaiki)

- [x] **`App.vue` — Tidak ada `<router-view>`**
  - Views tidak pernah terender karena tidak ada `<router-view>` di template
  - **Solusi:** Tambahkan `<RouterView>` dengan transition di dalam `#view`

- [x] **`App.vue` — Navigasi pakai hash (`#/home`) tapi router pakai `createWebHistory`**
  - `navItems` menggunakan `hash: '#/home'` sedangkan router menggunakan history mode (bukan hash mode)
  - **Solusi:** Ubah `hash` menjadi `to` dengan path langsung (`/`, `/search`, dll)

- [x] **`App.vue` — `goToRoute(hash)` tidak konsisten**
  - Fungsi `goToRoute` menerima hash dengan `#` tapi router.push butuh path tanpa `#`
  - **Solusi:** Ubah `goToRoute` agar menerima path langsung, dengan fallback strip `#`

- [x] **`App.vue` — `handleHashChange` menggunakan `window.location.hash`**
  - Tidak relevan dengan `createWebHistory` (bukan hash mode)
  - **Solusi:** Ganti dengan `router.afterEach()` + `useRoute()` untuk reactive `activeNav`

- [x] **`App.vue` — `IconSprite` tidak dirender**
  - Komponen `IconSprite.vue` tidak di-import/dirender, sehingga semua icon SVG tidak muncul
  - **Solusi:** Import dan render `<IconSprite />` di awal template

---

## 🟡 Masalah API Integration (Sudah Diperbaiki)

- [x] **`HomeView.vue` — Tidak memanggil API**
  - `onMounted` hanya `console.log('HomeView mounted')`
  - **Solusi:** Panggil `api.getHome()`, integrasi `playerStore` untuk play, `usePlayerStore` & `useApi`

- [x] **`HomeView.vue` — `goToRoute` pakai hash (`#/library/favorites`)**
  - **Solusi:** Ubah ke path langsung (`/library/favorites`, `/library`, `/search`, `/charts`)

- [x] **`HomeView.vue` — `playSong` hanya `console.log`**
  - **Solusi:** Panggil `playerStore.playTrack(song)` + `libraryStore.pushHistory(song)`

- [x] **`HomeView.vue` — Greeting statik "Good morning"**
  - **Solusi:** Buat computed `greeting` dinamis berdasarkan jam

- [x] **`SearchView.vue` — Pakai data dummy, bukan API**
  - Hasil search adalah hardcoded test data, bukan dari `api.search()`
  - **Solusi:** Panggil `api.search(q)`, parse dengan `songFromItem`

- [x] **`ChartsView.vue` — Pakai data dummy, bukan API**
  - Charts data adalah hardcoded (Ed Sheeran, The Weeknd, dll)
  - **Solusi:** Panggil `api.getCharts()`, parse dengan `songFromItem`

- [x] **`AlbumView.vue` — Pakai data dummy, bukan API**
  - Album data adalah hardcoded ("Test Album", "Test Artist")
  - **Solusi:** Panggil `api.getAlbum(browseId)`, parse tracks dengan `songFromItem`

- [x] **`ArtistView.vue` — Pakai data dummy, bukan API**
  - Artist data adalah hardcoded ("Test Artist", "1.2M followers")
  - **Solusi:** Panggil `api.getArtist(browseId)`, parse topTracks dengan `songFromItem`

- [x] **`PlaylistView.vue` — Pakai data dummy, bukan API**
  - Playlist data adalah hardcoded ("Test Playlist")
  - **Solusi:** Cek local playlist dulu, jika tidak ada panggil `api.getPlaylist(browseId)`

- [x] **`BrowseView.vue` — Pakai data dummy, bukan API**
  - Browse data adalah hardcoded
  - **Solusi:** Panggil `api.getAlbum(browseId)` sebagai fallback

- [x] **`MoodsView.vue` — Pakai data dummy, bukan API**
  - Moods data adalah hardcoded (Happy, Sad, dll)
  - **Solusi:** Panggil `api.getMoods()`, load songs via `api.getPlaylist(browseId)`

---

## 🟠 Masalah Komponen (Sudah Diperbaiki)

- [x] **`PlayerControls.vue` — `openNowPlaying` hanya `console.log`**
  - Tidak memanggil `uiStore.openNowPlaying()`
  - **Solusi:** Import `useUiStore`, panggil `uiStore.openNowPlaying('queue')`

- [x] **`PlayerControls.vue` — Tidak pakai store computed values**
  - Mendefinisikan ulang `playIcon`, `repeatIcon` dll secara lokal
  - **Solusi:** Gunakan `playerStore.playIcon`, `playerStore.repeatIcon` dari store

---

## 🔵 Masalah Router (Sudah Diperbaiki)

- [x] **Router — Tidak ada route `/home`**
  - NavItems mengarah ke `#/home` tapi tidak ada route `/home`
  - **Solusi:** Tambahkan `{ path: "/home", redirect: "/" }`

- [x] **Router — Tidak ada route untuk local playlist**
  - `goToRoute('/library/playlist/:id')` tidak punya route
  - **Solusi:** Tambahkan `{ path: "/library/playlist/:id", component: PlaylistView }`

- [x] **Router — Tidak ada route `/queue`**
  - Sidebar Queue button mengarah ke route yang tidak ada
  - **Solusi:** Tambahkan `{ path: "/queue", component: LibraryView }`

- [x] **Router — Tidak ada fallback route**
  - URL yang tidak dikenal menyebabkan blank page
  - **Solusi:** Tambahkan `{ path: "/:pathMatch(.*)*", redirect: "/" }`

- [x] **Router — Tidak ada `scrollBehavior`**
  - Pindah route tidak scroll ke atas
  - **Solusi:** Tambahkan `scrollBehavior() { return { top: 0 } }`

- [x] **Router — Tidak ada lazy loading**
  - Semua view di-import secara eager
  - **Solusi:** Gunakan `() => import("../views/X.vue")` untuk code splitting

- [x] **Router — Tidak ada route names**
  - Tidak ada named routes untuk navigasi programatik
  - **Solusi:** Tambahkan `name` untuk setiap route

---

## ✅ Validasi

- [x] **Build berhasil** — `vite build` selesai tanpa error (65 modules, 1.37s)
- [x] **Tidak ada lint errors** di semua file yang diperbaiki
- [x] **Icon Sprite lengkap** — 37 simbol SVG tersedia (i-home, i-search, i-play, dll)
- [x] **Semua views terhubung ke API** melalui `useApi` composable
- [x] **Player store terintegrasi** di semua views yang memutar musik
- [x] **Library store terintegrasi** untuk favorites, playlists, saved, history

---

## 📁 File yang Diperbaiki

| File | Status |
|------|--------|
| `src/App.vue` | ✅ Diperbaiki |
| `src/router/index.js` | ✅ Diperbaiki |
| `src/views/HomeView.vue` | ✅ Diperbaiki |
| `src/views/SearchView.vue` | ✅ Diperbaiki |
| `src/views/ChartsView.vue` | ✅ Diperbaiki |
| `src/views/AlbumView.vue` | ✅ Diperbaiki |
| `src/views/ArtistView.vue` | ✅ Diperbaiki |
| `src/views/PlaylistView.vue` | ✅ Diperbaiki |
| `src/views/BrowseView.vue` | ✅ Diperbaiki |
| `src/views/MoodsView.vue` | ✅ Diperbaiki |
| `src/views/LibraryView.vue` | ✅ Diperbaiki |
| `src/components/player/PlayerControls.vue` | ✅ Diperbaiki |

---

## 🚀 Cara Menjalankan

```bash
cd frontend-vue
npm install   # jika belum
npm run dev   # development server
npm run build # production build
```
