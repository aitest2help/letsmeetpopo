const paths = {
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/>',
  bowl: '<path d="M3 12h18a9 9 0 0 1-18 0ZM8 22h8M8 7c-3-3 3-3 0-6M15 7c-3-3 3-3 0-6"/>',
  hand: '<path d="m2 17 6 5 13-9a3 3 0 0 0-4-4l-4 3H8m-6 5 6-6c1-1 3-1 5 0l2 2"/><path d="M16 5c-4-5-8 0-4 3l4 3 4-3c4-3 0-8-4-3Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2M18 18l2 2M4 20l2-2M18 6l2-2"/>',
  home: '<path d="m2 11 10-9 10 9M5 9v13h14V9M9 22v-8h6v8"/>',
  heart: '<path d="M12 21 3 12C-4 5 7-2 12 6 17-2 28 5 21 12Z"/>',
  chat: '<path d="M21 14a3 3 0 0 1-3 3H8l-6 5V5a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3ZM7 8h10M7 12h6"/>',
  walk: '<circle cx="14" cy="3" r="2"/><path d="m8 10 5-4 4 6 4 1M13 6l-2 9-5 6M11 15l5 2 2 5M3 10v12"/>',
  bath: '<path d="M3 13h18v4a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-4ZM5 13V5a3 3 0 0 1 6 0M11 5l4 2M16 10h.01M19 12h.01"/>',
  pill: '<path d="m5 19 14-14M5 19a6 6 0 0 1 0-9l5-5a6 6 0 0 1 9 9l-5 5a6 6 0 0 1-9 0Z"/>',
  note: '<rect x="4" y="3" width="16" height="19" rx="3"/><path d="M8 1v4M16 1v4M8 10h8M8 14h8M8 18h4"/>',
  moon: '<path d="M20 17A10 10 0 0 1 7 3a10 10 0 1 0 13 14Z"/>',
  faith: '<path d="m12 2-1 12-8 5 3 3 6-5 6 5 3-3-8-5-1-12Z"/>',
  bed: '<path d="M2 9v13M22 9v13M2 18h20M3 10h18v8H3ZM6 10V6h12v4"/>',
  clean: '<path d="m14 2-5 12M7 13l9 3-3 6-11-3 5-6ZM19 3v6M16 6h6"/>',
  play: '<path d="m8 4 12 8-12 8V4Z"/>',
  pause: '<path d="M8 4v16M16 4v16"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="1"/>',
  sound: '<path d="M3 9h4l5-5v16l-5-5H3V9ZM16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>'
};
export function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] || paths.hand}</svg>`;
}
