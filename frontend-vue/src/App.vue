<template>
  <div>
    <!-- Icon Sprite (hidden SVG symbols) -->
    <IconSprite />

    <!-- Splash Screen -->
    <div id="splash" :class="{ gone: splashGone }" aria-hidden="true">
      <div class="splash-inner">
        <img class="splash-logo" src="/logo.png" width="128" height="128" alt="" />
        <div class="splash-name">Rifa Music</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-show="isLoading" class="loading-screen">
      <div class="loading-spinner"></div>
      <p>Loading Rifa Music...</p>
    </div>

    <!-- Main Layout (no wrapper — #app is the flex container per global CSS) -->
    <div class="container" v-show="!isLoading">
      <!-- Desktop Sidebar -->
      <aside id="sidebar">
        <div class="side-box">
          <div class="logo">
            <img src="/logo.png" alt="Rifa Music" class="logo-img"
              srcset="/logo-64.png 64w, /logo-192.png 192w, /logo.png 512w" sizes="34px" width="34" height="34" />
            <span>Rifa Music</span>
          </div>
          <nav id="nav-desktop" class="nav-desktop">
            <button v-for="nav in desktopNavItems" :key="nav.id" :class="['nav-item', { active: activeNav === nav.id }]"
              @click="goToRoute(nav.to)">
              <svg class="ic">
                <use :href="`#${nav.icon}`" />
              </svg>
              <span>{{ nav.label }}</span>
            </button>
          </nav>
        </div>

        <div class="side-box q-box">
          <div class="lib-head">
            <button class="lib-title" @click="uiStore.openNowPlaying('queue')">
              <svg class="ic">
                <use href="#i-queue" />
              </svg>
              <span>Queue<span v-if="playerStore.userQueueCount"> · {{ playerStore.userQueueCount }}</span></span>
            </button>
          </div>
          <div id="side-queue" class="side-queue">
            <div v-if="!playerStore.queue.length" class="sq-empty">
              Play a song, then tap the queue icon to add tracks here.
            </div>
            <template v-else>
              <!-- Now playing section -->
              <div v-if="playerStore.currentTrackValue" class="sq-sec">Now playing</div>
              <button v-if="playerStore.currentTrackValue" class="sq-row now" @click="uiStore.openNowPlaying()">
                <img :src="playerStore.currentTrackValue.thumbnail" :alt="playerStore.currentTrackValue.title" />
                <div class="sq-meta">
                  <div class="sq-t">{{ displayTitle(playerStore.currentTrackValue.title) }}</div>
                  <div class="sq-s">{{ playerStore.currentTrackValue.artist || '' }}</div>
                </div>
              </button>
              <!-- User queue -->
              <template v-for="(song, index) in userQueueItems" :key="'uq-' + song.videoId + '-' + index">
                <div v-if="index === 0" class="sq-sec">Your queue · {{ userQueueItems.length }}</div>
                <button class="sq-row" @click="playerStore.playQueueIndex(song._origIndex)">
                  <span class="sq-n">{{ index + 1 }}</span>
                  <img :src="song.thumbnail" :alt="song.title" />
                  <div class="sq-meta">
                    <div class="sq-t">{{ displayTitle(song.title) }}</div>
                    <div class="sq-s">{{ song.artist || song.subtitle }}</div>
                  </div>
                </button>
              </template>
              <div v-if="!userQueueItems.length" class="sq-empty">
                Your queue is empty. Tap <svg class="ic" style="display:inline;width:14px;height:14px">
                  <use href="#i-queue" />
                </svg> on a song.
              </div>
            </template>
          </div>
        </div>

        <div class="side-box lib-box">
          <div class="lib-head">
            <button class="lib-title" @click="goToRoute('/library')">
              <svg class="ic">
                <use href="#i-library" />
              </svg>
              <span>Your Library</span>
            </button>
            <button id="lib-new" class="icon-btn" @click="openCreatePlaylistModal" title="New playlist">
              <svg class="ic">
                <use href="#i-plus" />
              </svg>
            </button>
          </div>
          <div id="lib-list" class="lib-list">
            <!-- Empty State -->
            <div v-if="!libraryStore.favorites.length && !libraryStore.playlists.length && !libraryStore.saved.length"
              class="lib-empty">
              <b>Your library is empty</b><br />Like songs, save albums &amp; artists, or open Library to create a
              playlist
            </div>

            <!-- Liked Songs row -->
            <button v-if="libraryStore.favorites.length" class="lib-row" @click="goToRoute('/library/favorites')">
              <span class="lib-ph liked-ph"><svg class="ic">
                  <use href="#i-heart-f" />
                </svg></span>
              <span class="lr-meta"><span class="lr-t">Liked Songs</span><br><span class="lr-s">Playlist · {{
                libraryStore.favorites.length }} songs</span></span>
            </button>

            <!-- Playlists -->
            <button v-for="pl in libraryStore.playlists" :key="'pl-' + pl.id" class="lib-row"
              @click="goToRoute(`/library/playlist/${pl.id}`)">
              <img v-if="pl.tracks[0]" :src="pl.tracks[0].thumbnail" :alt="pl.name" />
              <span v-else class="lib-ph"><svg class="ic">
                  <use href="#i-note" />
                </svg></span>
              <span class="lr-meta"><span class="lr-t">{{ pl.name }}</span><br><span class="lr-s">Playlist · {{
                pl.tracks.length
                  }} songs</span></span>
            </button>

            <!-- Saved -->
            <button v-for="item in libraryStore.saved" :key="'sav-' + item.browseId" class="lib-row"
              :class="{ round: item.type === 'artist' }" @click="goToSavedItem(item)">
              <img :src="item.thumbnail" :alt="item.title" />
              <span class="lr-meta"><span class="lr-t">{{ item.title }}</span><br><span class="lr-s">{{ item.type ===
                'artist' ?
                'Artist' : item.type === 'album' ? 'Album' : 'Playlist' }}</span></span>
            </button>
          </div>
          <div class="sidebar-footer">
            <span>Rifa Music · free web music player</span>
            <a href="/download-apk" download="RifaMusic.apk" class="apk-link"
              title="Download Rifa Music Android App (APK)">
              <svg class="ic">
                <use href="#i-android" />
              </svg>
              <span>Download App (APK)</span>
            </a>
          </div>
        </div>
      </aside>

      <!-- Mobile Navigation -->
      <nav id="nav-mobile">
        <button v-for="nav in navItems" :key="nav.id" :class="['nav-item', { active: activeNav === nav.id }]"
          @click="goToRoute(nav.to)">
          <svg class="ic">
            <use :href="`#${activeNav === nav.id ? nav.iconActive || nav.icon : nav.icon}`" />
          </svg>
          <span>{{ nav.label }}</span>
        </button>
      </nav>

      <!-- Main Content -->
      <main id="main">
        <div class="main-body">
          <div class="main-content-area">
            <div id="topbar" class="topbar">
              <div class="tb-nav">
                <button class="tb-btn btn-sidebar" :class="{ active: !uiStore.sidebarOpen }"
                  @click="uiStore.toggleSidebar" :title="uiStore.sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'">
                  <svg class="ic">
                    <use href="#i-menu" />
                  </svg>
                </button>
                <button class="tb-btn" @click="goBack" :disabled="!canGoBack">
                  <svg class="ic">
                    <use href="#i-back" />
                  </svg>
                </button>
                <button class="tb-btn" @click="goForward" :disabled="!canGoForward">
                  <svg class="ic">
                    <use href="#i-fwd" />
                  </svg>
                </button>

                <div class="logo">
                  <img src="/logo.png" alt="Rifa Music" class="logo-img"
                    srcset="/logo-64.png 64w, /logo-192.png 192w, /logo.png 512w" sizes="34px" width="34" height="34" />
                  <span>Rifa Music</span>
                </div>
              </div>

              <div class="tb-actions">
                <a href="/download-apk" download="RifaMusic.apk" class="pill-btn primary"
                  title="Download Android App (APK)"
                  style="font-size:12px;padding:6px 14px;gap:6px;text-decoration:none;">
                  <svg class="ic" style="width:14px;height:14px;">
                    <use href="#i-android" />
                  </svg>
                  <span>Download Rifa Music Apk</span>
                </a>
                <button v-if="playerStore.currentTrackValue" class="icon-btn video-toggle"
                  :class="{ on: uiStore.videoMode }" @click="toggleVideo"
                  :title="uiStore.videoMode ? 'Video Mode (Click for Audio)' : 'Audio Mode (Click for Video)'">
                  <svg class="ic">
                    <use :href="uiStore.videoMode ? '#i-tv' : '#i-note'" />
                  </svg>
                </button>
                <button v-if="playerStore.currentTrackValue" class="icon-btn" :class="{ on: uiStore.miniPlayerVisible }"
                  @click="uiStore.toggleMiniPlayer"
                  :title="uiStore.miniPlayerVisible ? 'Hide Mini Player' : 'Show Mini Player'">
                  <svg class="ic">
                    <use href="#i-expand" />
                  </svg>
                </button>
                <button class="icon-btn" @click="uiStore.toggleTheme">
                  <svg class="ic">
                    <use :href="themeIcon" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- YouTube Video Player — always in DOM, inside #main -->
            <div id="np-video-container" :class="{ hidden: !uiStore.videoMode || !playerStore.currentTrackValue }">
              <div id="yt-player"></div>
            </div>

            <div id="view" class="view-container" ref="mainAreaRef">
              <RouterView v-slot="{ Component }">
                <transition name="fade" mode="out-in">
                  <component :is="Component" />
                </transition>
              </RouterView>
            </div>
          </div><!-- /.main-content-area -->

          <!-- Now Playing Overlay (inside main body) -->
          <div id="nowplaying" :class="['now-playing-overlay', { hidden: !uiStore.isNowPlayingOpen }]">
            <!-- Blurred background from album art -->
            <div id="np-bg"
              :style="{ backgroundImage: playerStore.currentTrackValue?.thumbnail ? `url('${playerStore.currentTrackValue.thumbnail}')` : 'none' }">
            </div>
            <div class="np-handle" aria-hidden="true" @click.stop="uiStore.closeNowPlaying"></div>
            <div class="np-inner">
              <div class="np-topbar">
                <button id="np-close" class="icon-btn" title="Minimize" @click="uiStore.closeNowPlaying">
                  <svg class="ic">
                    <use href="#i-chev-down" />
                  </svg>
                </button>
                <span class="np-caption">Now Playing</span>

                <button id="np-sleep" @click="toggleSleepTimer" class="icon-btn" title="Sleep timer">
                  <svg class="ic">
                    <use href="#i-clock" />
                  </svg>
                </button>
              </div>
              <div class="np-tabs">
                <button v-for="tab in npTabs" :key="tab.id"
                  :class="['np-tab', { active: uiStore.activeNpTab === tab.id }]" @click="uiStore.switchNpTab(tab.id)">
                  <svg class="ic">
                    <use :href="`#${tab.icon}`" />
                  </svg>
                  <span>{{ tab.label }}</span>
                </button>
              </div>

              <div class="np-body">
                <!-- Player Tab -->
                <div id="np-player" class="np-pane" :class="{ active: uiStore.activeNpTab === 'player' }">
                  <div v-if="playerStore.currentTrackValue">
                    <div class="np-art-wrap">
                      <img id="np-art" :src="playerStore.currentTrackValue.thumbnail"
                        :alt="playerStore.currentTrackValue.title" />
                    </div>
                    <div class="np-meta">
                      <div id="np-title">{{ displayTitle(playerStore.currentTrackValue.title) }}</div>
                      <div id="np-artist">{{ playerStore.currentTrackValue.artist }}</div>
                    </div>
                    <div class="np-controls">
                      <button class="icon-btn" :class="{ on: playerStore.shuffle }" @click="playerStore.toggleShuffle"
                        title="Shuffle">
                        <svg class="ic">
                          <use href="#i-shuffle" />
                        </svg>
                      </button>
                      <button class="icon-btn" @click="yt.prevTrack" :disabled="!playerStore.canGoPrevious"
                        title="Previous">
                        <svg class="ic">
                          <use href="#i-prev" />
                        </svg>
                      </button>
                      <button class="play-big" @click="yt.togglePlay" title="Play/Pause">
                        <svg class="ic">
                          <use :href="playerStore.playIcon" />
                        </svg>
                      </button>
                      <button class="icon-btn" @click="yt.nextTrack(false)" :disabled="!playerStore.canGoNext"
                        title="Next">
                        <svg class="ic">
                          <use href="#i-next" />
                        </svg>
                      </button>
                      <button class="icon-btn" :class="{ on: playerStore.repeat !== 0 }"
                        @click="playerStore.toggleRepeat" title="Repeat">
                        <svg class="ic">
                          <use :href="playerStore.repeatIcon" />
                        </svg>
                      </button>
                    </div>
                    <div class="np-seek">
                      <span class="pb-time">{{ fmtTime(playerStore.currentTime) }}</span>
                      <input type="range" id="np-range" min="0" max="1000" :value="npRangeValue"
                        @input="seekToRange(Number($event.target.value))" />
                      <span class="pb-time">{{ fmtTime(playerStore.duration) }}</span>
                    </div>

                    <!-- Extra Actions -->
                    <div class="np-actions">
                      <button class="pill-btn" @click="toggleFavoriteCurrent" id="np-fav">
                        <svg class="ic">
                          <use :href="isCurrentFav ? '#i-heart-f' : '#i-heart-o'" />
                        </svg>
                        <span>{{ isCurrentFav ? 'Favorited' : 'Favorite' }}</span>
                      </button>
                      <button class="pill-btn" @click="uiStore.openAddToPlaylist(playerStore.currentTrackValue)"
                        id="np-addpl">
                        <svg class="ic">
                          <use href="#i-plus" />
                        </svg>
                        <span>Playlist</span>
                      </button>
                      <button class="pill-btn" @click="downloadCurrent" id="np-download">
                        <svg class="ic">
                          <use href="#i-download" />
                        </svg>
                        <span>Download</span>
                      </button>
                      <button class="pill-btn" @click="toggleQuality" id="np-quality"
                        :title="playerStore.hq ? 'YouTube max quality' : 'YouTube Music audio'">
                        <span>{{ playerStore.hq ? 'Max' : 'Quality' }}</span>
                      </button>
                      <button class="pill-btn" @click="cycleSpeed" id="np-speed" title="Playback speed">
                        <svg class="ic">
                          <use href="#i-clock" />
                        </svg>
                        <span>{{ playerStore.speed }}x</span>
                      </button>
                      <button class="pill-btn" @click="toggleSB" id="np-more"
                        :class="{ 'has-on': playerStore.sbEnabled }" title="SponsorBlock auto-skip">
                        <svg class="ic">
                          <use href="#i-next" />
                        </svg><span>SB</span>
                      </button>

                    </div>
                    <!-- Lyric Preview (below seek bar) -->
                    <div id="np-lyric-preview" @click="uiStore.switchNpTab('lyrics')"
                      :title="lyricPreview ? 'Open lyrics' : ''">
                      {{ lyricPreview }}
                    </div>
                  </div>
                  <div v-else class="np-empty">
                    <p>No track playing</p>
                  </div>
                </div>
                <!-- Queue Tab -->
                <div id="np-queue" class="np-pane" :class="{ active: uiStore.activeNpTab === 'queue' }">
                  <div v-if="playerStore.queue.length" class="np-queue-list">
                    <button v-for="(song, index) in playerStore.queue" :key="'npq-' + song.videoId + '-' + index"
                      class="sq-row" :class="{ now: index === playerStore.currentIndex }"
                      @click="playerStore.playQueueIndex(index)">
                      <span v-if="index === playerStore.currentIndex" class="sq-n"><span
                          class="eq"><i></i><i></i><i></i></span></span>
                      <span v-else class="sq-n">{{ index + 1 }}</span>
                      <img :src="song.thumbnail" :alt="song.title" />
                      <div class="sq-meta">
                        <div class="sq-t">{{ displayTitle(song.title) }}</div>
                        <div class="sq-s">{{ song.artist || song.subtitle }}</div>
                      </div>
                    </button>
                  </div>
                  <div v-else class="np-empty">
                    <p>Queue is empty</p>
                  </div>
                </div>

                <!-- Lyrics Tab -->
                <div id="np-lyrics" class="np-pane" :class="{ active: uiStore.activeNpTab === 'lyrics' }">
                  <div v-if="playerStore.lyrics.lines.length" class="np-lyrics-list">
                    <p v-for="(line, i) in playerStore.lyrics.lines" :key="i"
                      :class="['lyric-line', { active: i === activeLyricIdx, past: i < activeLyricIdx }]"
                      @click="seekToLyric(line.t)">{{ line.text || '♪' }}</p>
                  </div>
                  <div v-else-if="playerStore.lyrics.plain" class="np-lyrics-list">
                    <p class="lyric-plain" v-for="(line, i) in playerStore.lyrics.plain.split('\n')" :key="i">{{ line }}
                    </p>
                  </div>
                  <div v-else class="np-empty">
                    <p v-if="lyricsLoading">Looking for lyrics…</p>
                    <p v-else>No lyrics available</p>
                    <button v-if="!lyricsLoading" class="pill-btn" @click="retryLyrics">
                      <svg class="ic">
                        <use href="#i-repeat" />
                      </svg>
                      <span>Try again</span>
                    </button>
                  </div>
                </div>

                <!-- Related Tab -->
                <div id="np-related" class="np-pane" :class="{ active: uiStore.activeNpTab === 'related' }">
                  <div v-if="relatedContent?.sections?.length" class="np-related-list">
                    <div v-for="(section, si) in relatedContent.sections" :key="'rs-' + si" class="shelf">
                      <div class="shelf-title">{{ section.title }}</div>
                      <div class="related-items">
                        <button v-for="item in section.items" :key="'ri-' + si + '-' + (item.videoId || item.browseId)"
                          class="card" :class="{ artist: item.type === 'artist' }" @click="handleRelatedClick(item)">
                          <div class="art">
                            <img :src="item.thumbnail" :alt="item.title" />
                          </div>
                          <div class="t">{{ displayTitle(item.title) }}</div>
                          <div class="s">{{ item.subtitle || item.artist }}</div>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div v-else class="np-empty">
                    <p v-if="relatedLoading">Loading related content…</p>
                    <p v-else>Related content will appear here</p>
                  </div>
                </div>

              </div>
            </div>
          </div><!-- /.main-body -->
        </div><!-- /.main-body -->

        <!-- Mini Player Bar (inside main) -->
        <div id="miniplayer" :class="{ hidden: !playerStore.currentTrackValue || !uiStore.miniPlayerVisible }">
          <div class="pb-left">
            <img id="mini-art" :src="playerStore.currentTrackValue?.thumbnail || ''"
              :alt="playerStore.currentTrackValue?.title || ''" @click="uiStore.openNowPlaying()" />
            <div class="mini-meta" @click="uiStore.openNowPlaying()">
              <div id="mini-title">{{ displayTitle(playerStore.currentTrackValue?.title) }}</div>
              <div id="mini-artist">{{ playerStore.currentTrackValue?.artist || '' }}</div>
            </div>
            <button class="icon-btn" @click="toggleFavoriteCurrent">
              <svg class="ic">
                <use :href="isCurrentFav ? '#i-heart-f' : '#i-heart-o'" />
              </svg>
            </button>
          </div>

          <div class="pb-center">
            <div class="pb-buttons">
              <button class="icon-btn" :class="{ on: playerStore.shuffle }" @click="playerStore.toggleShuffle">
                <svg class="ic">
                  <use href="#i-shuffle" />
                </svg>
              </button>
              <button class="icon-btn" @click="yt.prevTrack" :disabled="!playerStore.canGoPrevious">
                <svg class="ic">
                  <use href="#i-prev" />
                </svg>
              </button>
              <button class="play-circle" @click="yt.togglePlay">
                <svg class="ic">
                  <use :href="playerStore.playIcon" />
                </svg>
              </button>
              <button class="icon-btn" @click="yt.nextTrack(false)" :disabled="!playerStore.canGoNext">
                <svg class="ic">
                  <use href="#i-next" />
                </svg>
              </button>
              <button class="icon-btn" :class="{ on: playerStore.repeat !== 0 }" @click="playerStore.toggleRepeat">
                <svg class="ic">
                  <use :href="playerStore.repeatIcon" />
                </svg>
              </button>
            </div>
            <div class="pb-seek">
              <span class="pb-time">{{ fmtTime(playerStore.currentTime) }}</span>
              <div class="pb-bar" @click="seekTo">
                <div id="mini-progress-fill" :style="{ width: progressPercent + '%' }"></div>
                <div class="pb-knob" :style="{ left: progressPercent + '%' }"></div>
              </div>
              <span class="pb-time">{{ fmtTime(playerStore.duration) }}</span>
            </div>
          </div>

          <div class="pb-right">
            <button v-if="playerStore.currentTrackValue" class="icon-btn video-toggle"
              :class="{ on: uiStore.videoMode }" @click="toggleVideo"
              :title="uiStore.videoMode ? 'Video Mode (Click for Audio)' : 'Audio Mode (Click for Video)'">
              <svg class="ic">
                <use :href="uiStore.videoMode ? '#i-tv' : '#i-note'" />
              </svg>
            </button>
            <button class="icon-btn pb-vol-ic" @click="toggleMute" :title="isMuted ? 'Unmute' : 'Mute'">
              <svg class="ic">
                <!-- Mengganti ikon secara dinamis jika di-mute -->
                <use :href="isMuted || playerStore.volume === 0 ? '#i-volume-off' : '#i-volume'" />
              </svg>
            </button>

            <input id="mini-volume" type="range" min="0" max="100" :value="isMuted ? 0 : playerStore.volume"
              @input="setVolume(Number($event.target.value))" />
            <button class="icon-btn" @click="uiStore.toggleMiniPlayer" title="Hide Player Bar"
              style="margin-left: 4px;">
              <svg class="ic">
                <use href="#i-x" />
              </svg>
            </button>
          </div>
        </div>
      </main>
      <!-- Toast Notification -->
      <div v-if="uiStore.toastVisible" id="toast" :class="{ show: uiStore.toastVisible }">
        {{ uiStore.toastMessage }}
      </div>

      <!-- Modals (inside #app, not teleported) -->
      <Teleport to="body">
        <!-- Add to Playlist Modal -->
        <div v-if="uiStore.addToPlaylistModal.open" class="modal-overlay" @click="uiStore.closeAddToPlaylist">
          <div class="modal-content" @click.stop>
            <h2>Add to Playlist</h2>
            <div class="playlist-list">
              <button v-for="playlist in libraryStore.playlists" :key="playlist.id" class="playlist-item"
                @click="addToPlaylist(uiStore.addToPlaylistModal.song, playlist.id)">
                <div class="playlist-cover">
                  <img v-if="playlist.tracks[0]" :src="playlist.tracks[0].thumbnail" alt="" />
                  <div v-else class="art-ph"><svg class="ic">
                      <use href="#i-note" />
                    </svg></div>
                </div>
                <div class="playlist-info">
                  <div class="playlist-name">{{ playlist.name }}</div>
                  <div class="playlist-count">{{ playlist.tracks.length }} songs</div>
                </div>
              </button>
            </div>
            <button class="modal-close" @click="uiStore.closeAddToPlaylist">Cancel</button>
          </div>
        </div>

        <!-- Create Playlist Modal -->
        <div v-if="uiStore.createPlaylistModal.open" class="modal-overlay" @click="uiStore.closeCreatePlaylist">
          <div class="modal-content" @click.stop>
            <h2>Create New Playlist</h2>
            <input type="text" v-model="newPlaylistName" placeholder="Playlist name" @keyup.enter="createPlaylist" />
            <div class="modal-actions">
              <button class="btn-primary" @click="createPlaylist">Create</button>
              <button class="btn-secondary" @click="uiStore.closeCreatePlaylist">Cancel</button>
            </div>
          </div>
        </div>

        <!-- Song Menu Modal -->
        <div v-if="uiStore.songMenuModal.open" class="modal-overlay" @click="uiStore.closeSongMenu">
          <div class="modal-content" @click.stop>
            <div class="song-menu-header">
              <div class="song-cover">
                <img v-if="uiStore.songMenuModal.song" :src="uiStore.songMenuModal.song.thumbnail" alt="" />
                <div v-else class="art-ph"><svg class="ic">
                    <use href="#i-note" />
                  </svg></div>
              </div>
              <div class="song-info">
                <div class="song-title">{{ uiStore.songMenuModal.song?.title }}</div>
                <div class="song-artist">{{ uiStore.songMenuModal.song?.artist }}</div>
              </div>
            </div>
            <div class="song-menu-items">
              <button class="menu-item" @click="toggleFavorite(uiStore.songMenuModal.song)">
                <svg class="ic">
                  <use
                    :href="uiStore.songMenuModal.song && libraryStore.isFav(uiStore.songMenuModal.song.videoId) ? '#i-heart-f' : '#i-heart-o'" />
                </svg>
                <span>
                  {{ libraryStore.isFav(uiStore.songMenuModal.song?.videoId) ? 'Remove' : 'Add Favorites' }}
                </span>
              </button>
              <button class="menu-item" @click="uiStore.openAddToPlaylist(uiStore.songMenuModal.song)">
                <svg class="ic">
                  <use href="#i-plus" />
                </svg>
                <span>Add to Playlist</span>
              </button>
              <button class="menu-item" @click="queueSong(uiStore.songMenuModal.song)">
                <svg class="ic">
                  <use href="#i-queue" />
                </svg>
                <span>Add to Queue</span>
              </button>
              <button class="menu-item" @click="downloadSong(uiStore.songMenuModal.song)">
                <svg class="ic">
                  <use href="#i-download" />
                </svg>
                <span>Download</span>
              </button>
            </div>
            <button class="modal-close" @click="uiStore.closeSongMenu">Close</button>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUiStore } from './stores/ui';
import { useLibraryStore } from './stores/library';
import { usePlayerStore } from './stores/player';
import { useApi } from './composables/useApi';
import { useYouTube } from './composables/useYouTube';
import { useLyrics } from './composables/useLyrics';
import { useRelated } from './composables/useRelated';
import { useSponsorBlock } from './composables/useSponsorBlock';
import { useDownload } from './composables/useDownload';
import { fmtTime, displayTitle, normalizeSong, applyTint, hueFrom } from './utils/helpers';
import IconSprite from './components/icons/IconSprite.vue';

const router = useRouter();
const route = useRoute();
const uiStore = useUiStore();
const libraryStore = useLibraryStore();
const playerStore = usePlayerStore();
const api = useApi();

// Composables
const yt = useYouTube();
const lyricsApi = useLyrics();
const relatedApi = useRelated();
const sbApi = useSponsorBlock();
const downloadApi = useDownload();

// State
const searchQuery = ref('');
const isLoading = ref(false);
const newPlaylistName = ref('');
const splashGone = ref(false);
const videoVisible = computed(() => uiStore.videoMode);
const relatedContent = ref(null);
const relatedLoading = ref(false);
const lyricsLoading = ref(false);
const length = ref(0);

// Speed cycling
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// Sleep timer presets
const SLEEP_PRESETS = [0, 300, 600, 900, 1800, 3600]; // 0=off, 5m, 10m, 15m, 30m, 1h
let sleepTimerIdx = 0;

// Computed
const themeIcon = computed(() => {
  return uiStore.theme === 'light' ? '#i-moon' : '#i-sun';
});

const activeNav = computed(() => {
  const path = route.path;
  if (path.startsWith('/search')) return 'search';
  if (path.startsWith('/charts')) return 'charts';
  if (path.startsWith('/library')) return 'library';
  if (path.startsWith('/moods')) return 'moods';
  return 'home';
});

const canGoBack = computed(() => window.history.length > 1);
const canGoForward = computed(() => window.history.length > 1);

const progressPercent = computed(() => {
  if (!playerStore.duration) return 0;
  return Math.min(100, (playerStore.currentTime / playerStore.duration) * 100);
});

const isCurrentFav = computed(() => {
  if (!playerStore.currentTrackValue?.videoId) return false;
  return libraryStore.isFav(playerStore.currentTrackValue.videoId);
});

const activeLyricIdx = computed(() => {
  return lyricsApi.getActiveLyricIndex(playerStore.currentTime);
});

const npRangeValue = computed(() => {
  if (!playerStore.duration) return 0;
  return Math.round((playerStore.currentTime / playerStore.duration) * 1000);
});

const lyricPreview = computed(() => {
  return lyricsApi.getLyricPreview(playerStore.currentTime);
});

const sleepTimerLabel = computed(() => {
  if (!playerStore.sleepTimer) return 'Sleep';
  const s = playerStore.sleepTimer.remaining;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
});

const navItems = [
  { id: 'home', label: 'Home', icon: 'i-home-o', iconActive: 'i-home', to: '/' },
  { id: 'search', label: 'Search', icon: 'i-search', iconActive: 'i-search', to: '/search' },
  { id: 'charts', label: 'Charts', icon: 'i-chart', iconActive: 'i-chart', to: '/charts' },
  { id: 'library', label: 'Your Library', icon: 'i-library', iconActive: 'i-library', to: '/library' },
];

const desktopNavItems = navItems.filter(item => ['home', 'search', 'charts'].includes(item.id));

const npTabs = [
  { id: 'player', icon: 'i-note', label: 'Song' },
  { id: 'queue', icon: 'i-queue', label: 'Queue' },
  { id: 'lyrics', icon: 'i-mic', label: 'Lyrics' },
  { id: 'related', icon: 'i-radio', label: 'Related' },
];

// User queue items (upcoming songs added by user, after current index)
const userQueueItems = computed(() => {
  return playerStore.queue
    .map((q, i) => ({ ...q, _origIndex: i }))
    .filter((q, i) => i > playerStore.currentIndex && q._user);
});

// Methods
function goToRoute(path) {
  if (path.startsWith('#')) path = path.substring(1);
  router.push(path);
}

function goBack() {
  router.back();
}

function goForward() {
  router.forward();
}

function focusSearch() {
  const searchInput = document.querySelector('.tb-search input');
  if (searchInput) searchInput.focus();
}

function debounceSearch() {
  clearTimeout(window.searchTimeout);
  window.searchTimeout = setTimeout(() => {
    if (searchQuery.value) {
      router.push(`/search/${encodeURIComponent(searchQuery.value)}`);
    } else {
      router.push('/search');
    }
  }, 500);
}

function openCreatePlaylistModal() {
  uiStore.openCreatePlaylist();
}

function createPlaylist() {
  if (!newPlaylistName.value) return;
  libraryStore.createPlaylist(newPlaylistName.value);
  newPlaylistName.value = '';
  uiStore.closeCreatePlaylist();
}

function toggleFavorite(song) {
  if (song) libraryStore.toggleFav(song);
  uiStore.closeSongMenu();
}

function addToPlaylist(song, playlistId) {
  libraryStore.addToPlaylist(playlistId, song);
  uiStore.closeAddToPlaylist();
}

function toggleFavoriteCurrent() {
  if (playerStore.currentTrackValue) {
    libraryStore.toggleFav(playerStore.currentTrackValue);
  }
}

function queueSong(song) {
  if (song) {
    playerStore.addToQueue(song);
  }
  uiStore.closeSongMenu();
}

function downloadSong(song) {
  if (song) {
    downloadApi.downloadSong(song);
  }
  uiStore.closeSongMenu();
}

function downloadCurrent() {
  if (playerStore.currentTrackValue) {
    downloadApi.downloadSong(playerStore.currentTrackValue);
  }
}

function playSong(song) {
  if (song) {
    playerStore.playTrack(song);
    libraryStore.pushHistory(song);
  }
}

function goToSavedItem(item) {
  if (item.type === 'artist') {
    goToRoute(`/artist/${item.browseId}`);
  } else if (item.type === 'album') {
    goToRoute(`/album/${item.browseId}`);
  } else if (item.type === 'playlist') {
    goToRoute(`/playlist/${item.browseId}`);
  }
}

function seekTo(event) {
  const bar = event.currentTarget;
  const rect = bar.getBoundingClientRect();
  const pct = (event.clientX - rect.left) / rect.width;
  yt.seekTo(pct);
}

function seekToRange(value) {
  if (!playerStore.duration) return;
  const fraction = value / 1000;
  yt.seekTo(fraction);
}

function seekToLyric(time) {
  if (yt.ytPlayer.value && yt.ytReady.value) {
    yt.ytPlayer.value.seekTo(time, true);
    yt.ytPlayer.value.playVideo();
  }
}

// State untuk menyimpan status Mute & volume sebelum di-mute
const isMuted = ref(false);
const previousVolume = ref(100);

function toggleMute() {
  if (isMuted.value) {
    // UNMUTE: Kembalikan volume ke nilai sebelum di-mute
    isMuted.value = false;
    const restoreVol = previousVolume.value > 0 ? previousVolume.value : 50;
    yt.setVolume(restoreVol);
  } else {
    // MUTE: Simpan volume saat ini, lalu set volume ke 0
    previousVolume.value = playerStore.volume;
    isMuted.value = true;
    yt.setVolume(0);
  }
}

// Update juga fungsi setVolume agar mereset status Mute saat slider digeser manual
function setVolume(vol) {
  if (vol > 0) {
    isMuted.value = false;
  } else {
    isMuted.value = true;
  }
  yt.setVolume(vol);
}

function toggleVideo() {
  uiStore.toggleVideoMode();
  // Resize YT player to match container when video mode turns on
  if (uiStore.videoMode) {
    setTimeout(() => {
      if (yt.ytPlayer.value && yt.ytReady.value) {
        const container = document.getElementById('np-video-container');
        if (container) {
          const w = container.clientWidth;
          const h = container.clientHeight;
          try { yt.ytPlayer.value.setSize(w, h); } catch { }
        }
      }
    }, 100);
  }
}

function toggleQuality() {
  yt.toggleQuality();
}

function cycleSpeed() {
  const i = SPEEDS.indexOf(playerStore.speed);
  const newSpeed = SPEEDS[(i + 1) % SPEEDS.length];
  playerStore.changeSpeed(newSpeed);
  if (yt.ytPlayer.value && yt.ytReady.value) {
    yt.ytPlayer.value.setPlaybackRate(newSpeed);
  }
  uiStore.showToast(`Speed: ${newSpeed}×`);
}

function toggleSB() {
  sbApi.toggleSB();
}

function toggleSleepTimer() {
  sleepTimerIdx = (sleepTimerIdx + 1) % SLEEP_PRESETS.length;
  const seconds = SLEEP_PRESETS[sleepTimerIdx];
  if (seconds === 0) {
    playerStore.clearSleepTimer();
    uiStore.showToast('Sleep timer off');
  } else {
    playerStore.setSleepTimer(seconds);
    const m = Math.floor(seconds / 60);
    uiStore.showToast(`Sleep timer: ${m} min`);
  }
}

function retryLyrics() {
  lyricsApi.resetRetry();
  if (playerStore.currentTrackValue) {
    lyricsApi.loadLyrics(playerStore.currentTrackValue);
  }
}

async function handleRelatedClick(item) {
  if (item.type === 'song' && item.videoId) {
    const song = normalizeSong({
      videoId: item.videoId,
      title: item.title,
      artist: item.artist || item.subtitle,
      thumbnail: item.thumbnail,
    });
    playerStore.playTrack(song);
    libraryStore.pushHistory(song);
  } else if (item.browseId) {
    if (item.type === 'artist') goToRoute(`/artist/${item.browseId}`);
    else if (item.type === 'album') goToRoute(`/album/${item.browseId}`);
    else goToRoute(`/playlist/${item.browseId}`);
  }
}

// Watch for track changes to load lyrics, related, sponsorblock
watch(() => playerStore.loadId, (newId, oldId) => {
  if (newId === oldId || newId === 0) return;
  const song = playerStore.currentTrackValue;
  if (!song) return;

  // AUTO-ENABLE VIDEO MODE SAAT LAGU BARU DIPUTAR
  uiStore.videoMode = true;

  // Start playback via YT
  yt.startCurrent();

  // Load lyrics in background (non-blocking)
  lyricsApi.resetRetry();
  lyricsLoading.value = true;
  lyricsApi.loadLyrics(song).finally(() => {
    lyricsLoading.value = false;
  });

  // Load SponsorBlock
  sbApi.loadSponsorBlock(song.videoId);

  // Reset related content
  relatedContent.value = null;
  playerStore.setRelatedLoaded(false);
}, { flush: 'post' });

// Watch for related tab activation
watch(() => uiStore.activeNpTab, async (tab) => {
  if (tab === 'related' && !relatedContent.value && playerStore.currentTrackValue) {
    relatedLoading.value = true;
    const result = await relatedApi.loadRelated(true);
    relatedContent.value = result;
    relatedLoading.value = false;
  }
});

const mainAreaRef = ref(null);

watch(() => route.path, async (newPath) => {
  const key = newPath === '/' ? 'home' : newPath.split('/')[1] || 'home';
  applyTint(key);

  // Jika masuk ke Home DAN ada lagu yang sedang diputar, buka video
  if (key === 'home' && playerStore.isPlaying) {
    uiStore.videoMode = true;
  } else {
    // Di halaman lain, sembunyikan video
    uiStore.videoMode = false;
  }

  await nextTick();
  setTimeout(() => {
    if (mainAreaRef.value) {
      mainAreaRef.value.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, 50);
});

// Watch player state to set body classes (has-player, paused, np-open)
watch(() => [playerStore.currentTrackValue, uiStore.miniPlayerVisible], ([track, visible]) => {
  if (track && visible) document.body.classList.add('has-player');
  else document.body.classList.remove('has-player');
}, { immediate: true, flush: 'post' });

watch(() => playerStore.isPlaying, (playing) => {
  document.body.classList.toggle('paused', !playing);
}, { flush: 'post' });

watch(() => uiStore.isNowPlayingOpen, (open) => {
  if (open) document.body.classList.add('np-open');
  else document.body.classList.remove('np-open');
}, { flush: 'post' });

watch(() => uiStore.sidebarOpen, (open) => {
  document.body.classList.toggle('sidebar-closed', !open);
}, { immediate: true, flush: 'post' });

// Progress loop
let progressInterval = null;

// Lifecycle
onMounted(() => {
  // Initialize theme
  uiStore.applyTheme(uiStore.theme);

  // Initialize YouTube Player
  yt.initYouTubePlayer();

  // Hide splash after 1.2s
  setTimeout(() => {
    splashGone.value = true;
  }, 1200);

  // Sync search query from route
  if (route.params.query) {
    searchQuery.value = decodeURIComponent(route.params.query);
  }

  // Apply tint based on current route
  const key = route.path === '/' ? 'home' : route.path.split('/')[1] || 'home';
  applyTint(key);

  // Start progress loop
  progressInterval = setInterval(() => {
    yt.progressTick();
    // Maybe retry lyrics when duration is known
    if (yt.ytPlayer.value && yt.ytReady.value && yt.ytPlayer.value.getDuration) {
      const dur = Math.round(yt.ytPlayer.value.getDuration() || 0);
      if (dur) lyricsApi.maybeRetryLyrics(dur);
    }
  }, 400);

  // Load initial data
  loadInitialData();
});

onUnmounted(() => {
  clearTimeout(window.searchTimeout);
  if (progressInterval) clearInterval(progressInterval);
  playerStore.clearSleepTimer();
});

async function loadInitialData() {
  isLoading.value = true;
  try {
    await api.getHome();
  } catch (error) {
    console.error('Failed to load initial data:', error);
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
/* Only styles NOT in global styles.css */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--bg);
  color: var(--text);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border);
  border-top: 4px solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Transition for route changes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal overlay (scoped, not in global) */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(6px);
}

.modal-content {
  background: var(--card-hover);
  border-radius: 16px;
  padding: 24px;
  width: min(92vw, 500px);
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 16px 60px rgba(0, 0, 0, 0.45);
  animation: popIn 0.22s ease;
}

.modal-content h2 {
  font-size: 20px;
  margin-bottom: 16px;
  font-weight: 800;
}

.modal-content input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--hover-strong);
  border: none;
  color: var(--text);
  font-size: 14px;
  margin-bottom: 10px;
  outline: none;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  padding: 12px 24px;
  background: var(--accent-bright);
  color: #000;
  border: none;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary:hover {
  background: #3be477;
}

.btn-secondary {
  padding: 12px 24px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.modal-close {
  margin-top: 16px;
  padding: 12px 24px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
}

.playlist-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 6px;
  text-align: left;
  width: 100%;
  transition: background 0.15s;
}

.playlist-item:hover {
  background: var(--hover-strong);
}

.playlist-cover {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-cover .art-ph {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--elevated);
  color: var(--muted);
}

.playlist-info {
  flex: 1;
  min-width: 0;
}

.playlist-name {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-count {
  font-size: 12px;
  color: var(--muted);
}

.song-menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.song-cover {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-cover .art-ph {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--elevated);
  color: var(--muted);
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 13px;
  color: var(--muted);
  margin-top: 2px;
}

.song-menu-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  text-align: left;
  width: 100%;
  color: var(--text);
  font-size: 14px;
  transition: background 0.15s;
}

.menu-item:hover {
  background: var(--hover);
}

.menu-item .ic {
  width: 20px;
  height: 20px;
}
</style>
