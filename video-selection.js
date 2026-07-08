function normalizeVideoText(value) {
  return String(value || "")
    .toLocaleLowerCase("it")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[®™:–—-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function durationToSeconds(duration) {
  if (!duration) return 0;
  const parts = String(duration).split(":").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return 0;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function hasExactGameTitle(gameTitle, videoTitle) {
  return normalizeVideoText(videoTitle).includes(normalizeVideoText(gameTitle));
}

function videoCandidateScore(gameTitle, candidate) {
  const title = candidate.title || "";
  const exactTitle = hasExactGameTitle(gameTitle, title) ? 1 : 0;
  const platformMatch = /\b(ps5|ps4|playstation)\b/i.test(title) ? 1 : 0;
  const gameplayMatch = /\b(gameplay|walkthrough|playthrough|full game|no commentary|longplay)\b/i.test(title) ? 1 : 0;
  const durationSeconds = durationToSeconds(candidate.duration);

  return {
    exactTitle,
    platformMatch,
    gameplayMatch,
    durationSeconds
  };
}

function compareVideoCandidates(gameTitle, left, right) {
  const a = videoCandidateScore(gameTitle, left);
  const b = videoCandidateScore(gameTitle, right);
  const fields = ["exactTitle", "gameplayMatch", "durationSeconds", "platformMatch"];

  for (const field of fields) {
    if (a[field] !== b[field]) return b[field] - a[field];
  }

  return 0;
}

function chooseGameplayVideo(gameTitle, candidates) {
  return [...candidates]
    .filter((candidate) => hasExactGameTitle(gameTitle, candidate.title))
    .sort((left, right) => compareVideoCandidates(gameTitle, left, right))[0] || null;
}

if (typeof module !== "undefined") {
  module.exports = {
    chooseGameplayVideo,
    compareVideoCandidates,
    durationToSeconds,
    hasExactGameTitle,
    normalizeVideoText,
    videoCandidateScore
  };
}
