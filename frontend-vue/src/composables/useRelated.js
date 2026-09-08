/**
 * useRelated.js — Related content loading composable
 * Mirrors loadRelated() from public/app.js
 */
import { ref } from 'vue';
import { usePlayerStore } from '../stores/player';
import { api } from './useApi';

export function useRelated() {
  const relatedLoading = ref(false);

  async function loadRelated(force = false) {
    const playerStore = usePlayerStore();
    const song = playerStore.currentTrackValue;
    if (!song) return null;
    if (playerStore.relatedLoaded && !force) return null;

    relatedLoading.value = true;
    playerStore.setRelatedLoaded(true);

    const vid = song.videoId;
    const sameSong = () => playerStore.currentTrackValue?.videoId === vid;

    // Wait for relatedBrowseId (max ~5s)
    for (let i = 0; i < 16 && !playerStore.relatedBrowseId && sameSong(); i++) {
      await new Promise(r => setTimeout(r, 300));
      if (!playerStore.queueFetching && i >= 3 && !playerStore.relatedBrowseId) break;
    }

    if (!sameSong()) {
      playerStore.setRelatedLoaded(false);
      relatedLoading.value = false;
      return null;
    }

    const renderFail = () => {
      playerStore.setRelatedLoaded(false);
      return { error: true };
    };

    if (playerStore.relatedBrowseId) {
      try {
        const d = await api(`/api/related?browseId=${encodeURIComponent(playerStore.relatedBrowseId)}`);
        if (d.sections && d.sections.length) {
          relatedLoading.value = false;
          return { sections: d.sections };
        }
      } catch {}
    }

    if (!sameSong()) {
      playerStore.setRelatedLoaded(false);
      relatedLoading.value = false;
      return null;
    }

    // Fallback: try /api/next
    try {
      const d = await api(`/api/next?videoId=${encodeURIComponent(vid)}`);
      if (!sameSong()) {
        playerStore.setRelatedLoaded(false);
        relatedLoading.value = false;
        return null;
      }
      if (d.relatedBrowseId) playerStore.setRelatedBrowseId(d.relatedBrowseId);
      if (playerStore.relatedBrowseId) {
        try {
          const rel = await api(`/api/related?browseId=${encodeURIComponent(playerStore.relatedBrowseId)}`);
          if (rel.sections && rel.sections.length) {
            relatedLoading.value = false;
            return { sections: rel.sections };
          }
        } catch {}
      }
      // Fallback to queue items
      const items = (d.queue || [])
        .filter(q => q.videoId && q.videoId !== vid)
        .slice(0, 25)
        .map(q => ({
          type: 'song',
          videoId: q.videoId,
          title: q.title,
          subtitle: q.artist,
          thumbnail: q.thumbnail,
          duration: q.duration,
          artists: q.artists,
        }));
      if (items.length) {
        relatedLoading.value = false;
        return { sections: [{ title: 'Similar songs', items, list: true }] };
      }
    } catch {}

    if (sameSong()) return renderFail();
    relatedLoading.value = false;
    return null;
  }

  return {
    relatedLoading,
    loadRelated,
  };
}
