# Frontend Vue — Checklist Perbaikan & Penyelesaian

> **Tanggal:** 06 September 2026  
> **Status:** Selesai  
> **Build:** Sukses (0 error)

---

## Ringkasan Masalah yang Ditemukan

| # | Masalah | Severity | Status |
|---|---------|----------|--------|
| 1 | `<RouterView>` tidak ada di `App.vue` — halaman tidak pernah render | Kritis | ✅ Diperbaiki |
| 2 | `IconSprite` tidak diimpor di `App.vue` — semua ikon SVG tidak tampil | Kritis | ✅ Diperbaiki |
| 3 | Sidebar library list & queue kosong (placeholder tanpa binding data) | Tinggi | ✅ Diperbaiki |
| 4 | Mini player bar tidak ada di `App.vue` | Tinggi | ✅ Diperbaiki |
| 5 | Semua View menggunakan mock data, tidak memanggil `useApi` | Tinggi | ✅ Diperbaiki |
| 6 | `SearchView` bug: `searchResults.length` di-check padahal `searchResults` adalah object | Tinggi | ✅ Diperbaiki |
| 7 | `playerStore` tidak diintegrasikan di View (play, queue, favorite hanya `console.log`) | Tinggi | ✅ Diperbaiki |
| 8 | `isAlbumFavorited`, `isPlaylistSaved`, `isArtistSaved` adalah function, bukan computed | Sedang | ✅ Diperbaiki |
| 9 | `Navbar.vue` & `Sidebar.vue` component tidak digunakan (layout di-hardcode di `App.vue`) | Sedang | ✅ Diselesaikan (layout di-integrate ke App.vue) |
| 10 | Router tidak punya lazy loading, route names, route `/queue`, `/moods`, catch-all 404 | Sedang | ✅ Diperbaiki |
| 11 | `index.html` title masih "frontend-vue", tidak ada `theme-color` meta | Rendah | ✅ Diperbaiki |
| 12 | `LibraryView` (view) tidak menggunakan `uiStore` untuk modal create playlist | Sedang | ✅ Diperbaiki |
| 13 | `PlayerControls.vue` — `openNowPlaying` hanya `console.log` | Rendah | ✅ Diperbaiki |
| 14 | `App.vue` tidak punya toast, modal, now-playing styles | Sedang | ✅ Diperbaiki |
| 15 | Tidak ada responsive mobile styles di `App.vue` | Sedang | ✅ Diperbaiki |

---

## Checklist Perbaikan Detail

### 1. `src/App.vue` — Layout Utama ✅

- [x] Impor & render `<IconSprite />` (SVG sprite untuk semua ikon)
- [x] Tambah `<RouterView>` dengan `<transition>` fade untuk render halaman
- [x] Bind sidebar library list dengan `libraryStore.favorites`, `libraryStore.playlists`, `libraryStore.saved`
- [x] Bind sidebar queue list dengan `playerStore.queue` & `playerStore.currentIndex`
- [x] Tambah **Mini Player Bar** lengkap dengan:
  - Album art, title, artist
  - Tombol play/pause, prev, next, shuffle, repeat
  - Progress bar dengan seek
  - Volume control
- [x] Tambah **Now Playing Overlay** dengan 4 tab (player, lyrics, related, queue)
  - Tab player: album art, track info, controls, seek bar
  - Tab lyrics: list lirik dengan highlight baris aktif
  - Tab related: placeholder
  - Tab queue: list queue dengan highlight track saat ini
- [x] Tambah **Toast notification** dengan animation
- [x] Tambah **modal styles** (add to playlist, create playlist, song menu)
- [x] Tambah **responsive mobile styles** (mobile nav, hide sidebar, compact player)
- [x] `activeNav` diubah menjadi `computed` dari route
- [x] Integrasi `playerStore` untuk play song & push history
- [x] `goToRoute` mendukung format `#/path` dan `/path`

### 2. `src/router/index.js` — Router ✅

- [x] Ubah semua import ke **lazy loading** (`() => import(...)`)
- [x] Tambah **route names** untuk semua route
- [x] Tambah `scrollBehavior` (scroll ke top saat navigasi)
- [x] Tambah route `/moods`
- [x] Tambah route `/library/playlist/:id` (untuk local playlist)
- [x] Tambah route `/queue`
- [x] Tambah catch-all 404 redirect ke `/`

### 3. `src/views/SearchView.vue` — Pencarian ✅

