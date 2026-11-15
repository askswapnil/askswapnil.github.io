/* Your company, built. Page logic. No dependencies, no network calls, no tracking. */
(function () {
  'use strict';
  var C = window.SM_CONTENT;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PAPER = '#F5EFE4', INK = '#1A1613';

  /* ---------- tiny helpers ---------- */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function get(path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, C); }
  // turns a content string into safe HTML: {co} = the company name, _x_ = italic accent
  function rich(str) {
    return esc(str == null ? '' : str)
      .replace(/\{co\}/g, '<span class="co" data-co></span>')
      .replace(/\{mono\}/g, '<span data-mono></span>')
      .replace(/_([^_]+)_/g, '<span class="co">$1</span>');
  }
  function graphemes(s) {
    if (window.Intl && Intl.Segmenter) { try { return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(s), function (x) { return x.segment; }); } catch (e) { } }
    return Array.from(s);
  }

  /* ---------- colour ---------- */
  function hexRgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function rgbHex(c) { return '#' + c.map(function (v) { return ('0' + Math.round(Math.max(0, Math.min(255, v))).toString(16)).slice(-2); }).join(''); }
  function lum(h) { var c = hexRgb(h).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function darken(h, f) { return rgbHex(hexRgb(h).map(function (v) { return v * f; })); }
  function lighten(h, f) { return rgbHex(hexRgb(h).map(function (v) { return v + (255 - v) * f; })); }
  var PALETTE = ['#FF4F1F', '#2F5BFF', '#0FA36B', '#FFB000', '#E0218A', '#7A4DFF', '#00A3A3', '#D92B2E', '#6DB52A', '#1E9BF0'].map(function (c) {
    // fill colour: nudge it darker (by a hair) until white or ink text on it passes WCAG AA 4.5:1
    var k = 1, c0 = c; while (Math.max(contrast(c, INK), contrast(c, '#FFFFFF')) < 4.5 && k > 0.8) { k -= 0.01; c = darken(c0, k).toUpperCase(); }
    // text colour: AA on the darkest light surface it sits on (the sales floor, #EADCC3), so also on paper and --paper-2
    var deep = c, f = 1; while (contrast(deep, '#EADCC3') < 4.6 && f > 0.3) { f -= 0.03; deep = darken(c, f); }
    var rgb = hexRgb(c), lite = c, g = 0; while (contrast(lite, '#211B17') < 4.8 && g < 0.9) { g += 0.04; lite = lighten(c, g); }
    return { c: c, on: contrast(c, INK) >= contrast(c, '#FFFFFF') ? INK : '#FFFFFF', deep: deep, lite: lite, soft: 'rgba(' + rgb.join(',') + ',.13)' };
  });

  /* ---------- the brand made from a name ---------- */
  var STOP = /^(the|and|of|for|a|an|&|\+|ltd\.?|limited|llc|l\.l\.c\.?|inc\.?|incorporated|co\.?|company|corp\.?|corporation|pvt\.?|private|gmbh|plc|llp|pty|s\.a\.?|b\.v\.?|ag|oy|ab|srl|sarl|group|holdings?)$/i;
  function cleanName(raw) {
    var s = String(raw == null ? '' : raw).replace(/[\u0000-\u001F\u007F​-‏‪-‮⁦-⁩]/g, ' ').replace(/\s+/g, ' ').trim();
    var g = graphemes(s);
    if (g.length <= 48) return s;
    // too long: cut at the last whole word, never mid-word
    var cut = g.slice(0, 48).join(''), sp = cut.lastIndexOf(' ');
    if (sp > 20) cut = cut.slice(0, sp);
    return cut.replace(/[\s&+,\-\/.:;|]+$/, '').trim();
  }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function makeBrand(raw, colourIndex) {
    var name = cleanName(raw) || C.sampleName, sample = !cleanName(raw);
    var words = name.split(/[\s\-_/.,|:;()]+/).filter(Boolean);
    var core = words.filter(function (w) { return !STOP.test(w); }); if (!core.length) core = words.length ? words : [name];
    // the monogram uses words with a letter or digit, so emoji and symbols never end up in it
    var lettered = core.filter(function (w) { return /[\p{L}\p{N}]/u.test(w); }); if (lettered.length) core = lettered;
    var first = function (w) { var g = graphemes(w.replace(/^[^\p{L}\p{N}]+/u, '')); return g.length ? g[0] : graphemes(w)[0] || ''; };
    var mono;
    if (core.length >= 2) mono = first(core[0]) + first(core[1]);
    else { var g = graphemes(core[0]); var cap = g.slice(1).filter(function (ch) { return /\p{Lu}/u.test(ch); })[0]; mono = first(core[0]) + (cap || ''); }
    mono = mono.toLocaleUpperCase();
    var short = core.join(' ');
    var slug = short.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '') || 'yourcompany';
    if (slug.length > 22) slug = slug.slice(0, 22);
    var idx = colourIndex == null ? hash(name.toLowerCase()) % PALETTE.length : colourIndex;
    return { name: name, short: short || name, monogram: mono || '•', slug: slug, sample: sample, colourIndex: idx, colour: PALETTE[idx] };
  }

  var brand = makeBrand('', 0), buildings = [], listeners = [];
  function onBrand(fn) { listeners.push(fn); }
  function paintBrand(root) {
    $$('[data-co]', root).forEach(function (el) { el.textContent = brand.name; });
    $$('[data-co-short]', root).forEach(function (el) { el.textContent = brand.short; });
    $$('[data-co-upper]', root).forEach(function (el) { el.textContent = brand.name.toLocaleUpperCase(); });
    $$('[data-mono]', root).forEach(function (el) { el.textContent = brand.monogram; el.classList.toggle('is-long', graphemes(brand.monogram).length > 1); });
    $$('[data-co-slug]', root).forEach(function (el) { el.textContent = brand.slug; });
  }
  function applyBrand(b) {
    brand = b;
    var st = document.documentElement.style;
    st.setProperty('--accent', b.colour.c); st.setProperty('--on-accent', b.colour.on); st.setProperty('--accent-deep', b.colour.deep); st.setProperty('--accent-soft', b.colour.soft); st.setProperty('--accent-lite', b.colour.lite);
    var len = graphemes(b.name).length;
    st.setProperty('--co-scale', len <= 9 ? 1 : len <= 14 ? 0.84 : len <= 22 ? 0.66 : len <= 32 ? 0.52 : 0.42);
    st.setProperty('--co-len', Math.max(7, len));
    paintBrand(document);
    buildings.forEach(function (x) { x.setBrand({ name: b.name, monogram: b.monogram }); });
    $$('#swatches button').forEach(function (btn, i) { btn.setAttribute('aria-pressed', i === b.colourIndex ? 'true' : 'false'); });
    listeners.forEach(function (fn) { fn(b); });
  }

  /* ---------- fill the page from content.js ---------- */
  function fillText(root) {
    $$('[data-t]', root).forEach(function (el) { var v = get(el.getAttribute('data-t')); if (v != null) el.innerHTML = rich(v); });
    $$('[data-href]', root).forEach(function (el) { var v = get(el.getAttribute('data-href')); if (v) el.setAttribute('href', /^https?:/.test(v) ? v : 'mailto:' + v); });
  }

  /* ---------- hero ---------- */
  function initHero() {
    var hero = $('#top'), stage = $('#heroStage'), host = $('#heroBuilding'), input = $('#askInput'), form = $('#askForm');
    var built = false, mqPhone = window.matchMedia('(max-width: 1023px)');
    var b = window.SMBuilding.create(host, {
      state: 'plan',
      onHover: function (id) { hot(id); },
      onPick: function (id) { if (built) goFloor(id); else input.focus(); }
    });
    buildings.push(b);
    function frame() { b.el.setAttribute('viewBox', mqPhone.matches ? '76 40 488 860' : '0 0 640 900'); }
    frame(); if (mqPhone.addEventListener) mqPhone.addEventListener('change', frame);

    // floor callouts
    var keys = $('#floorKeys');
    var Y = { roof: 177, work: 316, money: 460, sales: 604, ground: 748 };
    keys.innerHTML = C.floors.map(function (f, i) {
      return '<button type="button" class="floor-key" data-floor="' + f.id + '" style="--n:' + (4 - i) + ';top:' + (Y[f.id] / 9) + '%;left:' + (40 / 6.4) + '%"><span class="code">' + esc(f.code) + '</span><span>' + esc(f.short) + '</span>' +
        '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>';
    }).join('');
    function hot(id) { b.highlight(id); $$('.floor-key', keys).forEach(function (k) { k.classList.toggle('is-hot', k.getAttribute('data-floor') === id); }); }
    keys.addEventListener('pointerover', function (e) { var k = e.target.closest('.floor-key'); if (k) hot(k.getAttribute('data-floor')); });
    keys.addEventListener('pointerout', function () { hot(null); });
    keys.addEventListener('focusin', function (e) { var k = e.target.closest('.floor-key'); if (k) hot(k.getAttribute('data-floor')); });
    keys.addEventListener('focusout', function () { hot(null); });
    keys.addEventListener('click', function (e) { var k = e.target.closest('.floor-key'); if (k) goFloor(k.getAttribute('data-floor')); });
    function goFloor(id) { var t = document.getElementById('floor-' + id) || document.getElementById('floors'); if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }

    input.placeholder = C.hero.placeholder;
    input.addEventListener('input', function () {
      var v = cleanName(input.value);
      b.el.classList.toggle('has-name', !!v);
      b.setBrand({ name: v || 'Your name here', monogram: v ? makeBrand(v).monogram : '' });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = cleanName(input.value);
      if (!v) { $('#live').textContent = C.hero.empty; form.classList.remove('is-nudge'); void form.offsetWidth; form.classList.add('is-nudge'); input.focus(); return; }
      build(v);
    });
    $('#askSkip').addEventListener('click', function () { build(''); });
    $('#renameBtn').addEventListener('click', function () {
      built = false; hero.classList.remove('is-built'); document.body.classList.remove('is-built'); b.setState('plan');
      input.value = brand.sample ? '' : brand.name; b.el.classList.toggle('has-name', !!input.value);
      b.setBrand({ name: input.value || 'Your name here', monogram: '' }); input.focus(); input.select();
    });

    function build(name, quiet) {
      built = true;
      applyBrand(makeBrand(name));
      try { sessionStorage.setItem('sm.co', brand.sample ? '' : brand.name); sessionStorage.setItem('sm.built', '1'); } catch (e) { }
      hero.classList.add('is-built'); document.body.classList.add('is-built');
      b.setState('built');
      if (!quiet) {
        input.blur();
        $('#live').textContent = C.hero.announce.replace('{name}', brand.name);
        var t = $('#heroBuilt'); if (t) t.focus({ preventScroll: true });
      }
    }

    // look around with the pointer; on touch, the view drifts as you scroll
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (fine && !reduce) {
      hero.addEventListener('pointermove', function (e) {
        var r = stage.getBoundingClientRect();
        b.look((e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.5), (e.clientY - window.innerHeight * 0.5) / (window.innerHeight * 0.6));
        var p = b.toSvg(e.clientX, e.clientY); b.torch(p[0], p[1], true);
      });
      hero.addEventListener('pointerleave', function () { b.look(0, 0); b.torch(320, 400, false); });
    } else if (!reduce) {
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () {
          ticking = false; var r = stage.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight) return;
          var mid = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight; b.look(mid * 0.5, -mid * 1.1);
        });
      }, { passive: true });
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { b.el.classList.toggle('is-paused', !en[0].isIntersecting); }).observe(host);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { b.refit(); });

    // swatches
    var sw = $('#swatches');
    sw.innerHTML = PALETTE.map(function (p, i) { return '<button type="button" aria-label="Colour ' + (i + 1) + '" aria-pressed="false" style="--c:' + p.c + '"><i></i></button>'; }).join('');
    sw.addEventListener('click', function (e) { var btn = e.target.closest('button'); if (!btn) return; applyBrand(makeBrand(brand.sample ? '' : brand.name, $$('button', sw).indexOf(btn))); });

    // arrive already built: a shared link (?for=Name) or a reload in the same tab
    var preset = null;
    try { preset = new URLSearchParams(location.search).get('for'); } catch (e) { }
    if (preset && cleanName(preset)) build(preset, true);
    else { try { if (sessionStorage.getItem('sm.built')) build(sessionStorage.getItem('sm.co') || '', true); } catch (e) { } }
    if (!built) { b.setBrand({ name: 'Your name here', monogram: '' }); if (fine && window.innerWidth >= 1024) setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) { } }, 300); }
    return { build: build, building: b };
  }

  /* ---------- header ---------- */
  function initHead() {
    var head = $('#head');
    var set = function () { head.classList.toggle('is-stuck', window.scrollY > 12); };
    set(); window.addEventListener('scroll', set, { passive: true });
  }

  fillText(document);
  applyBrand(brand);
  initHead();
  window.SM = { hero: initHero(), makeBrand: makeBrand, applyBrand: applyBrand, onBrand: onBrand, paintBrand: paintBrand, fillText: fillText, rich: rich, esc: esc, get: get, buildings: buildings, brand: function () { return brand; }, PALETTE: PALETTE, cleanName: cleanName, reduce: reduce };
})();
