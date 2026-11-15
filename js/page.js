/* Everything below the hero: floors, picks, the one-page plan, reels, timeline, the first-look form, the closing. */
(function () {
  'use strict';
  var C = window.SM_CONTENT, SM = window.SM;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = SM.esc, rich = SM.rich, reduce = SM.reduce;
  var mocks = window.SM_MOCKS(C, esc, rich);
  var byId = {}; C.floors.forEach(function (f) { byId[f.id] = f; });
  var ORDER = C.floors.map(function (f) { return f.id; }); // ground first
  var picks = [];
  var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var slowNet = (function () { var n = navigator.connection; return !!(n && (n.saveData || /(^|-)2g$/.test(n.effectiveType || ''))); })();
  var playVideo = !reduce && !slowNet;

  /* ---------------- floors ---------------- */
  var swipe = '<span class="swipe mono" aria-hidden="true">' + esc(C.floorsIntro.swipe) + arrow + '</span>';
  function shot(s, p) {
    var cls = 'shot ' + s.frame, ar = ' style="--ar:' + (s.w / (s.h + (s.frame === 'browser' ? s.w * 0.03 : 0))).toFixed(3) + '"', chrome = s.frame === 'browser' ? '<span class="chrome" aria-hidden="true"><i></i><i></i><i></i></span>' : '';
    if (s.reel) return '<div class="' + cls + '"' + ar + '>' + chrome + '<video class="reel-v" muted loop playsinline preload="none" width="' + s.w + '" height="' + s.h + '" poster="assets/reels/' + s.reel + '.webp" data-src="assets/reels/' + s.reel + '.mp4" aria-label="' + esc(s.alt) + '"></video></div>';
    var src = 'assets/work/' + s.src + '.webp';
    // images wider than 700px also have a 640px copy (name-640.webp) for phones; the lightbox always opens the full file
    var set = s.w > 700 ? ' srcset="assets/work/' + s.src + '-640.webp 640w, ' + src + ' ' + s.w + 'w" sizes="auto, (max-width: 1023px) 340px, 50vw"' : '';
    return '<button type="button" class="' + cls + '"' + ar + ' data-zoom="' + src + '" data-cap="' + esc(p.name) + '" aria-label="' + esc(C.floorsIntro.zoom) + ': ' + esc(s.alt) + '">' + chrome +
      '<img loading="lazy" decoding="async" width="' + s.w + '" height="' + s.h + '"' + set + ' src="' + src + '" alt="' + esc(s.alt) + '"></button>';
  }
  function proj(p) {
    return '<article class="proj"><header><h5>' + esc(p.name) + '</h5><p>' + esc(p.what) + '</p></header><div class="rail shots">' + p.shots.map(function (s) { return shot(s, p); }).join('') + '</div></article>';
  }
  function floorHTML(f) {
    return '<section class="floor' + (f.id === 'money' ? ' on-night' : '') + '" id="floor-' + f.id + '" data-floor="' + f.id + '" aria-labelledby="ft-' + f.id + '"><div class="floor-in">' +
      '<header class="floor-head"><p class="floor-id"><span class="lift-btn big" aria-hidden="true">' + esc(f.code) + '</span><span class="mono">' + esc(f.name) + '</span></p>' +
      '<h3 id="ft-' + f.id + '">' + esc(f.title) + '</h3><p class="floor-pain">' + esc(f.pain) + '</p><p class="floor-promise">' + esc(f.promise) + '</p>' +
      '<ul class="floor-get">' + f.get.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul>' +
      (f.cv ? '<p class="floor-cv">' + esc(f.cv) + '</p>' : '') +
      '<button type="button" class="pick" data-pick="' + f.id + '" aria-pressed="false"><span class="lift-btn" aria-hidden="true">' + esc(f.code) + '</span><span class="pick-label">' + esc(C.floorsIntro.pick) + '</span></button></header>' +
      '<div class="floor-body"><div class="rail-head"><h4>' + rich(C.floorsIntro.madeFor) + '</h4><p>' + esc(C.floorsIntro.madeNote) + '</p>' + swipe + '</div>' +
      '<div class="rail mocks n' + f.mocks.length + '">' + f.mocks.map(mocks.card).join('') + '</div>' +
      (f.builtNote ? '<aside class="built-note"><b>' + esc(f.builtNote.name) + '</b><p>' + esc(f.builtNote.what) + '</p></aside>' : '') +
      (f.work.length ? '<div class="rail-head real"><h4>' + esc(C.floorsIntro.real) + '</h4>' + swipe + '</div>' + f.work.map(proj).join('') : '') +
      '</div></div></section>';
  }
  $('#floorList').innerHTML = C.floors.map(floorHTML).join('');

  /* ---------------- picking floors (the lift buttons) ---------------- */
  function liftButtons(host, mode) { // mode: 'toggle' (plan) or 'go' (dock)
    host.innerHTML = ORDER.map(function (id) {
      var f = byId[id];
      // the spoken name starts with the visible code (G, 1, 2, 3, R), so voice-control users can say what they see
      var label = esc(f.code + ', ' + f.name + ': ' + f.title);
      return mode === 'go'
        ? '<a class="lift-btn" href="#floor-' + id + '" data-go="' + id + '" aria-label="' + label + '">' + esc(f.code) + '</a>'
        : '<button type="button" class="lift-btn" data-pick="' + id + '" aria-pressed="false" aria-label="' + label + '" title="' + esc(f.title) + '">' + esc(f.code) + '</button>';
    }).join('');
  }
  liftButtons($('#dockLift'), 'go'); liftButtons($('#planLift'), 'toggle');

  function syncPicks() {
    $$('[data-pick]').forEach(function (b) {
      var on = picks.indexOf(b.getAttribute('data-pick')) > -1; b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var l = $('.pick-label', b); if (l) l.textContent = on ? C.floorsIntro.picked : C.floorsIntro.pick;
    });
    $$('[data-go]').forEach(function (a) { a.classList.toggle('is-picked', picks.indexOf(a.getAttribute('data-go')) > -1); });
    SM.buildings.forEach(function (b) { b.setPicked(picks); });
    var n = picks.length;
    $('#dockPlan').innerHTML = esc(C.dock.plan) + (n ? ' · ' + n + ' ' + esc(n === 1 ? C.dock.floor : C.dock.floors) : '') + arrow;
    $('#planEmpty').hidden = n > 0;
    try { sessionStorage.setItem('sm.picks', picks.join(',')); } catch (e) { }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-pick]'); if (!b) return;
    var id = b.getAttribute('data-pick'), i = picks.indexOf(id);
    if (i > -1) picks.splice(i, 1); else picks.push(id);
    syncPicks();
    if (!$('#paperWrap').hidden) makePlan(true);
  });
  try { (sessionStorage.getItem('sm.picks') || '').split(',').forEach(function (id) { if (byId[id]) picks.push(id); }); } catch (e) { }

  /* ---------------- dock: where you are in the building ---------------- */
  var dock = $('#dock');
  if ('IntersectionObserver' in window) {
    var inFloors = false, inPlan = false;
    var showDock = function () { var on = inFloors && !inPlan; dock.hidden = false; dock.classList.toggle('is-on', on); dock.setAttribute('aria-hidden', on ? 'false' : 'true'); $$('a', dock).forEach(function (a) { a.tabIndex = on ? 0 : -1; }); };
    new IntersectionObserver(function (en) { inFloors = en[0].isIntersecting; showDock(); }, { rootMargin: '-45% 0px -45% 0px' }).observe($('#floorList'));
    new IntersectionObserver(function (en) { inPlan = en[0].isIntersecting; showDock(); }, { rootMargin: '0px 0px -30% 0px' }).observe($('#plan'));
    var spy = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) $$('[data-go]').forEach(function (a) { a.classList.toggle('is-here', a.getAttribute('data-go') === x.target.getAttribute('data-floor')); }); });
    }, { rootMargin: '-50% 0px -50% 0px' });
    $$('.floor').forEach(function (f) { spy.observe(f); });
  }
  // phones and tablets: tuck the dock away while scrolling down (reading), bring it back on the way up
  (function () {
    var narrow = window.matchMedia('(max-width: 1023px)'), lastY = window.scrollY, ticking = false;
    function upd() {
      ticking = false; var y = window.scrollY, d = y - lastY;
      if (!narrow.matches) { dock.classList.remove('is-tucked'); lastY = y; return; }
      if (d > 6) dock.classList.add('is-tucked'); else if (d < -6) dock.classList.remove('is-tucked');
      if (Math.abs(d) > 6) lastY = y;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    // picking a floor shows the pill for a moment, so the visitor sees the count go up
    document.addEventListener('click', function (e) { if (e.target.closest('[data-pick]')) dock.classList.remove('is-tucked'); });
  })();

  /* ---------------- videos: load when near, pause when away ---------------- */
  function watchVideos(root) {
    var vids = $$('video[data-src]', root); if (!vids.length) return;
    if (!playVideo || !('IntersectionObserver' in window)) return; // posters only
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        var v = x.target;
        if (x.isIntersecting) { if (!v.src) v.src = v.getAttribute('data-src'); var p = v.play(); if (p && p.catch) p.catch(function () { }); }
        else if (!v.paused) v.pause();
      });
    }, { rootMargin: '120px 0px' });
    vids.forEach(function (v) { io.observe(v); });
  }

  /* ---------------- reels wall ---------------- */
  (function () {
    var wall = $('#reelWall'), wide = C.reels.wide;
    wall.innerHTML = C.reels.rows.map(function (row, r) {
      var tiles = row.concat(row).map(function (id) {
        var w = wide.indexOf(id) > -1;
        return '<div class="reel-tile' + (w ? ' wide' : '') + '"><video muted loop playsinline preload="none" width="' + (w ? 640 : 480) + '" height="' + (w ? 360 : 480) + '" poster="assets/reels/' + id + '.webp" data-src="assets/reels/' + id + '.mp4" tabindex="-1"></video></div>';
      }).join('');
      return '<div class="reel-row r' + r + '">' + tiles + '</div>';
    }).join('');
    if (reduce) return;
    var ticking = false, sec = $('#reels');
    var upd = function () {
      ticking = false; var r = sec.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
      wall.style.setProperty('--p', p.toFixed(4));
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  })();
  watchVideos(document);

  /* ---------------- the one-page plan ---------------- */
  var Q = C.plan.questions, answers = {}, step = 0;
  var quiz = $('#quiz'), paperWrap = $('#paperWrap'), paper = $('#paper');

  function renderStep(focus) {
    var q = Q[step], v = answers[q.id], body = '';
    if (q.type === 'text') body = '<input class="q-input" type="text" id="q-' + q.id + '" name="' + q.id + '" maxlength="140" autocomplete="off" placeholder="' + esc(q.ph || '') + '" value="' + esc(v || '') + '">';
    else body = '<div class="chips">' + q.options.map(function (o, i) {
      var label = o.label || o, on = q.type === 'many' ? (v || []).indexOf(label) > -1 : v === label;
      return '<label class="chip"><input type="' + (q.type === 'many' ? 'checkbox' : 'radio') + '" name="' + q.id + '" value="' + esc(label) + '"' + (on ? ' checked' : '') + '><span>' + esc(label) + '</span></label>';
    }).join('') + '</div>';
    var last = step === Q.length - 1;
    quiz.innerHTML = '<fieldset class="q"><legend><span class="q-count mono">' + (step + 1) + ' ' + esc(C.plan.of) + ' ' + Q.length + '</span><span class="q-text">' + rich(q.q) + '</span></legend>' +
      (q.hint ? '<p class="q-hint">' + esc(q.hint) + '</p>' : '') + body +
      '<div class="q-nav">' + (step > 0 ? '<button type="button" class="link" data-back>' + esc(C.plan.back) + '</button>' : '') +
      '<button type="submit" class="btn btn-ink">' + esc(last ? C.plan.make : C.plan.next) + arrow + '</button>' +
      '<button type="button" class="link" data-skip>' + esc(C.plan.skip) + '</button></div></fieldset>' +
      '<div class="q-dots" aria-hidden="true">' + Q.map(function (_, i) { return '<i class="' + (i < step ? 'done' : i === step ? 'now' : '') + '"></i>'; }).join('') + '</div>';
    SM.paintBrand(quiz);
    if (focus) { var el = $('input', quiz); if (el) el.focus({ preventScroll: true }); }
  }
  function readStep() {
    var q = Q[step];
    if (q.type === 'text') { var t = SM.cleanName($('input', quiz).value); answers[q.id] = t.slice(0, 140); }
    else if (q.type === 'one') { var c = $('input:checked', quiz); answers[q.id] = c ? c.value : ''; }
    else answers[q.id] = $$('input:checked', quiz).map(function (i) { return i.value; });
  }
  quiz.addEventListener('submit', function (e) { e.preventDefault(); readStep(); if (step < Q.length - 1) { step++; renderStep(true); } else makePlan(); });
  quiz.addEventListener('click', function (e) {
    if (e.target.closest('[data-back]')) { readStep(); step--; renderStep(true); }
    if (e.target.closest('[data-skip]')) { if (step < Q.length - 1) { step++; renderStep(true); } else makePlan(); }
  });

  function planData() {
    var score = { ground: 0, sales: 0, money: 0, work: 0, roof: 0 }, pileQ = Q.filter(function (q) { return q.id === 'pile'; })[0];
    (answers.pile || []).forEach(function (l) { pileQ.options.forEach(function (o) { if (o.label === l) for (var k in o.score) score[k] += o.score[k]; }); });
    var chosen = picks.slice(), suggested = false;
    if (!chosen.length) {
      suggested = true;
      chosen = ORDER.filter(function (k) { return score[k] > 0; }).sort(function (a, b) { return score[b] - score[a]; }).slice(0, 3);
      if (!chosen.length) chosen = ['ground', 'money'];
    }
    chosen.sort(function (a, b) { return (score[b] - score[a]) || (ORDER.indexOf(a) - ORDER.indexOf(b)); });
    var n = chosen.length, phases = [[chosen[0]], chosen.slice(1, n <= 3 ? 2 : 3), chosen.slice(n <= 3 ? 2 : 3)].filter(function (p) { return p.length; });
    return { chosen: chosen, phases: phases, suggested: suggested };
  }
  function makePlan(quiet) {
    var P = C.plan.paper, d = planData(), b = SM.brand();
    var val = function (k) { var v = answers[k]; if (Array.isArray(v)) v = v.join(', '); return v ? esc(v) : '<i>' + esc(P.none) + '</i>'; };
    var rows = [['does', P.does], ['buyers', P.buyers], ['pile', P.pile], ['people', P.people], ['hurts', P.hurts], ['country', P.country]]
      .map(function (r) { return '<div><dt>' + rich(r[1]) + '</dt><dd>' + val(r[0]) + '</dd></div>'; }).join('');
    var mini = '<svg class="paper-mini" viewBox="0 0 64 84" aria-hidden="true">' + ORDER.slice().reverse().map(function (id, i) {
      var on = d.chosen.indexOf(id) > -1; return '<rect x="' + (id === 'roof' ? 14 : 6) + '" y="' + (4 + i * 16) + '" width="' + (id === 'roof' ? 36 : 52) + '" height="13" rx="1.5" class="' + (on ? 'on' : '') + '"/><text x="32" y="' + (14 + i * 16) + '" text-anchor="middle" class="' + (on ? 'on' : '') + '">' + byId[id].code + '</text>';
    }).join('') + '</svg>';
    var phases = d.phases.map(function (ph, i) {
      return '<li><span class="ph mono">' + esc(P.phases[i]) + '</span><div>' + ph.map(function (id) { var f = byId[id]; return '<p><b><span class="code">' + esc(f.code) + '</span>' + esc(f.title) + '</b>' + esc(f.plan.step) + '</p>'; }).join('') + '</div></li>';
    }).join('');
    var gets = []; d.chosen.forEach(function (id) { byId[id].plan.get.forEach(function (g) { gets.push('<li>' + esc(g) + '</li>'); }); });
    var date = ''; try { date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { }
    paper.innerHTML = '<header class="paper-head"><div><p class="mono">' + esc(P.kicker) + '</p><h3><span class="co" data-co></span></h3><p class="paper-by">' + esc(P.by) + (date ? ' · ' + esc(date) : '') + '</p></div>' + mini + '</header>' +
      '<section><h4>' + esc(P.told) + '</h4><dl class="told">' + rows + '</dl></section>' +
      '<section><h4>' + esc(P.order) + '</h4>' + (d.suggested ? '<p class="paper-note">' + esc(P.suggested) + '</p>' : '') +
      '<ol class="phases"><li class="zero"><span class="ph mono">' + esc(P.zero) + '</span><div><p>' + rich(P.zeroText) + '</p></div></li>' + phases + '</ol><p class="paper-note">' + esc(P.why) + '</p></section>' +
      '<section><h4>' + esc(P.get) + '</h4><ul class="gets">' + gets.join('') + '</ul></section>' +
      '<footer><p>' + esc(P.honest) + '</p><p class="paper-foot mono">Swapnil Mishra · ' + esc(C.cred.short) + ' · ' + esc(C.links.email) + ' · ' + esc(P.foot) + '</p></footer>';
    SM.paintBrand(paper);
    // the email version
    var M = C.plan.mail, plain = function (s) { return s.replace(/\{co\}/g, b.name).replace(/_/g, ''); };
    var t = function (k) { var v = answers[k]; if (Array.isArray(v)) v = v.join(', '); return v || '-'; };
    var lines = [M.hello, M.intro, '', 'Company: ' + b.name, plain(P.does) + ' ' + t('does'), P.buyers + ' ' + t('buyers'), P.pile + ' ' + t('pile'), P.people + ' ' + t('people'), P.hurts + ' ' + t('hurts'), P.country + ' ' + t('country'), ''];
    d.phases.forEach(function (ph, i) { lines.push(P.phases[i] + ': ' + ph.map(function (id) { return byId[id].title; }).join(' + ')); });
    lines.push('', M.bye);
    $('#planSend').href = 'mailto:' + C.links.email + '?subject=' + encodeURIComponent(M.subject.replace('{name}', b.name)) + '&body=' + encodeURIComponent(lines.join('\n'));
    quiz.hidden = true; paperWrap.hidden = false; document.body.classList.add('has-plan');
    if (!quiet) { paper.focus({ preventScroll: true }); paperWrap.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  }
  $('#planPrint').addEventListener('click', function () { window.print(); });
  $('#planAgain').addEventListener('click', function () { paperWrap.hidden = true; quiz.hidden = false; document.body.classList.remove('has-plan'); step = 0; renderStep(true); });
  renderStep(false);

  /* ---------------- timeline ---------------- */
  (function () {
    var T = C.timeline, host = $('#tl'), max = T.max;
    var pos = function (d) { return ((d - 1) / (max - 1) * 100).toFixed(2); };
    host.innerHTML = '<div class="tl-top"><p class="tl-day"><span class="mono">' + esc(T.sliderLabel) + '</span><b id="tlDay">1</b></p><div class="tl-now" aria-live="polite"><h3 id="tlTitle"></h3><p id="tlText"></p></div></div>' +
      '<div class="tl-track"><input type="range" id="tlRange" min="1" max="' + max + '" value="1" step="1" aria-label="' + esc(T.sliderLabel) + '">' +
      '<div class="tl-marks">' + T.marks.map(function (m, i) { return '<button type="button" class="tl-mark" data-day="' + m.day + '" style="left:' + pos(m.day) + '%"><i></i><span class="mono">' + esc(T.sliderLabel) + ' ' + m.day + '</span></button>'; }).join('') + '</div></div>' +
      '<ul class="tl-things">' + T.things.map(function (t) { return '<li data-day="' + t.day + '"><span>' + esc(t.label) + '</span><em></em></li>'; }).join('') + '</ul>';
    var range = $('#tlRange'), dayEl = $('#tlDay'), title = $('#tlTitle'), text = $('#tlText'), cur = -1;
    function set(v) {
      v = Math.max(1, Math.min(max, Math.round(v))); range.value = v; dayEl.textContent = v;
      host.style.setProperty('--v', pos(v) + '%');
      var k = 0; T.marks.forEach(function (m, i) { if (v >= m.day) k = i; });
      if (k !== cur) { cur = k; title.textContent = T.marks[k].title; text.textContent = T.marks[k].text; }
      $$('.tl-mark', host).forEach(function (b, i) { b.classList.toggle('on', v >= T.marks[i].day); });
      $$('.tl-things li', host).forEach(function (li) { var on = v >= +li.getAttribute('data-day'); li.classList.toggle('sorted', on); $('em', li).textContent = on ? T.sorted : T.stuck; });
      range.setAttribute('aria-valuetext', T.sliderLabel + ' ' + v + ': ' + T.marks[k].title);
    }
    range.addEventListener('input', function () { touched = true; set(+range.value); });
    host.addEventListener('click', function (e) { var b = e.target.closest('.tl-mark'); if (b) { touched = true; glide(+b.getAttribute('data-day')); } });
    var touched = false, anim = 0;
    function glide(to) {
      if (reduce) return set(to);
      cancelAnimationFrame(anim); var from = +range.value, t0 = performance.now(), dur = 700;
      (function f(now) { var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); set(from + (to - from) * e); if (k < 1) anim = requestAnimationFrame(f); })(t0);
    }
    set(1);
    if (!reduce && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); if (!touched) setTimeout(function () { if (!touched) glide(T.marks[1] ? T.marks[1].day : max); }, 500); } }, { threshold: 0.5 });
      io.observe(host);
    }
  })();

  /* ---------------- don't hire me if ---------------- */
  $('#dontList').innerHTML = C.dont.items.map(function (it) { return '<li><b>' + esc(it[0]) + '</b><span>' + esc(it[1]) + '</span></li>'; }).join('');

  /* ---------------- the free first look ---------------- */
  (function () {
    var F = C.freeLook, n = F.slotsThisWeek, slots = $('#slots'), form = $('#lookForm');
    if (n === null || n === undefined) slots.textContent = F.limited;
    else if (n > 1) slots.textContent = F.left.replace('{n}', n);
    else if (n === 1) slots.textContent = F.leftOne;
    else { slots.textContent = F.full; slots.classList.add('full'); form.classList.add('is-full'); }
    $('#lfReach').placeholder = F.fields.reachPh;
    var company = $('#lfCompany'), touched = false;
    company.addEventListener('input', function () { touched = true; });
    SM.onBrand(function (b) { if (!touched) company.value = b.sample ? '' : b.name; });
    var b0 = SM.brand(); if (!b0.sample) company.value = b0.name;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = $('#lookError'), bad = null;
      $$('[required]', form).forEach(function (el) { var ok = !!el.value.trim(); el.setAttribute('aria-invalid', ok ? 'false' : 'true'); if (!ok && !bad) bad = el; });
      if (bad) { err.textContent = F.need; err.hidden = false; bad.focus(); return; }
      err.hidden = true;
      var v = function (id) { return $(id).value.trim().slice(0, 400); }, M = F.mail;
      var body = [M.hello, M.ask, '', F.fields.company + ': ' + v('#lfCompany'), M.problem + ' ' + v('#lfProblem'), M.reach + ' ' + v('#lfReach'), '', M.bye + ',', v('#lfName')].join('\n');
      location.href = 'mailto:' + C.links.email + '?subject=' + encodeURIComponent(M.subject.replace('{company}', v('#lfCompany'))) + '&body=' + encodeURIComponent(body);
    });
  })();

  /* ---------------- closing: the building at night ---------------- */
  (function () {
    var host = $('#closeBuilding'), sec = $('#close'), made = false;
    // the night building is drawn only when the visitor scrolls near it, so it costs nothing at page load
    // (its host keeps its size through aspect-ratio, so nothing moves when it appears)
    function make() {
      if (made) return; made = true;
      var b = window.SMBuilding.create(host, { state: 'built', onPick: function (id) { var t = document.getElementById('floor-' + id); if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); } });
      b.el.classList.add('is-night', 'is-paused'); b.el.setAttribute('viewBox', '60 30 520 870');
      SM.buildings.push(b);
      var br = SM.brand(); b.setBrand({ name: br.name, monogram: br.monogram }); b.setPicked(picks);
      if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { b.el.classList.toggle('is-paused', !en[0].isIntersecting); if (en[0].isIntersecting) b.refit(); }).observe(host);
      if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        sec.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); b.look((e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.5), (e.clientY - (r.top + r.height / 2)) / (window.innerHeight * 0.6)); });
        sec.addEventListener('pointerleave', function () { b.look(0, 0); });
      }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { b.refit(); });
    }
    if ('IntersectionObserver' in window) {
      var near = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { near.disconnect(); make(); } }, { rootMargin: '1500px 0px' });
      near.observe(host);
    } else make();
    window.addEventListener('beforeprint', make);
  })();

  /* ---------------- look closer (lightbox) ---------------- */
  (function () {
    var dlg = $('#zoom'); if (!dlg || !dlg.showModal) return;
    var img = $('img', dlg), cap = $('p', dlg);
    document.addEventListener('click', function (e) {
      var s = e.target.closest('[data-zoom]'); if (!s) return;
      var src = $('img', s); img.src = s.getAttribute('data-zoom'); img.alt = src ? src.alt : ''; img.width = src ? src.getAttribute('width') : ''; img.height = src ? src.getAttribute('height') : '';
      cap.textContent = s.getAttribute('data-cap') || ''; dlg.showModal();
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('.zoom-x')) dlg.close(); });
  })();

  /* ---------------- little touches: tab title, tab icon, name chip ---------------- */
  var baseTitle = document.title, icon = $('link[rel="icon"][type="image/svg+xml"]'), baseIcon = icon ? icon.href : '';
  var chip = document.createElement('a'); chip.className = 'you-chip'; chip.href = '#top'; chip.hidden = true;
  chip.innerHTML = '<span class="mono-badge" data-mono></span><span data-co></span>';
  $('.head-right').insertBefore(chip, $('.head-right').firstChild);
  function personal(b) {
    var built = document.body.classList.contains('is-built'), own = built && !b.sample;
    document.title = own ? b.name + ', built. Swapnil Mishra' : baseTitle;
    chip.hidden = !own; $('.cred').classList.toggle('is-off', own);
    $('#sampleNote').hidden = own;
    if (icon) {
      icon.href = own ? 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="' + b.colour.c + '"/><text x="32" y="43" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="' + (Array.from(b.monogram).length > 1 ? 28 : 36) + '" fill="' + b.colour.on + '">' + esc(b.monogram) + '</text></svg>') : baseIcon;
    }
  }
  SM.onBrand(personal);
  new MutationObserver(function () { personal(SM.brand()); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  $$('[data-aria]').forEach(function (el) { var v = SM.get(el.getAttribute('data-aria')); if (v) el.setAttribute('aria-label', v); });
  SM.paintBrand(document);
  syncPicks();
  personal(SM.brand());
})();
