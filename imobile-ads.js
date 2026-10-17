/* i-mobile ad slots.
   i-mobile forbids using a PC tag on phones or a phone tag on PC, so each
   [data-imobile] slot gets exactly one spot, picked by device.
     top     banner above the game (PC 728x90 / phone 320x100)
     belowA  rectangle under the game (PC + phone 300x250)
     belowB  second rectangle under the game (PC only)
     page    rectangle after the article (300x250)
     anchor  phone-only bar fixed to the bottom of the screen; it slides away
             while the game is on screen, so it never sits next to the
             on-screen keyboard.
     result  phone-only strip (320x100) fixed to the bottom while the game's
             result screen is up. The game posts {type:'mythling-state', state}
             to this page (docs/host-messages.md in the game); the strip shows
             on 'result' and hides when the next battle starts, and the game
             stage shrinks by the strip's height so nothing is covered. The
             spot is requested the first time a result comes, not at page load
             (data-imobile-lazy), so i-mobile only counts views that happen. */
(function () {
  'use strict';
  var SPOTS = {
    top:    { pc: [597223, 1948717, 'im-fdc98aee2e6945769c2b3cd3981293d9'], sp: [597224, 1948720, 'im-afe84113321a41148365ae84d2c29955'] },
    belowA: { pc: [597223, 1948718, 'im-71934835fc9d4b69a03bec640dbb7c8d'], sp: [597224, 1948721, 'im-0e27280239d24db5b51b46429731c4dd'] },
    belowB: { pc: [597223, 1948719, 'im-89f14a87b8544f459d3047b7d0ae3948'] },
    page:   { pc: [597223, 1948714, 'im-5e2acee539ad4a0fa55efd6b6f842987'], sp: [597224, 1948713, 'im-e0f199493741455b8c5fb5f9652908bd'] },
    anchor: { sp: [597224, 1948716, 'im-5338625e9ffa4e84be7417f8ec4b6d68'] },
    result: { sp: [597224, 1948725, 'im-1c6945c725a84212924f2e58d9e83dcf'] }
  };
  var ua = navigator.userAgent;
  var phone = (navigator.userAgentData && navigator.userAgentData.mobile) ||
    /iPhone|iPod|Android.+Mobile|Windows Phone/i.test(ua);
  document.documentElement.classList.add(phone ? 'is-phone' : 'is-pc');

  var slots = document.querySelectorAll('[data-imobile]');
  if (!slots.length) return;
  var queue = window.adsbyimobile = window.adsbyimobile || [];
  // Queues one slot's spot. Returns true when something new was queued.
  function fill(slot) {
    var kind = slot.getAttribute('data-imobile');
    var spot = SPOTS[kind] && SPOTS[kind][phone ? 'sp' : 'pc'];
    if (!spot || document.getElementById(spot[2])) return false;
    var box = document.createElement('div');
    box.id = spot[2];
    slot.appendChild(box);
    queue.push({ pid: 85517, mid: spot[0], asid: spot[1], type: 'banner', display: 'inline', elementid: spot[2] });
    return true;
  }
  // spot.js reads the queue when it loads; a push after that does nothing until
  // the script is added again (checked 2026-10-18: no duplicate ads in the
  // boxes already filled).
  function load() {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://imp-adedge.i-mobile.co.jp/script/v1/spot.js?20220104';
    document.head.appendChild(s);
  }
  var queued = false;
  Array.prototype.forEach.call(slots, function (slot) {
    if (slot.hasAttribute('data-imobile-lazy')) return;
    if (fill(slot)) queued = true;
  });
  if (queued) load();
  if (!phone) return;

  var stage = document.querySelector('.game-stage');
  var anchor = document.querySelector('.ad-anchor');
  var result = document.querySelector('.ad-result');
  var resultShown = false;
  var closed = false;
  if (anchor) {
    var close = anchor.querySelector('.ad-anchor-close');
    if (close) close.addEventListener('click', function () { closed = true; sync(); });
  }
  function sync() {
    if (!anchor) return;
    var h = window.innerHeight;
    var gameVisible = false;
    if (stage) {
      var r = stage.getBoundingClientRect();
      gameVisible = r.top < h * 0.9 && r.bottom > h * 0.1;
    }
    anchor.classList.toggle('show', !closed && !resultShown && window.scrollY > 400 && !gameVisible);
  }
  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();

  var frame = document.getElementById('game-frame');
  if (!frame || !result) return;
  var gameOrigin = '';
  try { gameOrigin = new URL(frame.getAttribute('data-game-src') || frame.src, location.href).origin; } catch (e) { return; }
  var resultLoaded = false;
  window.addEventListener('message', function (e) {
    if (e.source !== frame.contentWindow || e.origin !== gameOrigin) return;
    if (!e.data || e.data.type !== 'mythling-state') return;
    var show = e.data.state === 'result';
    if (show === resultShown) return;
    resultShown = show;
    if (show && !resultLoaded) {
      resultLoaded = true;
      if (fill(result.querySelector('[data-imobile]'))) load();
    }
    result.classList.toggle('show', show);
    document.documentElement.classList.toggle('result-ad', show);
    sync();
  });
})();
