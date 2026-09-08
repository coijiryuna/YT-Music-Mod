/**
 * useProgressLoop.js — 400ms progress tick loop
 * Updates currentTime/duration, scrobbles, auto-skips SponsorBlock,
 * and triggers lyrics retry
 */
import { usePlayerStore } from '../stores/player';
import { useLibraryStore } from '../stores/library';

let timer = null;

export function useProgressLoop() {
  function start(onTick) {
    stop();
    timer = setInterval(() => {
      const playerStore = usePlayerStore();
      const libraryStore = useLibraryStore();

      if (typeof onTick === 'function') {
        onTick(playerStore, libraryStore);
      }
    }, 400);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  return { start, stop };
}
