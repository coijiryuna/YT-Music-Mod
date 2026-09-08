export async function api(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`${path} -> ${r.status}`);
  return r.json();
}

export function useApi() {
  return {
    getHome: () => api("/api/home"),
    search: (q, filter = "") =>
      api(
        `/api/search?q=${encodeURIComponent(q)}${
          filter ? `&filter=${encodeURIComponent(filter)}` : ""
        }`,
      ),
    getSearchSuggestions: (q) =>
      api(`/api/search-suggestions?q=${encodeURIComponent(q)}`),
    getCharts: (country = "ZZ") =>
      api(`/api/charts?country=${encodeURIComponent(country)}`),
    getMoods: () => api("/api/moods"),
    getBrowse: (browseId, params = "") =>
      api(
        `/api/browse?id=${encodeURIComponent(browseId)}${
          params ? `&params=${encodeURIComponent(params)}` : ""
        }`,
      ),
    getAlbum: (browseId) =>
      api(`/api/browse?id=${encodeURIComponent(browseId)}`),
    getPlaylist: (browseId, params = "") =>
      api(
        `/api/browse?id=${encodeURIComponent(browseId)}${
          params ? `&params=${encodeURIComponent(params)}` : ""
        }`,
      ),
    getArtist: (browseId) =>
      api(`/api/browse?id=${encodeURIComponent(browseId)}`),
    getNext: (videoId, playlistId = "") =>
      api(
        `/api/next?videoId=${encodeURIComponent(videoId)}${
          playlistId ? `&playlistId=${encodeURIComponent(playlistId)}` : ""
        }`,
      ),
    getLyrics: (title, artist, duration = 0, browseId = "") =>
      api(
        `/api/lyrics?title=${encodeURIComponent(
          title,
        )}&artist=${encodeURIComponent(artist)}&duration=${duration}&browseId=${encodeURIComponent(
          browseId,
        )}`,
      ),
    getSponsorBlock: (videoId) =>
      api(`/api/sponsorblock?videoId=${encodeURIComponent(videoId)}`),
    getRelated: (browseId) =>
      api(`/api/related?browseId=${encodeURIComponent(browseId)}`),
    startDownload: (videoId) =>
      api(`/api/download-start?videoId=${encodeURIComponent(videoId)}`),
    getDownloadProgress: (progressUrl) =>
      api(
        `/api/download-progress?progressUrl=${encodeURIComponent(progressUrl)}`,
      ),
  };
}
