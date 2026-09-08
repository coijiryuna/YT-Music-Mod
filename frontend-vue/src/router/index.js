import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 };
  },
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
    },
    {
      path: "/search",
      name: "search",
      component: () => import("../views/SearchView.vue"),
    },
    {
      path: "/search/:query",
      name: "search-query",
      component: () => import("../views/SearchView.vue"),
    },
    {
      path: "/charts",
      name: "charts",
      component: () => import("../views/ChartsView.vue"),
    },
    {
      path: "/moods",
      name: "moods",
      component: () => import("../views/MoodsView.vue"),
    },
    {
      path: "/library",
      name: "library",
      component: () => import("../views/LibraryView.vue"),
    },
    {
      path: "/library/favorites",
      name: "library-favorites",
      component: () => import("../views/LibraryView.vue"),
    },
    {
      path: "/library/playlists",
      name: "library-playlists",
      component: () => import("../views/LibraryView.vue"),
    },
    {
      path: "/library/saved",
      name: "library-saved",
      component: () => import("../views/LibraryView.vue"),
    },
    {
      path: "/library/history",
      name: "library-history",
      component: () => import("../views/LibraryView.vue"),
    },
    {
      path: "/library/stats",
      name: "library-stats",
      component: () => import("../views/LibraryView.vue"),
    },
    {
      path: "/library/playlist/:id",
      name: "local-playlist",
      component: () => import("../views/PlaylistView.vue"),
    },
    {
      path: "/album/:id",
      name: "album",
      component: () => import("../views/AlbumView.vue"),
    },
    {
      path: "/playlist/:id",
      name: "playlist",
      component: () => import("../views/PlaylistView.vue"),
    },
    {
      path: "/artist/:id",
      name: "artist",
      component: () => import("../views/ArtistView.vue"),
    },
    {
      path: "/browse/:id",
      name: "browse",
      component: () => import("../views/BrowseView.vue"),
    },
    {
      path: "/queue",
      name: "queue",
      component: () => import("../views/LibraryView.vue"),
    },
    { path: "/:pathMatch(.*)*", name: "not-found", redirect: "/" },
  ],
});

export default router;
