/* i-mobile ad slots.
   i-mobile forbids using a PC tag on phones or a phone tag on PC, so each
   [data-imobile] slot gets exactly one spot, picked by device.
     top     banner above the game (PC 728x90 / phone 320x100)
     belowA  rectangle under the game (PC + phone 300x250)
     belowB  second rectangle under the game (PC only)
     page    rectangle after the article (300x250)
     anchor  phone-only bar fixed to the bottom of the screen; it slides away
             while the game is on screen, so it never sits next to the
             on-screen keyboard. */
(function () {
  'use strict';
  var SPOTS = {
    top:    { pc: [597223, 1948717, 'im-fdc98aee2e6945769c2b3cd3981293d9'], sp: [597224, 1948720, 'im-afe84113321a41148365ae84d2c29955'] },
    belowA: { pc: [597223, 1948718, 'im-71934835fc9d4b69a03bec640dbb7c8d'], sp: [597224, 1948721, 'im-0e27280239d24db5b51b46429731c4dd'] },
    belowB: { pc: [597223, 1948719, 'im-89f14a87b8544f459d3047b7d0ae3948'] },
    page:   { pc: [597223, 1948714, 'im-5e2acee539ad4a0fa55efd6b6f842987'], sp: [597224, 1948713, 'im-e0f199493741455b8c5fb5f9652908bd'] },
    anchor: { sp: [597224, 1948716, 'im-5338625e9ffa4e84be7417f8ec4b6d68'] }
  };
  var ua = navigator.userAgent;
  var phone = (navigator.userAgentData && navigator.userAgentData.mobile) ||
    /iPhone|iPod|Android.+Mobile|Windows Phone/i.test(ua);
  document.documentElement.classList.add(phone ? 'is-phone' : 'is-pc');

  var slots = document.querySelectorAll('[data-imobile]');
  if (!slots.length) return;
  var queue = window.adsbyimobile = window.adsbyimobile || [];
  Array.prototype.forEach.call(slots, function (slot) {
    var kind = slot.getAttribute('data-imobile');
    var spot = SPOTS[kind] && SPOTS[kind][phone ? 'sp' : 'pc'];
    if (!spot || document.getElementById(spot[2])) return;
    var box = document.createElement('div');
    box.id = spot[2];
    slot.appendChild(box);
    queue.push({ pid: 85517, mid: spot[0], asid: spot[1], type: 'banner', display: 'inline', elementid: spot[2] });
  });
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://imp-adedge.i-mobile.co.jp/script/v1/spot.js?20220104';
  document.head.appendChild(s);

  var anchor = document.querySelector('.ad-anchor');
  if (!anchor || !phone) return;
  var closed = false;
  var stage = document.querySelector('.game-stage');
  var close = anchor.querySelector('.ad-anchor-close');
  if (close) close.addEventListener('click', function () { closed = true; sync(); });
  function sync() {
    var h = window.innerHeight;
    var gameVisible = false;
    if (stage) {
      var r = stage.getBoundingClientRect();
      gameVisible = r.top < h * 0.9 && r.bottom > h * 0.1;
    }
    anchor.classList.toggle('show', !closed && window.scrollY > 400 && !gameVisible);
  }
  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
})();
