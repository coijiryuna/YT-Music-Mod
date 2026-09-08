/**
 * useSponsorBlock.js — SponsorBlock segments loading
 */
import { usePlayerStore } from '../stores/player';
import { useUiStore } from '../stores/ui';
import { api } from './useApi';

export function useSponsorBlock() {
  async function loadSponsorBlock(videoId) {
    const playerStore = usePlayerStore();
    playerStore.sbSegments = [];
    try {
      const d = await api(`/api/sponsorblock?videoId=${encodeURIComponent(videoId)}`);
      playerStore.sbSegments = d.segments || [];
      if (playerStore.sbSegments.length && playerStore.sbEnabled) {
        const ui = useUiStore();
        ui.showToast(`SponsorBlock: ${playerStore.sbSegments.length} segment(s) will be skipped`);
      }
    } catch {}
  }

  function toggleSB() {
    const playerStore = usePlayerStore();
    const ui = useUiStore();
    playerStore.toggleSB();
    ui.showToast(playerStore.sbEnabled ? 'SponsorBlock on' : 'SponsorBlock off');
  }

  return {
    loadSponsorBlock,
    toggleSB,
  };
}
