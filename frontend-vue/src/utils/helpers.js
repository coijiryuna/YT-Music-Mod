export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

export const fmtTime = (s) => {
  s = Math.max(0, Math.floor(s || 0));
  const m = Math.floor(s / 60),
    sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

export function hueFrom(str) {
  let h = 0;
  const s = String(str || "home");
  for (let i = 0; i < s.length; i++)
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

export function applyTint(key) {
  const hue = hueFrom(key);
  document.documentElement.style.setProperty("--tint", hue);
  const main = document.getElementById("main");
  if (main) main.style.setProperty("--tint", hue);
}

export function looksLikePlays(s) {
  return /pemutaran|plays|ditonton|views|x ditonton/i.test(String(s || ""));
}

export function normalizeDuration(s) {
  const t = String(s || "").trim();
  if (/^\d{1,2}(\.\d{2}){1,2}$/.test(t)) return t.replace(/\./g, ":");
  return t;
}

export function displayTitle(t) {
  const raw = String(t || "").trim();
  if (!raw) return "";
  const cleaned = raw
    .replace(
      /\s*[\(\[]\s*official\s*(hd\s*)?(4k\s*)?(music\s*)?(lyric(s)?\s*)?(audio|video|visualizer|mv)[^\)\]]*[\)\]]/gi,
      "",
    )
    .replace(
      /\s*[\(\[]\s*(official\s*)?(hd\s*)?(music\s*)?(lyric(s)?\s*)?(audio|video|visualizer|mv)[^\)\]]*[\)\]]/gi,
      "",
    )
    .replace(
      /\s*[\(\[]\s*(official\s*)?(4k|hd|hq|8d(?:\s*audio)?|1080p|720p)\s*[\)\]]/gi,
      "",
    )
    .replace(
      /\s*-\s*(official|lyric(s)?|audio|video|visualizer|topic).*$/gi,
      "",
    )
    .replace(/\s{2,}/g, " ")
    .trim();
  return cleaned || raw;
}

export function normalizeSong(s) {
  if (!s) return s;
  return { ...s, title: displayTitle(s.title) };
}

export function songFromItem(it) {
  if (!it) return null;
  const artists = it.artists || [];
  const artistBrowseId =
    it.artistBrowseId || (artists[0] && artists[0].browseId) || "";
  const fromArr = artists
    .map((a) => a.name)
    .filter(Boolean)
    .join(", ");
  const artist =
    fromArr ||
    it.artist ||
    (looksLikePlays(it.subtitle) ? "" : it.subtitle || "");
  return normalizeSong({
    videoId: it.videoId,
    title: it.title,
    artist,
    artistBrowseId,
    thumbnail: it.thumbnail,
    duration: normalizeDuration(it.duration),
    playlistId: it.playlistId,
  });
}

export const COVER_PH =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#242424"/><path fill="#6a6a6a" d="M32 24v26.6a7 7 0 1 0 4 6.4V32h14V24H32z"/></svg>',
  );

export function safeCover(src) {
  const u = String(src || "").trim();
  if (!u || u === "undefined" || u === "null" || u === "about:blank") return "";
  return u;
}

export function downloadFilename(song) {
  const t = displayTitle(song && song.title) || "track";
  const a = String((song && song.artist) || "")
    .split(",")[0]
    .trim();
  const raw = (a ? `${a} - ${t}` : t)
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${raw.slice(0, 80) || "track"}.mp3`;
}

export function parseLRC(lrc) {
  const lines = [];
  for (const raw of String(lrc || "").split("\n")) {
    const m = raw.match(/\[(\d+):(\d+)(?:[.:](\d+))?\](.*)/);
    if (!m) continue;
    const frac = m[3] ? Number(`0.${m[3]}`) : 0;
    lines.push({
      t: parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + frac,
      text: (m[4] || "").trim(),
    });
  }
  return lines.sort((a, b) => a.t - b.t);
}