- [x] Ganti mock data dengan `api.search(query)`
- [x] Perbaiki bug `searchResults.length` → gunakan `hasResults` computed
- [x] Pisahkan hasil ke `results.songs`, `results.artists`, `results.albums`
- [x] Gunakan `songFromItem()` untuk normalisasi data song
- [x] Integrasi `playerStore.playTrack()` & `libraryStore.pushHistory()`
- [x] Integrasi `playerStore.addToQueue()`
- [x] `watch` route params untuk auto-search saat URL berubah
- [x] Loading & empty states

### 4. `src/views/ChartsView.vue` — Charts ✅

- [x] Ganti mock data dengan `api.getCharts()`
- [x] Gunakan `songFromItem()` untuk normalisasi
- [x] Integrasi `playerStore.playTrack()` & `libraryStore.pushHistory()`
- [x] Loading & empty states
- [x] Support `browseId` dan `id` untuk artist navigation

### 5. `src/views/AlbumView.vue` — Detail Album ✅

- [x] Ganti mock data dengan `api.getAlbum(browseId)`
- [x] Gunakan `songFromItem()` untuk normalisasi track
- [x] Integrasi `playerStore.playTrack()`, `setQueue()`, `addToQueue()`
- [x] `isAlbumSaved` diubah menjadi `computed` (bukan function)
- [x] `toggleSaveAlbum` menggunakan `libraryStore.toggleSaved()`
- [x] Highlight track yang sedang playing (`playerStore.currentTrack?.videoId`)
- [x] Loading & not-found states

### 6. `src/views/PlaylistView.vue` — Detail Playlist ✅

- [x] Cek local playlist dulu (`libraryStore.playlists`) sebelum fetch API
- [x] Ganti mock data dengan `api.getPlaylist(browseId)` untuk YT playlist
- [x] Gunakan `songFromItem()` untuk normalisasi track
- [x] Integrasi `playerStore.playTrack()`, `setQueue()`, `addToQueue()`
- [x] `isPlaylistSaved` diubah menjadi `computed`
- [x] `toggleSavePlaylist` menggunakan `libraryStore.toggleSaved()`
- [x] Hide tombol save untuk local playlist (`isLocal`)
- [x] Loading & not-found states

### 7. `src/views/ArtistView.vue` — Detail Artist ✅

- [x] Ganti mock data dengan `api.getArtist(browseId)`
- [x] Gunakan `songFromItem()` untuk normalisasi top tracks
- [x] Integrasi `playerStore.playTrack()`, `setQueue()`, `addToQueue()`
- [x] `isArtistSaved` diubah menjadi `computed`
- [x] `toggleSaveArtist` menggunakan `libraryStore.toggleSaved()`
- [x] Highlight track yang sedang playing
- [x] Loading & not-found states

### 8. `src/views/BrowseView.vue` — Browse ✅

- [x] Ganti mock data dengan `api.getAlbum(browseId)`
- [x] Integrasi `playerStore` untuk play content
- [x] Support navigasi artist/album/playlist/browse
- [x] Loading & not-found states

### 9. `src/views/MoodsView.vue` — Moods ✅

- [x] Ganti mock data dengan `api.getMoods()`
- [x] `selectMood` memanggil `api.getPlaylist()` jika mood punya `browseId`
- [x] Integrasi `playerStore.playTrack()` & `libraryStore.pushHistory()`
- [x] Loading & empty states

### 10. `src/views/HomeView.vue` — Beranda ✅

- [x] Ganti mock data dengan `api.getHome()`
- [x] **Render `sections` dinamis dari API** (bukan hard-coded "Quick Picks")
- [x] **Klasifikasi otomatis section type**: `songs`, `playlists`, `mixed`
- [x] **Handle `type: "playlist"` items** → navigasi ke `/playlist/:id`
- [x] **Handle `type: "song"` items** → play via `playerStore.playTrack()`
- [x] **Handle `type: "artist"` / `type: "album"` items** → navigasi ke detail page
- [x] **Strip "VL" prefix** dari playlist browseId (format YouTube: `VLPLxxx`)
- [x] **`subtitleWithoutPlays()`** — filter "x pemutaran/x ditonton" dari subtitle, tampilkan hanya "Artist • Album"
- [x] **`scrollCarousel(event, direction)`** — cari carousel dalam shelf yang sama (bukan global `querySelector`)
- [x] Tampilkan "Recently Played" dari `libraryStore.history`
- [x] Tampilkan "Your Favorites" dari `libraryStore.favorites`
- [x] Greeting dinamis (morning/afternoon/evening)
- [x] Integrasi `playerStore.playTrack()` & `libraryStore.pushHistory()`
- [x] Tombol "New Playlist" membuka modal via `uiStore.openCreatePlaylist()`
- [x] Tombol shuffle terhubung ke `playerStore.shuffle`
- [x] Loading state & empty state

