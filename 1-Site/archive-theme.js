/* The palette is chosen synchronously so the cover and the chrome never flash
   another edition's colour on the way in. No artwork is colour-graded here. */
(() => {
  'use strict';
  const themes = {
    celluloid: '#1b1917',
    'awards-2020': '#171c21',
    'awards-2010': '#202019',
    'snubs-2020': '#182121',
    'snubs-2010': '#20191d',
    collection: '#1d1b22'
  };
  const root = document.documentElement;
  function apply(kind, id) {
    const decade = id?.startsWith('2010') ? '2010' : '2020';
    const theme = kind === 'awards' || kind === 'snubs'
      ? kind + '-' + decade
      : kind === 'list' ? 'collection' : 'celluloid';
    root.dataset.archiveTheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themes[theme]);
    return theme;
  }
  const page = location.pathname.toLowerCase().split('/').at(-1);
  const params = new URLSearchParams(location.search);
  apply(page === 'awards.html' ? 'awards' : page === 'snubs.html' ? 'snubs' : page === 'list.html' ? 'list' : 'home', params.get('edition'));
  const chapterAccents = {
    'film-direction': '#9abcca',
    'acting-characters': '#ccb6a2',
    writing: '#abbfa8',
    'scenes-moments': '#bcafd0',
    'technical-craft': '#aabbd0',
    'film-music': '#d0b68d',
    'editorial-picks': '#c6aaa6'
  };
  window.ArchiveTheme = {
    apply,
    chapterAccent: id => chapterAccents[id] ?? '#c4a787',
    accent: () => getComputedStyle(root).getPropertyValue('--paper-accent').trim() || '#c4a787'
  };
})();
