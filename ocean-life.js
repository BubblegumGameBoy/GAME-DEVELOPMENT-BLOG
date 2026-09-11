/* A single, visibility-aware animation loop for the sea life. No scroll capture. */
(function () {
  'use strict';
  const encounter = document.getElementById('whale-encounter');
  if (!encounter) return;
  const whale = encounter.querySelector('.whale-traveller');
  const water = encounter.querySelector('.encounter-particles');
  const waterContext = water ? water.getContext('2d') : null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = Array.from(document.querySelectorAll('.ocean-current')).map((el, index) => ({
    el, canvas: el.querySelector('canvas'), index, visible: false, width: 0, height: 0
  }));
  let encounterVisible = false, paused = document.body.classList.contains('motion-paused');
  let frame = 0, last = 0, time = 0, smoothY = scrollY, previousY = scrollY, velocity = 0;
  const mod = (n, d) => ((n % d) + d) % d;
  const clamp = n => Math.max(0, Math.min(1, n));
  function size() {
    if (waterContext) {
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      water.width = Math.round(encounter.clientWidth * ratio);
      water.height = Math.round(innerHeight * ratio);
      waterContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    scenes.forEach(scene => {
      scene.width = scene.el.clientWidth;
      scene.height = innerHeight;
      const ratio = Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1 : 1.5);
      scene.canvas.width = Math.round(scene.width * ratio);
      scene.canvas.height = Math.round(scene.height * ratio);
      scene.ctx = scene.canvas.getContext('2d');
      scene.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    });
  }
  function fish(ctx, x, y, length, angle, phase, opacity, near) {
    const beat = Math.sin(phase), bend = Math.sin(phase - .8);
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(length / 60, length / 60);
    ctx.fillStyle = near ? `rgba(134,209,214,${opacity})` : `rgba(82,144,176,${opacity})`;
    // The caudal fin and rear body flex independently of the head.
    ctx.beginPath(); ctx.moveTo(-16, 0);
    ctx.bezierCurveTo(-26, beat * 3, -31, -11 + beat * 7, -38, -12 + beat * 7);
    ctx.quadraticCurveTo(-33, beat * 4, -38, 12 + beat * 7);
    ctx.quadraticCurveTo(-25, 6 + beat * 3, -16, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(27, 0);
    ctx.bezierCurveTo(16, -11, -6, -10, -23, bend * 3);
    ctx.bezierCurveTo(-6, 9, 17, 9, 27, 0); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-5, -6); ctx.lineTo(-9, -15); ctx.lineTo(8, -6); ctx.fill();
    ctx.fillStyle = `rgba(202,245,241,${opacity * .65})`;
    ctx.beginPath(); ctx.ellipse(15, -2, 1.5, 1.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function school(scene) {
    const {ctx, width, height} = scene;
    ctx.clearRect(0, 0, width, height);
    const count = width < 700 ? 14 : 26;
    const current = smoothY * .26;
    for (let group = 0; group < 2; group++) {
      const direction = group === 0 ? 1 : -1;
      const base = mod(time * (group ? 15 : 24) + current + group * 490 + scene.index * 240, width + 660) - 330;
      for (let i = 0; i < count; i++) {
        const row = i % 5, column = Math.floor(i / 5);
        const follow = time * .7 - column * .24;
        const x = direction > 0 ? base - column * 39 - row * 11 : width - base + column * 36 + row * 10;
        const y = height * (group ? .72 : .33) + (row - 2) * 24 + Math.sin(follow + row * .3) * 30 + Math.sin(time * .21) * 45;
        const turn = Math.cos(follow) * .14;
        fish(ctx, x, y, (group ? 18 : 28) + Math.sin(i * 8) * 7, (direction > 0 ? 0 : Math.PI) + turn,
          time * (6 + Math.min(4, Math.abs(velocity) * .012)) - i * .65, group ? .25 : .52, !group);
      }
    }
    // Marine particles move at a slower depth plane than the fish.
    for (let i = 0; i < 20; i++) {
      const x = mod(i * 137.7 + Math.sin(time * .17 + i) * 24, width);
      const y = mod(i * 97.1 - time * 7 - smoothY * .12, height);
      ctx.fillStyle = `rgba(185,233,237,${.1 + (i % 4) * .025})`;
      ctx.beginPath(); ctx.arc(x, y, i % 4 ? 1 : 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  function moveWhale() {
    if (!encounterVisible) return;
    const rect = encounter.getBoundingClientRect();
    // Use the pinned part of the scene as a camera approach, then a close pass.
    const p = clamp((innerHeight * .12 - rect.top - (scrollY - smoothY)) / Math.max(1, rect.height - innerHeight * .8));
    const width = encounter.clientWidth;
    // Perspective grows rapidly at close range; the body passes above the viewer.
    const approach = p * p * (3 - 2 * p);
    const pass = clamp((p - .78) / .22);
    const scale = .34 / (1 - .953 * p);
    const travel = width * (-.04 + .09 * approach);
    const drift = Math.sin(time * .3) * (2 + approach * 3);
    const lift = innerHeight * (.04 - .4 * pass * pass) + drift;
    whale.style.transform = `translate3d(${travel.toFixed(1)}px,${lift.toFixed(1)}px,0) perspective(1800px) rotateY(${(-4 + approach * 6).toFixed(2)}deg) rotate(${(-6 + approach * 8 + Math.sin(time * .23) * .4).toFixed(2)}deg) scale(${scale.toFixed(4)})`;
    whale.style.opacity = (.08 + .92 * clamp(p * 2.6)).toFixed(3);
    whale.style.filter = `blur(${(3 * Math.pow(1 - approach, 4)).toFixed(2)}px) brightness(${(.3 + .7 * clamp(p * 1.65) - pass * .45).toFixed(3)})`;
    encounter.style.setProperty('--encounter-progress', p.toFixed(3));
    encounter.style.setProperty('--whale-proximity', approach.toFixed(3));
    encounter.style.setProperty('--whale-occlusion', clamp((p - .5) * 2).toFixed(3));
    if (waterContext) encounterWater(p);
  }
  function encounterWater(p) {
    const ctx = waterContext, w = encounter.clientWidth, h = innerHeight;
    ctx.clearRect(0, 0, w, h);
    // Small silhouettes cross in front of the animal and scatter as it approaches.
    const scatter = clamp((p - .44) / .38);
    for (let i = 0; i < 17; i++) {
      const side = i % 2 ? 1 : -1;
      const x = w * (.5 + side * (.04 + (i % 7) * .025 + scatter * .66)) + Math.sin(time * .6 + i) * 12;
      const y = h * (.46 + (i % 5) * .022 - scatter * .12) + Math.sin(i * 2.3) * h * .045;
      fish(ctx, x, y, 9 + i % 4 * 3, side > 0 ? -.16 : Math.PI + .16, time * 8 + i, .46, false);
    }
    // Perspective marine snow passes the camera at several depths, without flashes.
    const count = w < 700 ? 42 : 72;
    ctx.strokeStyle = '#7ca6b6';
    ctx.fillStyle = '#93b5bd';
    for (let i = 0; i < count; i++) {
      const depth = .22 + mod(i * .618 + time * .023 + p * .31, 1) * .78;
      const x = w * .5 + Math.sin(i * 127.1) * w * .58 / depth;
      const y = h * .48 + Math.cos(i * 73.7) * h * .6 / depth;
      const radius = Math.min(3, .42 / depth);
      ctx.globalAlpha = .08 + (1 - depth) * .24;
      ctx.beginPath();ctx.ellipse(x, y, radius, radius, 0, 0, Math.PI * 2);ctx.fill();
      if (p > .7 && depth < .5) {
        ctx.globalAlpha *= .4;ctx.beginPath();ctx.moveTo(x, y);
        ctx.lineTo(x + (x - w * .5) * .018 * p, y + (y - h * .48) * .018 * p);ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
  function active() { return !paused && !reduced.matches && !document.hidden && (encounterVisible || scenes.some(s => s.visible)); }
  function tick(now) {
    frame = 0;
    if (!active()) { last = 0; return; }
    // Bound rendering to 30 fps, and avoid a time jump after a background tab.
    if (last && now - last < 32) { frame = requestAnimationFrame(tick); return; }
    const dt = last ? Math.min(.06, (now - last) / 1000) : 1 / 30;
    last = now; time += dt;
    smoothY += (scrollY - smoothY) * Math.min(1, dt * 7);
    velocity += ((smoothY - previousY) / dt - velocity) * .12;
    previousY = smoothY;
    scenes.forEach(scene => { if (scene.visible) school(scene); });
    moveWhale();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    const stopped = paused || reduced.matches || document.hidden;
    encounter.classList.toggle('sea-life-stopped', stopped || !encounterVisible);
    if (active() && !frame) frame = requestAnimationFrame(tick);
    if (!active() && frame) { cancelAnimationFrame(frame); frame = 0; last = 0; }
    if (reduced.matches) {
      whale.style.transform = 'none';
      whale.style.opacity = '1';
      whale.style.filter = 'none';
    }
  }
  size();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === encounter) encounterVisible = entry.isIntersecting;
        else scenes.find(scene => scene.el === entry.target).visible = entry.isIntersecting;
      }); sync();
    }, {threshold:0});
    scenes.forEach(scene => observer.observe(scene.el)); observer.observe(encounter);
  }
  window.addEventListener('resize', () => { size(); sync(); }, {passive:true});
  window.addEventListener('site-motion-change', event => { paused = event.detail.paused; sync(); });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  sync();
})();
