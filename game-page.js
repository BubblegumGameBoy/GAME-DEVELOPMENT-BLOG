/* Load the game only when requested; leave the guide usable on its own. */
(function () {
  'use strict';
  const frame = document.getElementById('game-frame');
  const launch = document.getElementById('game-launch');
  const start = document.getElementById('game-start');
  const full = document.getElementById('fs-btn');
  const close = document.getElementById('game-close');
  const status = document.getElementById('game-status');
  if (!frame || !start || !launch || !full || !close || !status) return;
  const japanese = document.documentElement.lang.toLowerCase().startsWith('ja');
  let started = false;
  function load() {
    if (started) return;
    started = true;
    const stage = frame.parentElement;
    if (stage && stage.dataset.playHeight) {
      stage.style.height = stage.dataset.playHeight;
      stage.classList.add('game-started');
    }
    frame.src = frame.dataset.gameSrc;
    launch.hidden = true;
    status.textContent = japanese
      ? 'ゲームを読み込んでいます。3Dゲームは少し時間がかかる場合があります。画面が表示されない場合は、下の「別タブで遊ぶ」をお試しください。'
      : 'The game is loading. Large 3D games can take longer. If the screen stays blank, use “Open in a new tab” below.';
  }
  function leave() {
    frame.classList.remove('fs-on');
    document.body.classList.remove('fs-lock');
    close.hidden = true;
    full.focus();
  }
  start.disabled = false;
  start.addEventListener('click', load);
  full.addEventListener('click', function () {
    load();
    if (frame.classList.contains('fs-on')) return;
    history.pushState({gameFullscreen: true}, '');
    frame.classList.add('fs-on');
    document.body.classList.add('fs-lock');
    close.hidden = false;
    close.focus();
  });
  close.addEventListener('click', function () {
    if (!frame.classList.contains('fs-on')) return;
    leave();
    if (history.state && history.state.gameFullscreen) history.back();
  });
  window.addEventListener('popstate', function () {
    if (frame.classList.contains('fs-on')) leave();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && frame.classList.contains('fs-on')) close.click();
  });
  frame.addEventListener('load', function () {
    if (started) status.textContent = japanese
      ? 'ゲームページが開きました。データの読み込みが続く場合があります。キーボードを使う前にゲーム画面をクリックしてください。「全画面を閉じる」で説明に戻れます。'
      : 'The game page has opened; it may still be loading its assets. Click inside it before using the keyboard. Use “Exit fullscreen” to return to this guide.';
  });
})();
