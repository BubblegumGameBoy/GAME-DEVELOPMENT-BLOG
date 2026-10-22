/* Live activity line on the Monster Typing pages: how many are online and in a
   battle right now, and how many are on the ranking. Read from the game's
   /api/ranking (here / playing / total; the names in the answer are never
   shown). The answer is kept in localStorage for the seconds its `refresh`
   field asks (120 s by default), so a page view inside that window makes no
   request: the game's API is budgeted and rate-limited (asked by the game
   side, 2026-10-22). Shown only when an answer is there, so the page looks
   the same if the API is down. */
(function () {
  'use strict';
  var el = document.getElementById('live-stats');
  if (!el || !window.fetch) return;
  var ja = (document.documentElement.lang || '').toLowerCase().indexOf('ja') === 0;
  var KEY = 'mt-live-stats';
  function render(d) {
    var here = d.here, playing = d.playing || 0, total = d.total || 0;
    if (typeof here !== 'number' || (here < 2 && total < 10)) return;
    el.textContent = ja
      ? ('いま ' + here + ' 人がオンライン' + (playing ? '、' + playing + ' 人が対戦中' : '') + (total ? '。ランキング登録 ' + total + ' 人' : ''))
      : (here + ' online now' + (playing ? ', ' + playing + ' in a battle' : '') + (total ? '. ' + total + ' players on the ranking' : ''));
    el.hidden = false;
  }
  var cached = null;
  try { cached = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (cached && cached.until > Date.now() && cached.data) { render(cached.data); return; }
  fetch('https://monster.bubblegumgameboy.com/api/ranking', { mode: 'cors', credentials: 'omit' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d || typeof d.here !== 'number') return;
      var data = { here: d.here, playing: d.playing || 0, total: d.total || 0 };
      var ttl = Math.max(120, Number(d.refresh) || 120) * 1000;
      try { localStorage.setItem(KEY, JSON.stringify({ until: Date.now() + ttl, data: data })); } catch (e) {}
      render(data);
    })
    .catch(function () {});
})();
