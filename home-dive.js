(function () {
  'use strict';
  const meter = document.getElementById('dive-meter');
  const reading = document.getElementById('dive-value');
  const zone = document.getElementById('dive-zone');
  const nav = document.getElementById('site-nav');
  if (!meter || !reading || !zone || !nav) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compact = window.matchMedia('(max-width: 1180px)');
  const stops = [['top', 0, 'SURFACE'], ['updates', 20, 'SHALLOWS'], ['articles', 200, 'TWILIGHT'], ['games', 3994, 'GAME TRENCH'], ['about', 8000, 'SEA FLOOR']];
  let anchors = [], fish = [], frame = 0, needsMeasure = true;
  let paused = document.body.classList.contains('motion-paused');
  const clamp = n => Math.max(0, Math.min(1, n));
  function measure() {
    const navHeight = nav.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--dive-nav-height', navHeight + 'px');
    const offset = navHeight + (compact.matches ? 48 : 16);
    anchors = stops.map(([id, depth, label]) => ({
      y: Math.max(0, document.getElementById(id).getBoundingClientRect().top + window.scrollY - offset), depth, label
    }));
    fish = Array.from(document.querySelectorAll('.dive-fish')).map(el => {
      const layer = el.parentElement;
      return {el, width:layer.clientWidth, contentWidth:layer.parentElement.id === 'games' ? 900 : 680, y:layer.getBoundingClientRect().top + window.scrollY + layer.clientHeight * Number(el.dataset.level), reverse:el.dataset.reverse === 'true'};
    });
    needsMeasure = false;
  }
  function render() {
    frame = 0;
    if (needsMeasure) measure();
    const y = Math.max(0, window.scrollY);
    let depth = 8000, label = 'SEA FLOOR';
    for (let i = 0; i < anchors.length - 1; i++) {
      const a = anchors[i], b = anchors[i + 1];
      if (y < b.y - 1) {
        const progress = clamp((y - a.y) / Math.max(1, b.y - a.y));
        depth = a.depth + (b.depth - a.depth) * progress;
        label = a.label;
        break;
      }
    }
    const rounded = Math.round(depth);
    label = stops.filter(stop => rounded >= stop[1]).at(-1)[2];
    const text = rounded.toLocaleString('en-US');
    if (reading.textContent !== text) reading.textContent = text;
    if (zone.textContent !== label) zone.textContent = label;
    meter.style.setProperty('--dive-progress', String(depth / 8000));
    if (!paused && !reduced.matches) {
      fish.forEach(item => {
        const p = clamp((y + window.innerHeight - item.y) / (window.innerHeight + 120));
        const travel = item.reverse ? 1 - p : p;
        let x = -120 + travel * (item.width + 240);
        if (!compact.matches) {
          const gutter = Math.max(120, (item.width - item.contentWidth) / 2 - 24);
          const distance = -110 + p * gutter;
          x = item.reverse ? item.width - distance - 96 : distance;
        }
        item.el.style.transform = `translate3d(${x.toFixed(1)}px,${(Math.sin(p * Math.PI * 3) * 16).toFixed(1)}px,0) scaleX(${item.reverse ? -1 : 1})`;
      });
    }
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  function resize() { needsMeasure = true; schedule(); }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', resize, {passive:true});
  window.addEventListener('load', resize);
  window.addEventListener('site-motion-change', event => { paused = event.detail.paused; schedule(); });
  reduced.addEventListener('change', schedule);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(resize);
    observer.observe(document.body);
    observer.observe(nav);
  }
  meter.hidden = false;
  render();
})();