### 11. `src/views/LibraryView.vue` — Library ✅

- [x] Tab count menjadi reactive (computed, bukan di-set di `onMounted`)
- [x] Tombol "New Playlist" menggunakan `uiStore.openCreatePlaylist()`
- [x] Integrasi `playerStore.playTrack()` & `libraryStore.pushHistory()`
- [x] Active tab di-set dari route path (`/library/favorites`, dll)
- [x] `watch` route path untuk update active tab saat navigasi
- [x] Stats menampilkan data dari `libraryStore.stats`

### 12. `src/components/player/PlayerControls.vue` — Player Controls ✅

- [x] `openNowPlaying()` memanggil `uiStore.openNowPlaying('queue')`

### 13. `index.html` ✅

- [x] Title diubah dari "frontend-vue" ke "Rifa Music"
- [x] Tambah `<meta name="theme-color" content="#000000" />`
- [x] Tambah `<meta name="description" ...>`

---

## Struktur File

```
frontend-vue/
├── index.html                          ✅ Diperbaiki
├── package.json
├── vite.config.js
├── public/
│   ├── favicon.svg
│   ├── logo.png
│   ├── logo-64.png
│   └── ... (ikon & logo)
└── src/
    ├── App.vue                         ✅ Diperbaiki besar-besaran
    ├── main.js
    ├── assets/
    │   └── styles.css                  ✅ (tidak diubah, sudah lengkap)
    ├── components/
    │   ├── common/
    │   │   └── LoadingSpinner.vue      ✅ (sudah OK)
    │   ├── icons/
    │   │   └── IconSprite.vue          ✅ (sudah OK, sekarang diimpor di App.vue)
    │   ├── layout/
    │   │   ├── Navbar.vue              (tidak digunakan — layout ada di App.vue)
    │   │   └── Sidebar.vue             (tidak digunakan — layout ada di App.vue)
    │   ├── library/
    │   │   └── LibraryView.vue         (tidak digunakan — view di views/)
    │   └── player/
    │       └── PlayerControls.vue      ✅ Diperbaiki
    ├── composables/
    │   └── useApi.js                   ✅ (sudah OK)
    ├── router/
    │   └── index.js                    ✅ Diperbaiki
    ├── stores/
    │   ├── ui.js                       ✅ (sudah OK)
    │   ├── player.js                   ✅ (sudah OK)
    │   └── library.js                 ✅ (sudah OK)
    ├── utils/
    │   ├── helpers.js                  ✅ (sudah OK)
    │   └── storage.js                 ✅ (sudah OK)
    └── views/
        ├── HomeView.vue                ✅ Diperbaiki
        ├── SearchView.vue              ✅ Diperbaiki
        ├── ChartsView.vue              ✅ Diperbaiki
        ├── LibraryView.vue             ✅ Diperbaiki
        ├── AlbumView.vue               ✅ Diperbaiki
        ├── PlaylistView.vue            ✅ Diperbaiki
        ├── ArtistView.vue              ✅ Diperbaiki
        ├── BrowseView.vue              ✅ Diperbaiki
        └── MoodsView.vue               ✅ Diperbaiki
```

---

## Hasil Build

```
vite v8.2.2 building client environment for production...
✓ 65 modules transformed.
✓ built in 1.45s

dist/index.html                          0.60 kB
dist/assets/index-BfbF8e6h.css          55.11 kB
dist/assets/index-6QZNwpWj.js          144.26 kB
+ 9 lazy-loaded view chunks
```

- **0 error**, **0 warning**
- Semua view di-code-split dengan lazy loading
- Total gzip: ~80 kB (CSS + JS)

---

## Catatan Tambahan

1. **Komponen yang tidak digunakan** (`Navbar.vue`, `Sidebar.vue`, `components/library/LibraryView.vue`): Layout sudah diintegrasikan langsung di `App.vue` untuk konsistensi dengan CSS global (`styles.css`). File-file ini bisa dihapus di masa depan jika tidak diperlukan.

2. **Player integration**: `playerStore` saat ini hanya mensimulasikan play/pause/seek dengan `console.log`. Integrasi sebenarnya dengan YouTube IFrame Player API perlu ditambahkan terpisah.

3. **API proxy**: `vite.config.js` sudah mengkonfigurasi proxy `/api` → `http://localhost:3100`. Pastikan server backend berjalan di port 3100.

4. **Komponen `App.vue` sekarang mengelola**: sidebar (library list + queue), mini player bar, now playing overlay, toast, dan semua modal — semuanya ter-bind ke store yang benar.
