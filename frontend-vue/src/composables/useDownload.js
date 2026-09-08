/**
 * useDownload.js — Download song with progress tracking + blob save
 * Mirrors downloadSong() from public/app.js
 */
import { ref } from 'vue';
import { useUiStore } from '../stores/ui';
import { api } from './useApi';
import { displayTitle } from '../utils/helpers';

const activeDownloads = new Set();

export function useDownload() {
  const downloadProgress = ref({});

  function downloadFilename(song) {
    const t = displayTitle(song?.title) || 'track';
    const a = String(song?.artist || '').split(',')[0].trim();
    const raw = (a ? `${a} - ${t}` : t)
      .replace(/[\\/:*?"<>|]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return `${raw.slice(0, 80) || 'track'}.mp3`;
  }

  function clickDownload(href, name) {
    const aEl = document.createElement('a');
    aEl.href = href;
    aEl.download = name || '';
    aEl.target = '_blank';
    aEl.rel = 'noopener noreferrer';
    document.body.appendChild(aEl);
    aEl.click();
    aEl.remove();
  }

  async function downloadSong(song) {
    const ui = useUiStore();
    if (!song || !song.videoId) return;

    if (activeDownloads.has(song.videoId)) {
      ui.showToast('Already downloading this song…');
      return;
    }
    activeDownloads.add(song.videoId);
    downloadProgress.value = { ...downloadProgress.value, [song.videoId]: 0 };
    ui.showToast(`Preparing "${song.title}" (320kbps MP3)…`);

    try {
      const st = await api(`/api/download-start?videoId=${encodeURIComponent(song.videoId)}`);
      if (!st.progressUrl) throw new Error('no progress url');

      let url = null;
      let lastProg = -1;

      for (let i = 0; i < 60; i++) {
        if (i) await new Promise(r => setTimeout(r, 2500));
        try {
          const p = await api(`/api/download-progress?progressUrl=${encodeURIComponent(st.progressUrl)}`);
          if (p.done && p.url) {
            url = p.url;
            break;
          }
          const raw = Number(p.progress) || 0;
          const pct = Math.min(99, raw > 100 ? Math.round(raw / 10) : Math.round(raw));
          if (pct !== lastProg) {
            lastProg = pct;
            downloadProgress.value = { ...downloadProgress.value, [song.videoId]: pct };
            ui.showToast(
              pct <= 5 && p.text
                ? String(p.text)
                : `Converting "${song.title}"… ${pct}%`
            );
          }
        } catch {}
      }

      if (!url) throw new Error('timeout');
      ui.showToast(`Downloading "${song.title}"…`);

      const name = downloadFilename(song);
      try {
        const r = await fetch(url, { mode: 'cors' });
        if (!r.ok) throw new Error('fetch');
        const blob = await r.blob();
        const obj = URL.createObjectURL(blob);
        clickDownload(obj, name);
        setTimeout(() => URL.revokeObjectURL(obj), 8000);
      } catch {
        clickDownload(url, name);
      }
      ui.showToast('Download started');
    } catch (e) {
      ui.showToast('Download failed — try again later');
    } finally {
      activeDownloads.delete(song.videoId);
      downloadProgress.value = { ...downloadProgress.value, [song.videoId]: 100 };
    }
  }

  return {
    downloadProgress,
    downloadSong,
    downloadFilename,
  };
}
