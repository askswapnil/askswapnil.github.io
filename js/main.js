/* Untangled: page behaviour. Needs content.js and thread.js loaded first. */
(function () {
  'use strict';
  const C = window.CONTENT, T = window.Thread;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const mqRM = matchMedia('(prefers-reduced-motion: reduce)');
  // ?rm=1 previews the reduced-motion version without changing OS settings
  const forceRM = /[?&]rm=1\b/.test(location.search);
  let RM = forceRM || mqRM.matches;
  const SVGNS = 'http://www.w3.org/2000/svg';
  const isPh = v => !v || /^\[.*\]$/.test(String(v).trim());

  /* ================= content wiring ================= */
  const get = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
  $$('[data-c]').forEach(el => {
    const v = get(C, el.dataset.c);
    if (v === undefined) return;
    el.textContent = v;
    el.classList.toggle('ph', isPh(v));
  });

  const LINK_NAMES = { booking: 'Booking link', email: 'Email address', linkedin: 'LinkedIn URL' };
  const LINK_KEYS = { booking: 'bookingUrl', email: 'email', linkedin: 'linkedin' };
  function linkFor(kind, message) {
    const v = C.contact[LINK_KEYS[kind]];
    if (isPh(v)) return null;
    if (kind === 'email') return 'mailto:' + v + (message ? '?subject=' + encodeURIComponent('My Leak Report') + '&body=' + encodeURIComponent(message) : '');
    return v;
  }
  function wireLinks() {
    $$('[data-link]').forEach(a => {
      const href = linkFor(a.dataset.link, a.dataset.message);
      if (href) {
        a.href = href;
        a.classList.remove('is-placeholder');
        if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
      } else {
        a.href = '#contact';
        a.classList.add('is-placeholder');
      }
    });
  }
  wireLinks();
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-link].is-placeholder');
    if (!a) return;
    e.preventDefault();
    const k = a.dataset.link;
    toast('Placeholder: the ' + LINK_NAMES[k].toLowerCase() + ' is not set yet. Add it as <code>contact.' + LINK_KEYS[k] + '</code> in js/content.js.');
  });

  let toastTimer;
  function toast(html) {
    const t = $('#toast');
    t.innerHTML = html;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), 4200);
  }

  /* ================= the thread ================= */
  const main = $('#main'), svg = $('#thread');
  const pTangle = $('#thread-tangle'), pSpine = $('#thread-spine'), pGhost = $('#thread-ghost'), tip = $('#thread-tip');
  const hero = $('#hero');
  const endBtn = $('[data-thread-end]');
  let G = null;           // geometry from the last layout
  let lastP = -1;

  function rel(el, ax = 0.5, ay = 0.5) {
    const r = el.getBoundingClientRect(), m = main.getBoundingClientRect();
    return { x: r.left - m.left + r.width * ax, y: r.top - m.top + r.height * ay, w: r.width, h: r.height, r };
  }

  function layout() {
    const W = main.clientWidth, H = main.offsetHeight;
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    const desktop = innerWidth >= 960;

    // hero tangle around the portrait
    const art = rel($('#hero-art'), 0.5, 0.5);
    const por = rel($('.portrait'), 0.5, 0.5);
    const firstNode = rel($('[data-node]'), 0.5, 0.5);
    const spineX = firstNode.x;
    let leftLimit = 8;
    if (desktop) { const head = rel($('.hero__head'), 1, 0.5); leftLimit = head.x + 16; }
    const rx = Math.max(60, Math.min(por.w * 0.74, por.x - leftLimit, W - por.x - 8));
    const ry = Math.max(60, Math.min(por.h * 0.7, art.h / 2 - 6));
    let E, X, clean;
    if (desktop) {
      const bx = Math.min(W - 24, por.x + por.w / 2 + 30);
      E = { x: W + 30, y: por.y - por.h * 0.32 };
      X = { x: bx, y: art.y + art.h / 2 };
      clean = [E, { x: bx, y: E.y }, X];
    } else {
      E = { x: W + 30, y: art.y - art.h / 2 + 10 };
      X = { x: spineX, y: art.y + art.h / 2 };
      clean = [E, { x: spineX, y: E.y }, X];
    }
    const n = desktop ? 260 : 200;
    const tPts = T.tangle({ cx: por.x, cy: por.y, rx, ry, n, seed: 11, from: E, to: X, loops: 4.2 });
    const cRoute = T.route(clean, 22);
    const cPts = T.sampleRoute(cRoute, n);

    // spine: exit of the tangle → chapter nodes (→ method beats on desktop) → final button
    const anchors = [X];
    $$('[data-node], [data-via], [data-thread-end]').forEach(el => {
      if (el.hasAttribute('data-via') && !desktop) return;
      const isEnd = el.hasAttribute('data-thread-end');
      const p = rel(el, 0.5, isEnd ? 0 : 0.5);
      p.el = el;
      anchors.push(p);
    });
    const verts = [X];
    for (let i = 1; i < anchors.length; i++) {
      const a = verts[verts.length - 1], b = anchors[i];
      const dy = b.y - a.y;
      const bias = dy > 0 ? T.clamp((dy - 52) / dy, 0.15, 0.9) : 0.5;
      T.elbow(a, b, 'v', bias).slice(1).forEach(p => verts.push(p));
    }
    const spine = T.route(verts, 20);
    // key = scroll position that reaches each anchor; anchors on one row get
    // their own stretch of scroll so horizontal runs draw instead of jumping
    anchors.forEach((a, i) => {
      a.len = spine.lengthAtVertex(a);
      a.key = i ? Math.max(a.y, anchors[i - 1].key + 140) : a.y;
    });

    pSpine.setAttribute('d', spine.d);
    pGhost.setAttribute('d', spine.d);
    G = { tPts, cPts, cRoute, spine, anchors, heroH: hero.offsetHeight };
    lastP = -1;
    update();
  }

  function update() {
    if (!G) return;
    const sy = scrollY, vh = innerHeight;
    // read every measurement first, then write, so the browser lays out once per frame
    const mainTop = main.getBoundingClientRect().top + sy;
    const chapRects = chapters.map(c => c.el.getBoundingClientRect());
    const caseTops = cases.map(st => st.el.getBoundingClientRect().top);
    const docH = document.documentElement.scrollHeight;

    // untangle the hero
    const p = RM ? 0 : T.clamp(sy / (G.heroH * 0.6));
    if (Math.abs(p - lastP) > 0.001) {
      lastP = p;
      if (p >= 0.999) pTangle.setAttribute('d', G.cRoute.d);
      else {
        const pts = T.blend(G.tPts, G.cPts, p, 0.7);
        pTangle.setAttribute('d', T.smoothPath(pts, 1 - T.ease(p)));
      }
    }

    // draw the spine up to the reading line
    const A = G.anchors, total = G.spine.length;
    let L;
    if (RM) L = total;
    else {
      const target = sy - mainTop + vh * 0.62;
      if (target <= A[0].key) L = 0;
      else if (target >= A[A.length - 1].key) L = total;
      else {
        let k = 0;
        while (k < A.length - 2 && target > A[k + 1].key) k++;
        const f = T.clamp((target - A[k].key) / Math.max(1, A[k + 1].key - A[k].key));
        L = T.lerp(A[k].len, A[k + 1].len, f);
      }
    }
    pSpine.style.strokeDashoffset = String(1 - L / total);
    const tp = G.spine.at(L);
    tip.setAttribute('cx', tp.x.toFixed(1));
    tip.setAttribute('cy', tp.y.toFixed(1));
    svg.classList.toggle('is-live', !RM && L > 2 && L < total - 2);
    A.forEach(a => { if (a.el) a.el.classList.toggle('is-lit', L >= a.len - 2); });

    updateUpNext(sy, vh, chapRects, docH);
    scrubCases(caseTops, vh);
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; update(); });
  }
  let layoutQueued = false;
  function queueLayout() {
    if (layoutQueued) return;
    layoutQueued = true;
    requestAnimationFrame(() => { layoutQueued = false; layout(); });
  }

  /* ================= up next ================= */
  const chapters = C.chapters.map(c => ({ ...c, el: document.getElementById(c.id) })).filter(c => c.el);
  const upnext = $('#upnext'), upN = $('#upnext-n'), upT = $('#upnext-teaser'), upL = $('#upnext-link'), upF = $('#upnext-fill'), upB = $('#upnext-book');
  let curIdx = -1;
  function updateUpNext(sy, vh, rects, docH) {
    let idx = 0;
    for (let i = 0; i < chapters.length; i++) if (rects[i].top <= vh * 0.5) idx = i;
    const r = rects[idx];
    const f = T.clamp((vh * 0.5 - r.top) / Math.max(1, r.height));
    upF.style.transform = 'scaleX(' + f.toFixed(3) + ')';
    if (idx !== curIdx) {
      curIdx = idx;
      upN.textContent = String(idx + 1).padStart(2, '0');
      upT.textContent = chapters[idx].next;
      const nxt = chapters[idx + 1];
      upL.href = '#' + (nxt ? nxt.id : 'contact');
      upL.setAttribute('aria-label', 'Chapter ' + (idx + 1) + ' of ' + chapters.length + '. Up next: ' + chapters[idx].next);
      const book = idx >= 2;
      upnext.classList.toggle('has-book', book);
      upB.tabIndex = book ? 0 : -1;
    }
    const nearEnd = sy + vh > docH - 160;
    upnext.classList.toggle('is-on', sy > hero.offsetHeight * 0.35 && !nearEnd);
  }

  /* ================= diagrams ================= */
  const DIAGRAMS = {
    finance: {
      nodes: {
        b1: { x: 80, y: 60, a: 'Books · PC 1', b: 'Books · PC 1' },
        b2: { x: 80, y: 165, a: 'Books · PC 2', b: 'Books · PC 2' },
        b3: { x: 80, y: 270, a: 'Books · PC 3', b: 'Books · PC 3' },
        m: { x: 240, y: 165, a: 'Verified mirror', b: 'Excel v7 FINAL', hub: true },
        d: { x: 400, y: 60, a: 'Live dashboard', b: 'P&L by hand' },
        g: { x: 400, y: 165, a: 'GST recon', b: 'GST, by eye' },
        t: { x: 400, y: 270, a: 'Telegram bot', b: '“Send figures?”' }
      },
      edges: [['b1', 'm'], ['b2', 'm'], ['b3', 'm'], ['m', 'd'], ['m', 'g'], ['m', 't']]
    },
    billing: {
      nodes: {
        v: { x: 80, y: 60, a: 'Vendor', b: 'Vendor' },
        u: { x: 240, y: 60, a: 'One upload', b: 'Typed totals' },
        r: { x: 400, y: 60, a: 'Checked vs POS', b: 'Re-keyed Excel' },
        s: { x: 400, y: 165, a: 'Sign all, one PIN', b: 'Print, sign, scan' },
        h: { x: 240, y: 165, a: 'HQ approves once', b: 'Rejected, redo', hub: true },
        p: { x: 80, y: 165, a: 'Payment export', b: 'Chase payment' },
        f: { x: 80, y: 270, a: 'SLA deductions', b: 'Worked out later' }
      },
      edges: [['v', 'u'], ['u', 'r'], ['r', 's', 'b', 't'], ['s', 'h', 'l', 'r'], ['h', 'p', 'l', 'r'], ['p', 'f', 'b', 't']]
    },
    market: {
      nodes: {
        q: { x: 80, y: 60, a: 'Market blueprint', b: '100 open tabs' },
        e: { x: 80, y: 165, a: 'Economics model', b: 'Margins: unknown' },
        s: { x: 80, y: 270, a: 'Partner proposal', b: 'Who distributes?' },
        d: { x: 240, y: 165, a: 'Decision deck', b: 'No deck yet', hub: true },
        m: { x: 400, y: 165, a: 'UK meeting', b: 'Cold emails' }
      },
      edges: [['q', 'd'], ['e', 'd'], ['s', 'd'], ['d', 'm']]
    },
    erp: {
      nodes: {
        e1: { x: 80, y: 60, a: 'Entity A', b: 'Entity A sheets' },
        e2: { x: 80, y: 165, a: 'Entity B', b: 'Entity B sheets' },
        br: { x: 80, y: 270, a: 'State branches', b: 'Branch files' },
        c: { x: 240, y: 165, a: 'One ERP', b: 'Copy-paste', hub: true },
        py: { x: 400, y: 105, a: 'Rates as data', b: 'Hard-coded rates' },
        ap: { x: 400, y: 225, a: 'Tiered approvals', b: 'Approvals by email' }
      },
      edges: [['e1', 'c'], ['e2', 'c'], ['br', 'c'], ['c', 'py'], ['c', 'ap']]
    }
  };

  function port(n, side) {
    const w = n.w || 140, h = 44;
    if (side === 'r') return { x: n.x + w / 2, y: n.y };
    if (side === 'l') return { x: n.x - w / 2, y: n.y };
    if (side === 'b') return { x: n.x, y: n.y + h / 2 };
    return { x: n.x, y: n.y - h / 2 };
  }

  // Labels wrap onto two lines in compact (phone) diagrams so they can stay legible.
  function setLabel(textEl, str, compact) {
    textEl.textContent = '';
    if (!compact || str.length <= 12 || str.indexOf(' ') < 0) { textEl.textContent = str; return; }
    const mid = str.length / 2;
    let cut = -1;
    for (let i = 0; i < str.length; i++) if (str[i] === ' ' && (cut < 0 || Math.abs(i - mid) < Math.abs(cut - mid))) cut = i;
    [str.slice(0, cut), str.slice(cut + 1)].forEach((line, k) => {
      const ts = document.createElementNS(SVGNS, 'tspan');
      ts.setAttribute('x', 0);
      ts.setAttribute('dy', k ? '1.1em' : '-0.55em');
      ts.textContent = line;
      textEl.append(ts);
    });
  }

  function buildDiagram(svgEl, spec, seed) {
    // phones get a narrower canvas, so the same diagram renders with larger type
    const compact = innerWidth < 700;
    if (!svgEl.dataset.vb) svgEl.dataset.vb = svgEl.getAttribute('viewBox');
    const [, , vw0, vh] = svgEl.dataset.vb.split(' ').map(Number);
    const kx = compact ? 400 / 480 : 1;
    const vw = vw0 * kx;
    svgEl.setAttribute('viewBox', '0 0 ' + vw + ' ' + vh);
    svgEl.classList.toggle('is-compact', compact);
    const r = T.rng(seed);
    const N = 44;
    const nodes = {};
    for (const id in spec.nodes) {
      const n = spec.nodes[id];
      const x = n.x * kx;
      const bx = n.fade ? n.bx * kx : T.clamp(x + (r() - 0.5) * 130 * kx, 66, vw - 66);
      const by = n.fade ? n.by : T.clamp(n.y + (r() - 0.5) * 110, 30, vh - 30);
      nodes[id] = { ...n, x, w: compact ? 124 : (n.w || 140), bx, by, rot: (r() - 0.5) * 26 };
    }
    svgEl.textContent = '';
    const gE = document.createElementNS(SVGNS, 'g');
    const gN = document.createElementNS(SVGNS, 'g');
    svgEl.append(gE, gN);
    const edges = spec.edges.map(([a, b, sa = 'r', sb = 'l', fade], i) => {
      const A = nodes[a], B = nodes[b];
      const pa = port(A, sa), pb = port(B, sb);
      let verts;
      if (sa === 'l' && sb === 'l') { const xm = Math.min(pa.x, pb.x) - 18; verts = [pa, { x: xm, y: pa.y }, { x: xm, y: pb.y }, pb]; }
      else verts = T.elbow(pa, pb, (sa === 'b' || sa === 't') ? 'v' : 'h');
      const rt = T.route(verts, 12);
      const after = T.sampleRoute(rt, N);
      const from = { x: A.bx, y: A.by }, to = { x: B.bx, y: B.by };
      const before = T.tangle({
        cx: (from.x + to.x) / 2 + (r() - 0.5) * 60, cy: (from.y + to.y) / 2 + (r() - 0.5) * 50,
        rx: 40 + r() * 50, ry: 30 + r() * 40, n: N, seed: seed * 31 + i, from, to
      });
      const path = document.createElementNS(SVGNS, 'path');
      path.setAttribute('class', 'dg-edge');
      gE.append(path);
      return { path, before, after, rt, fade: fade || A.fade || B.fade };
    });
    for (const id in nodes) {
      const n = nodes[id];
      const g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('class', 'dg-node' + (n.hub ? ' is-hub' : ''));
      const rect = document.createElementNS(SVGNS, 'rect');
      rect.setAttribute('x', -n.w / 2); rect.setAttribute('y', -22);
      rect.setAttribute('width', n.w); rect.setAttribute('height', 44); rect.setAttribute('rx', 10);
      const tb = document.createElementNS(SVGNS, 'text'); tb.setAttribute('class', 'dg-before'); setLabel(tb, n.b, compact);
      const ta = document.createElementNS(SVGNS, 'text'); setLabel(ta, n.a, compact);
      g.append(rect, tb, ta);
      gN.append(g);
      n.g = g; n.rect = rect; n.tb = tb; n.ta = ta;
    }
    let flow = [];
    function render(t) {
      const s = T.clamp((t - 0.35) / 0.3);
      for (const id in nodes) {
        const n = nodes[id], e = T.ease(t);
        const x = T.lerp(n.bx, n.x, e), y = T.lerp(n.by, n.y, e), rot = T.lerp(n.rot, 0, e);
        n.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot.toFixed(1) + ')');
        n.rect.style.strokeDasharray = t < 0.6 ? '5 4' : 'none';
        n.tb.style.opacity = n.a === n.b ? 0 : 1 - s;
        n.ta.style.opacity = n.a === n.b ? 1 : s;
        n.g.style.opacity = n.fade ? 1 - s : 1;
      }
      edges.forEach(ed => {
        if (t >= 0.999) ed.path.setAttribute('d', ed.rt.d);
        else ed.path.setAttribute('d', T.smoothPath(T.blend(ed.before, ed.after, t, 0.35), 1 - T.ease(t)));
        ed.path.style.opacity = ed.fade ? 1 - s : 1;
      });
      // once clean, a dot runs along each wire: the system working
      const done = t >= 0.999;
      if (done && !flow.length && !RM) {
        flow = edges.filter(ed => !ed.fade).map((ed, i) => {
          const c = document.createElementNS(SVGNS, 'circle');
          c.setAttribute('r', 3.5); c.setAttribute('class', 'dg-dot');
          const am = document.createElementNS(SVGNS, 'animateMotion');
          am.setAttribute('dur', (2 + (i % 3) * 0.4) + 's');
          am.setAttribute('repeatCount', 'indefinite');
          am.setAttribute('path', ed.rt.d);
          am.setAttribute('begin', (i * 0.25) + 's');
          c.append(am);
          gE.append(c);
          return c;
        });
      } else if (!done && flow.length) { flow.forEach(c => c.remove()); flow = []; }
    }
    return { render, compact };
  }

  // case files: scroll scrubs the diagram until the visitor takes the slider
  const cases = $$('.case').map((el, i) => {
    const svgEl = $('svg[data-diagram]', el);
    const build = () => buildDiagram(svgEl, DIAGRAMS[svgEl.dataset.diagram], 101 + i * 17);
    const input = $('input[type=range]', el);
    const st = { el, d: build(), build, input, manual: false, t: -1 };
    input.addEventListener('input', () => { st.manual = true; set(st, input.value / 100); });
    return st;
  });
  // rebuild diagrams when crossing the phone breakpoint
  function refitDiagrams() {
    const compact = innerWidth < 700;
    cases.forEach(st => {
      if (st.d.compact === compact) return;
      const t = st.t;
      st.d = st.build();
      st.t = -1;
      set(st, Math.max(0, t));
    });
    if (reportDiagram && reportDiagram.compact !== compact && !report.hidden) { reportDiagram = reportDiagram.rebuild(); reportDiagram.render(1); }
  }
  function set(st, t) {
    if (Math.abs(t - st.t) < 0.002) return;
    st.t = t;
    st.d.render(t);
    if (!st.manual) st.input.value = Math.round(t * 100);
  }
  function scrubCases(tops, vh) {
    cases.forEach((st, i) => {
      if (st.manual) return;
      if (RM) return set(st, 1);
      // 0 when the card's top enters the lower viewport, 1 by the time it reaches the upper third
      set(st, T.clamp((vh * 0.9 - tops[i]) / (vh * 0.6)));
    });
  }

  /* ================= persona ================= */
  const casesBox = $('#cases');
  const originalOrder = $$('.case', casesBox).map(c => c.id);
  $$('.chip[data-persona]').forEach(btn => btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    $$('.chip[data-persona]').forEach(b => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', String(on));
    const key = on ? btn.dataset.persona : '';
    document.body.dataset.persona = key;
    const order = key ? C.personas[key].order : originalOrder;
    order.forEach(id => { const el = document.getElementById(id); if (el) casesBox.append(el); });
    $$('.case', casesBox).forEach((el, i) => { $('.case__no', el).firstChild.textContent = $('.case__no', el).firstChild.textContent.replace(/Case \d+/, 'Case 0' + (i + 1)); });
    $('#persona-note').textContent = key ? C.personas[key].note : '';
    if (key === 'export') { const r = $('input[name=situation][value=export]'); if (r && !$('input[name=situation]:checked')) r.checked = true; }
    cases.forEach(st => { st.t = -1; });
    update();
  }));

  /* ================= Leak Audit ================= */
  const quiz = $('#quiz'), qs = $$('.q', quiz), report = $('#report');
  const back = $('#quiz-back'), next = $('#quiz-next'), err = $('#quiz-err');
  let step = 0;
  function show(i) {
    step = i;
    qs.forEach((q, k) => q.classList.toggle('is-on', k === i));
    back.hidden = i === 0;
    next.textContent = i === qs.length - 1 ? 'Show my Leak Report' : 'Next';
    $('#quiz-count').textContent = 'Question ' + (i + 1) + ' of ' + qs.length;
    $('#quiz-bar').style.width = ((i + 1) / qs.length * 100) + '%';
    err.textContent = '';
  }
  function answered(i) { return !!$('input:checked', qs[i]); }
  quiz.addEventListener('change', e => {
    if (e.target.name === 'pile') {
      const boxes = $$('input[name=pile]', quiz), n = boxes.filter(b => b.checked).length;
      boxes.forEach(b => { if (!b.checked) b.disabled = n >= 2; });
    }
    err.textContent = '';
  });
  quiz.addEventListener('submit', e => {
    e.preventDefault();
    if (!answered(step)) { err.textContent = 'Pick an answer to continue.'; return; }
    if (step < qs.length - 1) { show(step + 1); const f = $('input:not(:disabled)', qs[step]); if (f) f.focus(); }
    else buildReport();
  });
  back.addEventListener('click', () => { if (step > 0) show(step - 1); });

  const LABEL = el => el.closest('label').querySelector('span').textContent;
  let reportDiagram = null;
  function buildReport() {
    const A = C.audit;
    const sitEl = $('input[name=situation]:checked', quiz), sit = sitEl.value;
    const pileEls = $$('input[name=pile]:checked', quiz), piles = pileEls.map(p => p.value);
    const peopleEl = $('input[name=people]:checked', quiz), redoEl = $('input[name=redo]:checked', quiz);
    const people = A.people[peopleEl.value], cycles = A.redo[redoEl.value];

    const keys = piles.slice(0, 2);
    if (keys.length < 2) {
      const extra = (redoEl.value === 'weekly' || redoEl.value === 'constantly') ? 'rework' : A.fallback[sit];
      keys.push(keys.includes(extra) ? (extra === 'reporting' ? 'rework' : 'reporting') : extra);
    }
    const leaks = keys.map(k => A.leaks[k]);
    $('#report-leaks').innerHTML = leaks.map(l => '<li><span class="kind">' + l.kind + '</span><strong>' + l.name + '</strong><p>' + l.line + '</p></li>').join('');

    const touches = people * 2;
    let shape = 'One transaction likely passes through about <strong>' + touches + ' manual touches</strong>: around ' + people + ' people, each receiving, checking and passing it on. ';
    shape += cycles === 0
      ? 'It rarely breaks, so your leak is mostly the touches themselves. '
      : 'It gets redone ' + redoEl.value + ', so expect roughly <strong>' + (cycles >= 15 ? '15 or more' : cycles) + ' rework cycle' + (cycles === 1 ? '' : 's') + ' a month</strong>, each repeating some of those touches. ';
    shape += 'An untangled version needs about 3: one input, one automatic check, one sign-off. That is the shape of the government billing flow in my case files.';
    $('#report-shape').innerHTML = shape;
    $('#report-how').textContent = 'How this was worked out: touches ≈ people × 2 (one to receive and check, one to pass on), using the middle of your range. Rework cycles per month come from your answer (rarely 0, monthly 1, weekly 4, constantly 15+). Indicative only. A real audit counts them.';

    const process = ['entry', 'recon', 'approvals'];
    let offer = 'platform';
    if (piles.includes('followups') && (sit === 'export' || piles.length === 1)) offer = 'strategy';
    else if (sit === 'export' && !piles.some(p => process.includes(p))) offer = 'strategy';
    else if (piles.includes('reporting') && piles.includes('followups')) offer = 'retainer';
    $('#report-offer').textContent = A.offers[offer].name;
    $('#report-why').textContent = A.offers[offer].why;

    const summary = [
      'Hi Swapnil, I took the Leak Audit on askswapnil.github.io.',
      'Business: ' + LABEL(sitEl),
      'Work piles up in: ' + pileEls.map(LABEL).join(', '),
      'People per transaction: ' + LABEL(peopleEl),
      'Redone: ' + LABEL(redoEl),
      'Top leaks: ' + leaks.map(l => l.name).join(', '),
      'Suggested start: ' + A.offers[offer].name,
      'Can we talk?'
    ].join('\n');
    report.dataset.summary = summary;
    $('#report-mail').dataset.message = summary;
    wireLinks();

    // mini diagram: the people in the chain collapse into three clean steps
    const shown = Math.max(3, Math.min(people, 6));
    const nodes = {
      a: { x: 80, y: 100, a: 'One input' },
      b: { x: 240, y: 100, a: 'Auto-check', hub: true },
      c: { x: 400, y: 100, a: 'One sign-off' }
    };
    const order = ['a'];
    for (let i = 0; i < shown - 3; i++) {
      nodes['x' + i] = { x: 240, y: 100, bx: 130 + i * 110, by: i % 2 ? 160 : 40, a: '', fade: true };
      order.push('x' + i);
    }
    order.push('b', 'c');
    order.forEach((id, i) => { nodes[id].b = 'Person ' + (i + 1); });
    const edges = [];
    for (let i = 0; i < order.length - 1; i++) edges.push([order[i], order[i + 1], 'r', 'l', !!(nodes[order[i]].fade || nodes[order[i + 1]].fade)]);
    if (shown > 3) edges.push(['a', 'b', 'r', 'l', false]);
    const rebuild = () => Object.assign(buildDiagram($('#report-diagram'), { nodes, edges }, 7 + people), { rebuild });
    reportDiagram = rebuild();

    quiz.hidden = true;
    report.hidden = false;
    report.focus({ preventScroll: true });
    report.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
    if (RM) reportDiagram.render(1);
    else {
      const t0 = performance.now() + 500;
      reportDiagram.render(0);
      const step = now => {
        const t = T.clamp((now - t0) / 1600);
        reportDiagram.render(t);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }
  $('#report-book').addEventListener('click', () => {
    const s = report.dataset.summary;
    if (s && navigator.clipboard) navigator.clipboard.writeText(s).then(() => {
      if (!$('#report-book').classList.contains('is-placeholder')) toast('Your report is copied. Paste it into the booking notes.');
    }).catch(() => {});
  });
  $('#report-restart').addEventListener('click', () => {
    quiz.reset();
    $$('input[name=pile]', quiz).forEach(b => { b.disabled = false; });
    report.hidden = true;
    quiz.hidden = false;
    show(0);
    $('input', qs[0]).focus();
  });
  show(0);

  /* ================= in-view: counters, reveals, routes ================= */
  function countUp(el) {
    const to = +el.dataset.to, from = el.dataset.from !== undefined ? +el.dataset.from : 0;
    if (RM || from === to) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = now => {
      const t = T.clamp((now - t0) / dur);
      el.textContent = Math.round(T.lerp(from, to, T.easeOut(t)));
      if (t < 1) requestAnimationFrame(tick);
    };
    el.textContent = from;
    requestAnimationFrame(tick);
  }
  $$('.leak, .case, .beat, .offer, .venture, .auditbox, .operator__story').forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    el.classList.add('is-in');
    if (el.classList.contains('leak')) $$('.count', el).forEach(countUp);
    io.unobserve(el);
  }), { rootMargin: '0px 0px -12% 0px' });
  $$('.reveal, .routes').forEach(el => io.observe(el));

  /* ================= cursor thread + magnetic buttons ================= */
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  if (fine.matches) {
    const cur = $('#cursor'), trail = $('#cursor-trail'), dot = $('#cursor-dot');
    const pts = [];
    let mx = -100, my = -100, raf = 0, idle = 0;
    function loop() {
      pts.unshift({ x: mx, y: my });
      if (pts.length > 16) pts.pop();
      trail.setAttribute('points', pts.map(p => p.x.toFixed(0) + ',' + p.y.toFixed(0)).join(' '));
      dot.setAttribute('cx', mx); dot.setAttribute('cy', my);
      idle++;
      raf = idle < 30 ? requestAnimationFrame(loop) : 0;
    }
    addEventListener('pointermove', e => {
      if (RM || e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY; idle = 0;
      cur.classList.add('is-on');
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.remove('is-on'));

    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        if (RM) return;
        const r = b.getBoundingClientRect();
        b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px');
        b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
  }

  /* ================= boot ================= */
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { refitDiagrams(); queueLayout(); });
  if ('ResizeObserver' in window) new ResizeObserver(queueLayout).observe(main);
  if (document.fonts) document.fonts.ready.then(queueLayout);
  mqRM.addEventListener('change', e => { RM = forceRM || e.matches; cases.forEach(st => { st.t = -1; }); layout(); });

  layout();
  // the opening: the tangle draws itself once
  requestAnimationFrame(() => requestAnimationFrame(() => svg.classList.add('is-drawn')));
})();
