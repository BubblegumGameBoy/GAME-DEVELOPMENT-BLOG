/* i-mobile ad slots for the Japanese pages.
   i-mobile forbids using a PC tag on phones or a phone tag on PC, so each
   [data-imobile] slot gets exactly one spot, picked by device.
   data-imobile="page": 300x250 below the article.
   data-imobile="rail": PC 300x600 beside the game / phone 320x50 under it;
   both stay on screen while the game is in full screen (see ja.css). */
(function () {
  'use strict';
  var SPOTS = {
    page: {
      pc: { mid: 597223, asid: 1948714, id: 'im-5e2acee539ad4a0fa55efd6b6f842987' },
      sp: { mid: 597224, asid: 1948713, id: 'im-e0f199493741455b8c5fb5f9652908bd' }
    },
    rail: {
      pc: { mid: 597223, asid: 1948715, id: 'im-28b1f84949c940a88b3a93153c071abe' },
      sp: { mid: 597224, asid: 1948716, id: 'im-5338625e9ffa4e84be7417f8ec4b6d68' }
    }
  };
  var ua = navigator.userAgent;
  var phone = (navigator.userAgentData && navigator.userAgentData.mobile) ||
    /iPhone|iPod|Android.+Mobile|Windows Phone/i.test(ua);
  document.documentElement.classList.add(phone ? 'is-phone' : 'is-pc');

  var slots = document.querySelectorAll('[data-imobile], .imobile-slot');
  if (!slots.length) return;
  var queue = window.adsbyimobile = window.adsbyimobile || [];
  Array.prototype.forEach.call(slots, function (slot) {
    var kind = slot.getAttribute('data-imobile') || 'page';
    var spot = SPOTS[kind] && SPOTS[kind][phone ? 'sp' : 'pc'];
    if (!spot || document.getElementById(spot.id)) return;
    var box = document.createElement('div');
    box.id = spot.id;
    slot.appendChild(box);
    queue.push({ pid: 85517, mid: spot.mid, asid: spot.asid, type: 'banner', display: 'inline', elementid: spot.id });
  });
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://imp-adedge.i-mobile.co.jp/script/v1/spot.js?20220104';
  document.head.appendChild(s);
})();
