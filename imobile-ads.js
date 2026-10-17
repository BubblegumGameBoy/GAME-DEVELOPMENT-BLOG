/* i-mobile ad slots for the Japanese game pages.
   i-mobile forbids using a PC tag on phones or a phone tag on PC, so each
   .imobile-slot gets exactly one spot, picked by device. */
(function () {
  'use strict';
  var SPOTS = {
    pc: { pid: 85517, mid: 597223, asid: 1948714, id: 'im-5e2acee539ad4a0fa55efd6b6f842987' },
    sp: { pid: 85517, mid: 597224, asid: 1948713, id: 'im-e0f199493741455b8c5fb5f9652908bd' }
  };
  var slot = document.querySelector('.imobile-slot');
  if (!slot) return;
  var ua = navigator.userAgent;
  var phone = (navigator.userAgentData && navigator.userAgentData.mobile) ||
    /iPhone|iPod|Android.+Mobile|Windows Phone/i.test(ua);
  var spot = phone ? SPOTS.sp : SPOTS.pc;
  var box = document.createElement('div');
  box.id = spot.id;
  slot.appendChild(box);
  (window.adsbyimobile = window.adsbyimobile || []).push({
    pid: spot.pid, mid: spot.mid, asid: spot.asid,
    type: 'banner', display: 'inline', elementid: spot.id
  });
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://imp-adedge.i-mobile.co.jp/script/v1/spot.js?20220104';
  document.head.appendChild(s);
})();
