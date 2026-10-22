/* ==========================================================
   A Little Birthday Garden: script
   Vanilla JS, no libraries, no network calls.
   ========================================================== */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => reduceMq.matches;

  const intro = $('#intro');
  const scene = $('#scene');
  const garden = $('#garden');
  const card = $('#card');
  const closing = $('#closing');
  const actions = $('#actions');
  const toast = $('#toast');
  const fx = $('#fx');
  const glow = $('#glow');

  let timers = [];
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  let opened = false;
  let busy = true;
  let gardenBuilt = false;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildParticles() {
    const box = $('#particles');
    const count = window.innerWidth < 600 ? 26 : 44;
    const colors = ['#ffffff', '#fff0b8', '#f8c8d0', '#ffe3c8'];
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      const star = i % 6 === 0;
      const size = star ? rand(8, 14) : rand(2, 6);
      p.className = 'particle' + (star ? ' star' : '');
      p.style.cssText =
        `left:${rand(0, 100).toFixed(1)}%;top:${rand(0, 100).toFixed(1)}%;` +
        `width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;` +
        `--pc:${pick(colors)};--dx:${rand(-40, 40).toFixed(0)}px;--dy:${rand(-70, -15).toFixed(0)}px;` +
        `--dur:${rand(10, 22).toFixed(1)}s;--tw:${rand(3, 7).toFixed(1)}s;--delay:${(-rand(0, 12)).toFixed(1)}s`;
      frag.appendChild(p);
    }
    box.appendChild(frag);
  }

  let uid = 0;

  const TULIPS = [
    ['#ef9fb1', '#f8c9d3'], ['#f4b9bf', '#fbdde0'], ['#f6d98a', '#fcecb9'],
    ['#f2a98f', '#f9d0c0'], ['#e48aa0', '#f3b3c3'], ['#f7e7a8', '#fff4cf']
  ];
  const DAISIES = [
    ['#fffdf7', '#f8ede4', '#eadbcf'], ['#fde3e6', '#f7cfd5', '#e8b9c1'], ['#fffbe8', '#f8efc9', '#e9dcae']
  ];
  const BLOSSOMS = [
    ['#f4b0c0', '#e48aa0'], ['#f9d0d6', '#eba6b2'], ['#fbe5a0', '#e9c868'], ['#f6c3a8', '#e8a287']
  ];

  function tulip(c) {
    const id = 'tg' + (++uid);
    return `
<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[0]}"/></linearGradient></defs>
<path class="stem" d="M50 220 C49 186 53 134 50 88"/>
<path class="leaf leaf-l" d="M49 216 C30 202 24 160 28 124 C43 148 52 182 49 216Z"/>
<path class="leaf leaf-r" d="M51 206 C70 194 76 156 72 124 C57 148 48 176 51 206Z"/>
<g class="head">
  <path d="M50 90 C30 88 24 58 29 34 C39 40 46 52 50 66Z" fill="${c[0]}"/>
  <path d="M50 90 C70 88 76 58 71 34 C61 40 54 52 50 66Z" fill="${c[0]}"/>
  <path d="M50 92 C34 84 34 50 50 22 C66 50 66 84 50 92Z" fill="url(#${id})"/>
  <path d="M43 76 C40 62 42 48 47 38" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2.6" stroke-linecap="round"/>
</g>`;
  }

  function daisy(t) {
    let front = '', back = '';
    for (let k = 0; k < 14; k++) {
      const a = (k * 360 / 14).toFixed(1);
      front += `<ellipse cx="50" cy="40" rx="5.4" ry="15.5" transform="rotate(${a} 50 58)"/>`;
    }
    for (let k = 0; k < 14; k++) {
      const a = (k * 360 / 14 + 360 / 28).toFixed(1);
      back += `<ellipse cx="50" cy="42" rx="5" ry="14" transform="rotate(${a} 50 58)"/>`;
    }
    return `
<path class="stem" d="M50 220 C52 190 47 140 50 80"/>
<path class="leaf leaf-l" d="M49 200 C36 198 26 188 22 176 C36 174 47 184 49 200Z"/>
<path class="leaf leaf-r" d="M51 176 C64 174 74 164 78 152 C64 150 53 160 51 176Z"/>
<g class="head">
  <g fill="${t[1]}" stroke="${t[2]}" stroke-width=".7">${back}</g>
  <g fill="${t[0]}" stroke="${t[2]}" stroke-width=".7">${front}</g>
  <circle cx="50" cy="58" r="9.5" fill="#f6cf62"/>
  <circle cx="50" cy="58" r="6" fill="#eab948" opacity=".75"/>
  <g fill="#c98f2a"><circle cx="48" cy="56" r=".9"/><circle cx="52" cy="57" r=".9"/><circle cx="50" cy="60.5" r=".9"/><circle cx="46.5" cy="60" r=".8"/><circle cx="53.5" cy="61" r=".8"/></g>
</g>`;
  }

  function blossom(cx, cy, sc, c, late, hx) {
    let pet = '';
    for (let k = 0; k < 5; k++) {
      pet += `<ellipse cx="${cx}" cy="${(cy - 12 * sc).toFixed(1)}" rx="${(7.5 * sc).toFixed(1)}" ry="${(11 * sc).toFixed(1)}" transform="rotate(${k * 72} ${cx} ${cy})"/>`;
    }
    const cls = late ? 'head late' : 'head';
    const st = late ? ` style="--hx:${hx}s"` : '';
    return `<g class="${cls}"${st}>
  <g fill="${c[0]}" stroke="${c[1]}" stroke-width=".8">${pet}</g>
  <circle cx="${cx}" cy="${cy}" r="${(5.2 * sc).toFixed(1)}" fill="#f7e29a"/>
  <circle cx="${cx}" cy="${cy}" r="${(2 * sc).toFixed(1)}" fill="#e8b94f"/>
</g>`;
  }

  function meadow(c) {
    return `
<path class="stem" d="M50 220 C50 176 53 122 50 82"/>
<path class="stem thin" style="--sx:.95s;--sdur:1.1s" d="M50 156 C44 140 36 128 31 108"/>
<path class="stem thin" style="--sx:1.15s;--sdur:1.1s" d="M51 132 C58 116 67 104 72 90"/>
<path class="leaf leaf-l" d="M49 204 C36 202 26 192 22 180 C36 178 47 188 49 204Z"/>
<path class="leaf leaf-r" d="M51 182 C64 180 74 170 78 158 C64 156 53 166 51 182Z"/>
${blossom(50, 68, 1, c, false, 0)}
${blossom(31, 98, .72, c, true, 2.1)}
${blossom(72, 80, .78, c, true, 2.4)}`;
  }

  function dots(cx, cy, sc, hx, late) {
    const offs = [[0, 0, 4.2], [-5, 3, 3.4], [5, 3, 3.4], [-2, -5, 3.2], [3, -4, 2.8]];
    let s = '';
    offs.forEach(([dx, dy, r]) => {
      s += `<circle cx="${(cx + dx * sc).toFixed(1)}" cy="${(cy + dy * sc).toFixed(1)}" r="${(r * sc).toFixed(1)}" fill="#fffaf0" stroke="#ecd9cb" stroke-width=".6"/>`;
    });
    s += `<circle cx="${(cx + 1 * sc).toFixed(1)}" cy="${(cy - 1 * sc).toFixed(1)}" r="${(1.8 * sc).toFixed(1)}" fill="#f7e29a"/>`;
    const cls = late ? 'head late' : 'head';
    const st = late ? ` style="--hx:${hx}s"` : '';
    return `<g class="${cls}"${st}>${s}</g>`;
  }

  function sprig() {
    return `
<path class="stem" d="M50 220 C48 182 54 130 50 62"/>
<path class="stem thin" style="--sx:.9s;--sdur:1.1s" d="M50 160 C43 146 36 134 30 116"/>
<path class="stem thin" style="--sx:1.1s;--sdur:1.1s" d="M51 140 C58 124 66 112 71 94"/>
<path class="stem thin" style="--sx:1.3s;--sdur:1.1s" d="M50 112 C45 100 40 90 38 76"/>
<path class="stem thin" style="--sx:1.4s;--sdur:1.1s" d="M50 100 C56 90 60 80 62 68"/>
<path class="leaf leaf-l" d="M49 200 C38 198 29 190 25 180 C37 178 47 186 49 200Z"/>
<path class="leaf leaf-r" d="M51 186 C62 184 71 176 75 166 C63 164 53 172 51 186Z"/>
${dots(50, 62, 1.1, 0, false)}
${dots(30, 116, .9, 2.0, true)}
${dots(71, 94, .95, 2.2, true)}
${dots(38, 76, .85, 2.4, true)}
${dots(62, 68, .85, 2.5, true)}`;
  }

  function flowerMarkup(type, rnd) {
    const pickR = (arr) => arr[Math.floor(rnd() * arr.length)];
    switch (type) {
      case 'tulip': { const c = pickR(TULIPS); return { svg: tulip(c), c1: c[0], c2: c[1] }; }
      case 'daisy': { const t = pickR(DAISIES); return { svg: daisy(t), c1: t[0], c2: t[1] }; }
      case 'meadow': { const c = pickR(BLOSSOMS); return { svg: meadow(c), c1: c[0], c2: c[1] }; }
      default: return { svg: sprig(), c1: '#fffaf0', c2: '#f7e29a' };
    }
  }

  function makeFlower(opts, rnd) {
    const { type, x, b, s, d, z } = opts;
    const m = flowerMarkup(type, rnd);
    const el = document.createElement('div');
    el.className = 'flower';
    el.dataset.c1 = m.c1;
    el.dataset.c2 = m.c2;
    el.style.cssText =
      `--x:${x.toFixed(2)}%;--b:${b.toFixed(2)}%;--s:${s.toFixed(3)};--d:${d.toFixed(2)}s;` +
      `--sw:${(3.8 + rnd() * 2.4).toFixed(2)}s;--sd:${(-rnd() * 5).toFixed(2)}s;--sa:${(1.2 + rnd() * 1.4).toFixed(2)}deg;` +
      `z-index:${z}`;
    el.innerHTML = `<div class="sway"><svg viewBox="0 0 100 220" focusable="false">${m.svg}</svg></div>`;
    return el;
  }

  function buildGarden() {
    if (gardenBuilt) return;
    gardenBuilt = true;

    const w = Math.max(320, window.innerWidth);
    const rnd = mulberry32(1022);
    const rr = (a, b) => a + rnd() * (b - a);
    const nFront = clamp(Math.round(w / 72), 6, 15);
    const nBack = clamp(Math.round(w / 64), 7, 18);
    const pool = ['tulip', 'tulip', 'tulip', 'daisy', 'daisy', 'daisy', 'meadow', 'meadow', 'sprig'];

    const fill = (container, n, sMin, sMax, bMin, bMax) => {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < n; i++) {
        const slot = 100 / n;
        const x = clamp((i + 0.5) * slot + rr(-0.35, 0.35) * slot, 3, 97);
        const b = rr(bMin, bMax);
        const delay = 0.3 + (Math.abs(x - 50) / 50) * 1.2 + rr(0, 1.8);
        const type = pool[Math.floor(rnd() * pool.length)];
        frag.appendChild(makeFlower({ type, x, b, s: rr(sMin, sMax), d: delay, z: 100 - Math.round(b * 3) }, rnd));
      }
      container.appendChild(frag);
    };

    fill($('#flowersBack'), nBack, 0.58, 0.8, 15, 22);
    fill($('#flowersFront'), nFront, 0.85, 1.15, 4, 10);
    buildGrass();
  }

  function buildGrass() {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = $('#grass');
    const rnd = mulberry32(77);
    const greens = ['#8fb88a', '#7aa377', '#a3c79b', '#6e9a6e', '#88b184'];
    const groups = [];
    for (let i = 0; i < 6; i++) {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'blade-grp');
      g.style.setProperty('--gd', (-rnd() * 4).toFixed(2) + 's');
      g.style.setProperty('--ga', (1.5 + rnd() * 1.8).toFixed(2) + 'deg');
      g.style.setProperty('--gt', (4 + rnd() * 3).toFixed(2) + 's');
      svg.appendChild(g);
      groups.push(g);
    }
    for (let i = 0; i < 150; i++) {
      const x = rnd() * 1200;
      const h = 24 + rnd() * 66;
      const bend = (rnd() - 0.5) * 26;
      const bw = 3 + rnd() * 4;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d',
        `M${(x - bw).toFixed(1)} 122 Q${(x - bw / 2 + bend * 0.2).toFixed(1)} ${(122 - h * 0.6).toFixed(1)} ${(x + bend).toFixed(1)} ${(122 - h).toFixed(1)} ` +
        `Q${(x + bw / 2 + bend * 0.3).toFixed(1)} ${(122 - h * 0.55).toFixed(1)} ${(x + bw).toFixed(1)} 122Z`);
      p.setAttribute('fill', greens[Math.floor(rnd() * greens.length)]);
      groups[i % 6].appendChild(p);
    }
  }

  const PETAL_COLORS = [
    ['#f9cfd5', '#f0a5b3'], ['#fde4e8', '#f6bdc8'], ['#fff0c6', '#f7d98a'],
    ['#fbd9cc', '#eeb09f'], ['#ffffff', '#f3dede']
  ];
  let activePetals = 0;

  function spawnPetal(o = {}) {
    if (!fx.animate) return;
    const colors = o.colors || pick(PETAL_COLORS);
    const size = o.size || rand(9, 17);
    const p = document.createElement('span');
    p.className = 'petal';
    p.style.width = size.toFixed(1) + 'px';
    p.style.height = (size * 1.25).toFixed(1) + 'px';
    p.style.setProperty('--pc1', colors[0]);
    p.style.setProperty('--pc2', colors[1]);
    fx.appendChild(p);
    activePetals++;

    const vw = window.innerWidth, vh = window.innerHeight;
    let kf, opts;

    if (reduced()) {
      const x = rand(10, vw - 10), y = rand(vh * 0.15, vh * 0.8);
      kf = [
        { transform: `translate(${x}px,${y}px)`, opacity: 0 },
        { transform: `translate(${x}px,${y}px)`, opacity: 0.85, offset: 0.4 },
        { transform: `translate(${x}px,${y}px)`, opacity: 0 }
      ];
      opts = { duration: 2400, delay: o.delay || 0 };
    } else if (o.burst) {
      const { x, y } = o.burst;
      const dx = rand(-90, 90), dy = -rand(50, 120), r = rand(180, 520) * (Math.random() < 0.5 ? -1 : 1);
      kf = [
        { transform: `translate(${x}px,${y}px) scale(.4) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${x + dx * 0.7}px,${y + dy}px) scale(1) rotate(${r / 2}deg)`, opacity: 1, offset: 0.4 },
        { transform: `translate(${x + dx}px,${y + dy + 150}px) scale(.9) rotate(${r}deg)`, opacity: 0 }
      ];
      opts = { duration: rand(1400, 2100), easing: 'ease-out' };
    } else {
      const sx = o.x != null ? o.x : rand(0, vw);
      const sway = rand(30, 90) * (Math.random() < 0.5 ? -1 : 1);
      const rot = rand(180, 540);
      const dist = vh + 40;
      kf = [
        { transform: `translate3d(${sx}px,-30px,0) rotate(0deg)`, opacity: 0 },
        { opacity: 0.9, offset: 0.1 },
        { transform: `translate3d(${sx + sway * 0.5}px,${dist * 0.5}px,0) rotate(${rot * 0.5}deg)`, offset: 0.5 },
        { transform: `translate3d(${sx + sway}px,${dist}px,0) rotate(${rot}deg)`, opacity: 0 }
      ];
      opts = { duration: rand(6500, 11000), easing: 'ease-in-out', delay: o.delay || 0 };
    }

    const a = p.animate(kf, opts);
    const done = () => { activePetals = Math.max(0, activePetals - 1); p.remove(); };
    a.onfinish = done;
    a.oncancel = done;
  }

  function sparkAt(x, y, o = {}) {
    if (!fx.animate) return;
    const size = o.size || rand(8, 16);
    const dx = o.dx || 0, dy = o.dy || 0;
    const s = document.createElement('span');
    s.className = 'spark';
    s.style.setProperty('--sz', size.toFixed(1) + 'px');
    fx.appendChild(s);
    const kf = reduced()
      ? [
          { transform: `translate(${x}px,${y}px)`, opacity: 0 },
          { transform: `translate(${x}px,${y}px)`, opacity: 1, offset: 0.4 },
          { transform: `translate(${x}px,${y}px)`, opacity: 0 }
        ]
      : [
          { transform: `translate(${x}px,${y}px) scale(0) rotate(0deg)`, opacity: 0 },
          { transform: `translate(${x + dx * 0.5}px,${y + dy * 0.5}px) scale(1) rotate(90deg)`, opacity: 1, offset: 0.35 },
          { transform: `translate(${x + dx}px,${y + dy}px) scale(0) rotate(180deg)`, opacity: 0 }
        ];
    const a = s.animate(kf, { duration: o.dur || rand(900, 1500), delay: o.delay || 0, easing: 'ease-out' });
    a.onfinish = () => s.remove();
    a.oncancel = () => s.remove();
  }

  function petalShower(n) {
    if (reduced()) {
      for (let i = 0; i < 12; i++) spawnPetal({ delay: i * 120 });
      return;
    }
    for (let i = 0; i < n; i++) spawnPetal({ delay: rand(0, 2200) });
  }

  function burst(x, y, c1, c2) {
    const n = reduced() ? 0 : 12;
    for (let i = 0; i < n; i++) {
      spawnPetal({ burst: { x, y }, colors: [c2 || '#f9cfd5', c1 || '#f0a5b3'], size: rand(8, 14) });
    }
    const sparks = reduced() ? 3 : 7;
    for (let i = 0; i < sparks; i++) {
      const ang = rand(0, Math.PI * 2), r = rand(20, 60);
      sparkAt(x, y, { dx: Math.cos(ang) * r, dy: Math.sin(ang) * r, size: rand(7, 14), dur: rand(700, 1200), delay: rand(0, 150) });
    }
  }

  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 4800);
  }

  function makeWish() {
    glow.classList.remove('on');
    void glow.offsetWidth;
    glow.classList.add('on');

    const vw = window.innerWidth, vh = window.innerHeight;
    const n = reduced() ? 10 : 44;
    for (let i = 0; i < n; i++) {
      sparkAt(rand(vw * 0.05, vw * 0.95), rand(vh * 0.55, vh), {
        dx: rand(-40, 40), dy: -rand(120, 320),
        dur: rand(1600, 2800), delay: rand(0, 900), size: rand(8, 20)
      });
    }
    showToast('Wish made. I hope it comes true ♡');
  }

  function prepareCard() {
    $$('[data-reveal]', card).forEach((el) => {
      if (el.dataset.ready) return;
      const text = el.textContent.replace(/\s+/g, ' ').trim();
      const sr = document.createElement('span');
      sr.className = 'sr-only';
      sr.textContent = text;
      const vis = document.createElement('span');
      vis.setAttribute('aria-hidden', 'true');
      const words = text.split(' ');
      words.forEach((word, k) => {
        const s = document.createElement('span');
        s.className = 'w';
        s.textContent = word;
        vis.appendChild(s);
        if (k < words.length - 1) vis.appendChild(document.createTextNode(' '));
      });
      el.textContent = '';
      el.appendChild(sr);
      el.appendChild(vis);
      el.dataset.ready = '1';
    });
  }

  function revealCard() {
    card.classList.add('is-shown');
    const titleCount = $$('.card-title .w', card).length;
    const words = $$('.w', card);
    const step = reduced() ? 0 : 115;
    words.forEach((w, i) => {
      const extra = i >= titleCount ? 350 : 0;
      w.style.transitionDelay = (250 + i * step + extra) + 'ms';
    });
    requestAnimationFrame(() => requestAnimationFrame(() => words.forEach((w) => w.classList.add('show'))));
    const total = 250 + words.length * step + 350 + 900;
    later(() => closing.classList.add('is-shown'), total);
    later(() => { actions.classList.add('is-shown'); busy = false; }, total + 900);
  }

  function resetStage() {
    garden.classList.remove('bloom');
    scene.classList.remove('flying');
    card.classList.remove('is-shown');
    closing.classList.remove('is-shown');
    actions.classList.remove('is-shown');
    toast.classList.remove('show');
    $$('.w', card).forEach((w) => { w.classList.remove('show'); w.style.transitionDelay = ''; });
  }

  function startGarden() {
    clearTimers();
    busy = true;
    resetStage();
    void garden.offsetWidth;
    garden.classList.add('bloom');
    scene.classList.add('flying');
    petalShower(44);
    const f = reduced() ? 0.35 : 1;
    later(revealCard, 3600 * f);
  }

  function showScene() {
    prepareCard();
    buildGarden();
    scene.hidden = false;
    intro.hidden = true;
    window.scrollTo(0, 0);
    requestAnimationFrame(() => requestAnimationFrame(() => scene.classList.add('is-on')));
    try { scene.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    startGarden();
  }

  function envelopeSparkles() {
    const r = $('#envelope').getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height * 0.3;
    const n = reduced() ? 4 : 18;
    for (let i = 0; i < n; i++) {
      const ang = rand(0, Math.PI * 2), d = rand(30, 120);
      sparkAt(cx + rand(-r.width / 3, r.width / 3), cy, {
        dx: Math.cos(ang) * d, dy: Math.sin(ang) * d - 30,
        size: rand(8, 18), dur: rand(1000, 1800), delay: rand(0, 400)
      });
    }
  }

  later(() => {
    intro.classList.add('is-opening');
    later(envelopeSparkles, 1000);
    later(() => intro.classList.add('is-leaving'), 2500);
    later(() => showScene(), 3400);
  }, 300);

  garden.addEventListener('click', (e) => {
    const fl = e.target.closest && e.target.closest('.flower');
    if (!fl || !garden.classList.contains('bloom')) return;
    const svg = $('svg', fl);
    const r = e.target.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (svg && !reduced()) {
      svg.classList.remove('pop');
      void svg.getBoundingClientRect();
      svg.classList.add('pop');
      svg.addEventListener('animationend', () => svg.classList.remove('pop'), { once: true });
    }
    burst(x, y, fl.dataset.c1, fl.dataset.c2);
  });

  setInterval(() => {
    if (!scene.classList.contains('is-on') || document.hidden || reduced()) return;
    if (activePetals < 8) spawnPetal();
  }, 2200);

  buildParticles();
})();
