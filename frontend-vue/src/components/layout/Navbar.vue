<template>
  <header class="navbar">
    <button class="menu-btn" @click="toggleSidebar">
      <svg class="ic"><use href="#i-chev-down" /></svg>
    </button>

    <div class="search-container">
      <button class="search-btn" @click="focusSearch">
        <svg class="ic"><use href="#i-search" /></svg>
      </button>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search songs, artists..."
        class="search-input"
        @input="debounceSearch"
        @keyup.enter="performSearch"
      />
      <button v-if="searchQuery" class="clear-search" @click="clearSearch">×</button>
    </div>

    <div class="nav-actions">
      <button class="theme-btn" @click="toggleTheme">
        <svg class="ic"><use :href="themeIcon" /></svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '../stores/ui';

const router = useRouter();
const uiStore = useUiStore();

const searchQuery = ref('');
const isSidebarOpen = ref(true);

const themeIcon = computed(() => {
  return uiStore.theme === 'light' ? '#i-moon' : '#i-sun';
});

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function focusSearch() {
  const searchInput = document.querySelector('.search-input');
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

function performSearch() {
  if (searchQuery.value) {
    router.push(`/search/${encodeURIComponent(searchQuery.value)}`);
  } else {
    router.push('/search');
  }
}

function clearSearch() {
  searchQuery.value = '';
  router.push('/search');
}

function toggleTheme() {
  uiStore.toggleTheme();
}

function handleResize() {
  if (window.innerWidth < 861) {
    isSidebarOpen.value = false;
  } else {
    isSidebarOpen.value = true;
  }
}

onMounted(() => {
  handleResize();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--main-bg) 72%, transparent), transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.menu-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: transform 0.15s, background 0.15s;
}

.menu-btn:hover {
  transform: scale(1.06);
}

.search-container {
  flex: 1;
  max-width: 420px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding: 0 16px;
  background: var(--elevated);
  border-radius: 999px;
  color: var(--muted);
  font-weight: 600;
  font-size: 14px;
  box-shadow: inset 0 0 0 1px transparent;
  transition: background 0.15s, box-shadow 0.15s, color 0.15s, transform 0.15s;
}

.search-container:hover {
  background: var(--card-hover);
  color: var(--text);
  transform: scale(1.01);
}

.search-container:focus-within {
  border-color: var(--text);
  background: var(--card-hover);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--text) 8%, transparent);
}

.search-btn {
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.search-btn .ic {
  width: 20px;
  height: 20px;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 15px;
  font-weight: 500;
}

.search-input::placeholder {
  color: var(--muted);
}

.clear-search {
  color: var(--muted);
  font-size: 20px;
  font-weight: bold;
  padding: 0 8px;
  background: none;
  border: none;
  cursor: pointer;
}

.clear-search:hover {
  color: var(--text);
}

.nav-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}

.theme-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: transform 0.15s, background 0.15s;
}

html[data-theme="light"] .theme-btn {
  background: rgba(0, 0, 0, 0.08);
  color: var(--text);
}

.theme-btn:hover {
  transform: scale(1.06);
}

.theme-btn .ic {
  width: 18px;
  height: 18px;
}
</style>