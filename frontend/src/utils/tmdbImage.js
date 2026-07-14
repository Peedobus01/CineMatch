const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

// path is what TMDB returns, e.g. "/abc123.jpg" - can be null if no image exists
export function posterUrl(path, size = "w342") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function profileUrl(path, size = "w185") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}