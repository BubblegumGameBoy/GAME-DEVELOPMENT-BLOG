/* Live activity line on the Monster Typing pages: how many are online and in a
   battle right now, and how many are on the ranking. Read from the game's
   /api/ranking (here / playing / total; no names). Shown only when the answer
   arrives, so the page looks the same if the API is down or has no CORS header
   for this site yet (asked for on 2026-10-22). */
(function () {
  'use strict';
  var el = document.getElementById('live-stats');
  if (!el || !window.fetch) return;
  var ja = (document.documentElement.lang || '').toLowerCase().indexOf('ja') === 0;
  fetch('https://monster.bubblegumgameboy.com/api/ranking', { mode: 'cors', credentials: 'omit' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d || typeof d.here !== 'number') return;
      var here = d.here, playing = d.playing || 0, total = d.total || 0;
      if (here < 2 && total < 10) return;
      el.textContent = ja
        ? ('いま ' + here + ' 人がオンライン' + (playing ? '、' + playing + ' 人が対戦中' : '') + (total ? '。ランキング登録 ' + total + ' 人' : ''))
        : (here + ' online now' + (playing ? ', ' + playing + ' in a battle' : '') + (total ? '. ' + total + ' players on the ranking' : ''));
      el.hidden = false;
    })
    .catch(function () {});
})();
