/* The sketches that take the visitor's company name. Pure HTML and CSS, no images.
   Every word comes from content.js (SM_CONTENT.mock). Numbers are invented. */
window.SM_MOCKS = function (C, esc, rich) {
  'use strict';
  var M = C.mock;

  /* money in the visitor's own currency (guessed from the browser language) */
  var cur = (function () {
    var loc = (navigator.languages && navigator.languages[0]) || navigator.language || 'en-US', region = (loc.split('-')[1] || '').toUpperCase();
    try { region = new Intl.Locale(loc).maximize().region || region; } catch (e) { }
    var map = { US: 'USD', GB: 'GBP', IN: 'INR', AU: 'AUD', CA: 'CAD', NZ: 'NZD', SG: 'SGD', AE: 'AED', SA: 'SAR', ZA: 'ZAR', JP: 'JPY', CN: 'CNY', CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', BR: 'BRL', MX: 'MXN', NG: 'NGN', KE: 'KES', PK: 'PKR', BD: 'BDT', LK: 'LKR', NP: 'NPR', MY: 'MYR', ID: 'IDR', PH: 'PHP', TH: 'THB', VN: 'VND', KR: 'KRW', HK: 'HKD', TR: 'TRY', IL: 'ILS', EG: 'EGP', PL: 'PLN', CZ: 'CZK', HU: 'HUF', RO: 'RON', QA: 'QAR', KW: 'KWD', BH: 'BHD', OM: 'OMR' };
    var euro = 'AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK'.split(' ');
    return { loc: loc, code: map[region] || (euro.indexOf(region) > -1 ? 'EUR' : 'USD') };
  })();
  function money(n) {
    try { return new Intl.NumberFormat(cur.loc, { style: 'currency', currency: cur.code, maximumFractionDigits: 0 }).format(n); }
    catch (e) { return '$' + Number(n).toLocaleString('en-US'); }
  }
  var badge = '<span class="mono-badge" data-mono></span>';
  var dots = '<i class="m-dots"><b></b><b></b><b></b></i>';
  var tick = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var MAP = ['............................', '..####......##..#######.....', '.######....####.#########...', '..#####....###..########....', '...###......##...######.....', '....##.....####...###.......', '.....###...####....#........', '.....####...###........##...', '......###...##........####..', '......##..............###...'];
  function dotMap() {
    var s = '<svg class="m-map" viewBox="0 0 196 76" aria-hidden="true">', c = 6.8, r, q;
    for (r = 0; r < MAP.length; r++) for (q = 0; q < MAP[r].length; q++) if (MAP[r][q] === '#') s += '<circle cx="' + (6 + q * c).toFixed(1) + '" cy="' + (6 + r * c).toFixed(1) + '" r="1.9" class="land"/>';
    var home = [6 + 18 * c, 6 + 4 * c], to = [[6 + 12 * c, 6 + 2 * c], [6 + 4 * c, 6 + 2 * c], [6 + 23 * c, 6 + 8 * c]];
    to.forEach(function (d) { s += '<path class="route" d="M' + home[0] + ' ' + home[1] + 'Q' + (home[0] + d[0]) / 2 + ' ' + (Math.min(home[1], d[1]) - 18) + ' ' + d[0] + ' ' + d[1] + '"/><circle class="pin" cx="' + d[0] + '" cy="' + d[1] + '" r="3.6"/>'; });
    return s + '<circle class="home" cx="' + home[0] + '" cy="' + home[1] + '" r="4.4"/></svg>';
  }

  var T = {
    cards: function () {
      return '<div class="m-cards"><div class="m-card b"><span class="m-big" data-mono></span></div>' +
        '<div class="m-card f">' + badge + '<b class="m-fit" data-co></b><span>' + esc(M.cards.role) + '</span><small><span data-co-slug></span>.com</small></div></div>';
    },
    sign: function () {
      return '<div class="m-sign"><div class="m-fascia"><span class="m-letters m-fit" data-co-upper></span></div><div class="m-awning"></div>' +
        '<div class="m-shop"><div class="m-win">' + badge + '</div><div class="m-door"><span>' + esc(M.sign.open) + '</span></div><div class="m-win w2"><i></i><i></i><i></i></div></div><div class="m-pave"></div></div>';
    },
    web: function () {
      return '<div class="m-win-frame"><div class="m-bar">' + dots + '<span class="m-url"><span data-co-slug></span>.com</span></div>' +
        '<div class="m-web"><div class="m-nav">' + badge + '<b data-co-short></b><span>' + M.web.nav.map(esc).join('</span><span>') + '</span></div>' +
        '<div class="m-hero"><div><h5 class="m-fit">' + rich(M.web.head) + '</h5><p>' + esc(M.web.sub) + '</p><em>' + esc(M.web.btn) + '</em></div><div class="m-art"><i></i><i></i><i></i></div></div></div></div>';
    },
    social: function () {
      return '<div class="m-social"><div class="m-post a"><span class="m-big" data-mono></span><b>' + esc(M.social.a) + '</b></div>' +
        '<div class="m-post b"><q>' + esc(M.social.b) + '</q><b class="m-fit" data-co></b></div>' +
        '<div class="m-post c">' + badge + '<b>' + esc(M.social.c) + '</b></div><p class="m-handle">@<span data-co-slug></span></p></div>';
    },
    board: function () {
      var k = 0, counts = [3, 2, 2, 1];
      return '<div class="m-win-frame light"><div class="m-bar">' + dots + '<span class="m-title"><span data-co-short></span> · ' + esc(M.board.title) + '</span></div><div class="m-board">' +
        M.board.cols.map(function (c, i) {
          var s = '<div class="m-col"><h6>' + esc(c) + '<i>' + counts[i] + '</i></h6>';
          for (var j = 0; j < counts[i]; j++) { var card = M.board.cards[k++]; s += '<div class="m-lead' + (i === 3 ? ' won' : '') + '"><b>' + esc(card[0]) + '</b><span>' + (i === 3 ? tick : '') + esc(card[1]) + '</span></div>'; }
          return s + '</div>';
        }).join('') + '</div></div>';
    },
    catalogue: function () {
      return '<div class="m-cat"><div class="m-page back"></div><div class="m-page"><div class="m-band">' + badge + '<span>' + esc(M.catalogue.year) + '</span></div>' +
        '<b class="m-fit" data-co></b><span>' + esc(M.catalogue.line) + '</span><i></i><i></i><i></i></div></div>';
    },
    mail: function () {
      return '<div class="m-win-frame light"><div class="m-bar">' + dots + '<span class="m-title">' + esc(M.mail.title) + '</span></div><div class="m-mail">' +
        '<p class="m-row"><span>' + esc(M.mail.to) + '</span>' + esc(M.mail.toName) + '</p><p class="m-row subj">' + esc(M.mail.subject) + '</p>' +
        M.mail.body.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '<p class="m-signoff">' + rich(M.mail.sign) + '</p><em>' + tick + '</em></div></div>';
    },
    market: function () {
      return '<div class="m-market"><h5 class="m-fit">' + rich(M.market.head) + '</h5>' + dotMap() + '<ul>' + M.market.list.map(function (l) { return '<li>' + tick + esc(l) + '</li>'; }).join('') + '</ul></div>';
    },
    numbers: function () {
      var bars = [34, 42, 38, 51, 47, 58, 54, 66, 61, 72, 69, 84];
      return '<div class="m-win-frame dark"><div class="m-bar">' + dots + '<span class="m-title"><i class="m-live"></i><span data-co-short></span> · ' + esc(M.numbers.today) + '</span><span class="m-tag">' + esc(M.numbers.sample) + '</span></div><div class="m-nums">' +
        '<div class="m-tiles">' + M.numbers.tiles.map(function (t) { return '<div class="m-tile ' + t[2] + '"><span>' + esc(t[0]) + '</span><b>' + esc(money(t[1])) + '</b></div>'; }).join('') + '</div>' +
        '<div class="m-low"><div class="m-chart">' + bars.map(function (b, i) { return '<i style="height:' + b + '%"' + (i > 8 ? ' class="hot"' : '') + '></i>'; }).join('') + '</div>' +
        '<div class="m-owed"><h6>' + esc(M.numbers.owed) + '</h6>' + M.numbers.rows.map(function (r) { return '<p><span>' + esc(r[0]) + '</span><b>' + esc(money(r[1])) + '</b><i>' + esc(r[2]) + '</i></p>'; }).join('') + '</div></div></div></div>';
    },
    chat: function () {
      return '<div class="m-phone"><div class="m-phone-top">' + badge + '<b>' + rich(M.chat.name).replace('class="co"', '') + '</b></div><div class="m-chat">' +
        M.chat.lines.map(function (l) { return '<p class="' + l[0] + '">' + esc(l[1]).replace('{a}', esc(money(M.chat.cash))) + '</p>'; }).join('') + '</div></div>';
    },
    checks: function () {
      return '<div class="m-checks"><h5>' + esc(M.checks.title) + '</h5><ul>' +
        M.checks.ok.map(function (l) { return '<li class="ok"><i>' + tick + '</i>' + esc(l) + '</li>'; }).join('') +
        M.checks.warn.map(function (l) { return '<li class="warn"><i>!</i>' + esc(l) + '</li>'; }).join('') + '</ul></div>';
    },
    app: function () {
      return '<div class="m-win-frame light"><div class="m-bar">' + dots + '<span class="m-title"><span data-co-short></span></span></div><div class="m-app"><nav>' + badge +
        M.app.nav.map(function (n, i) { return '<span' + (i === 1 ? ' class="on"' : '') + '>' + esc(n) + '</span>'; }).join('') + '</nav><div class="m-queue"><h6>' + esc(M.app.wait) + '<i>' + M.app.items.length + '</i></h6>' +
        M.app.items.map(function (it) { return '<div class="m-ask"><p><b>' + esc(it[0]) + '</b><span>' + esc(it[1]) + '</span></p><em>' + esc(M.app.yes) + '</em><u>' + esc(M.app.no) + '</u></div>'; }).join('') + '</div></div></div>';
    },
    steps: function () {
      var d = ''; for (var i = 0; i < 15; i++) d += '<i></i>';
      return '<div class="m-steps"><p>' + esc(M.steps.before) + '</p><div class="m-15">' + d + '</div><p class="m-after">' + esc(M.steps.after) + '</p><div class="m-3">' +
        M.steps.three.map(function (s, i) { return '<span><b>' + (i + 1) + '</b>' + esc(s) + '</span>'; }).join('') + '</div></div>';
    },
    sheet: function () {
      var cells = ''; for (var i = 0; i < 20; i++) cells += '<i style="--n:' + i + '"></i>';
      return '<div class="m-sheet"><div class="m-pdfs"><b></b><b></b><b><u>PDF</u></b><span>' + esc(M.sheet.a) + '</span></div>' +
        '<svg class="m-arrow" viewBox="0 0 40 16" aria-hidden="true"><path d="M2 8h34M29 2l7 6-7 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '<div class="m-grid"><div>' + cells + '</div><span>' + esc(M.sheet.b) + '</span></div></div>';
    },
    helpers: function () {
      return '<div class="m-helpers"><div class="m-router">' + badge + '<span>' + esc(M.helpers.head) + '</span></div><svg viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true"><path d="M150 0V14M150 14H50V40M150 14V40M150 14H250V40"/></svg><div class="m-trio">' +
        M.helpers.list.map(function (h) { return '<div><i></i><b>' + esc(h[0]) + '</b><span>' + esc(h[1]) + '</span></div>'; }).join('') + '</div></div>';
    },
    cover: function () {
      return '<div class="m-cover"><div class="m-page back"></div><div class="m-page"><span class="m-kick">' + esc(M.cover.sub) + '</span><b class="m-fit" data-co></b><em>' + esc(M.cover.line) + '</em>' +
        '<svg viewBox="0 0 120 60" aria-hidden="true"><path class="sun" d="M80 60a26 26 0 0 1 52 0z" transform="translate(-28 0)"/><path d="M6 60V34h26v26M32 60V20h30v40M62 60V40h22v20" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M47 20V6l12 4-12 4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M0 60h120" stroke="currentColor" stroke-width="2.4"/></svg></div></div>';
    },
    road: function () {
      var pts = [[30, 150], [112, 104], [196, 62], [272, 22]];
      return '<div class="m-road"><svg viewBox="0 0 300 170" aria-hidden="true"><path class="way" d="M6 164C40 164 20 150 30 150S90 130 112 104 160 66 196 62 250 40 272 22"/>' +
        pts.map(function (p, i) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="9"/><text x="' + p[0] + '" y="' + (p[1] + 4) + '" text-anchor="middle">' + (i + 1) + '</text>'; }).join('') +
        '<path class="flag" d="M272 22V2l16 6-16 6"/></svg><ol>' + M.road.stops.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div>';
    }
  };

  function card(id) {
    var m = M[id], note = m.note ? '<p class="mk-note">' + esc(m.note) + '</p>' : '';
    return '<figure class="mk mk-' + id + '"><div class="mk-stage" aria-hidden="true">' + T[id]() + '</div><figcaption><b>' + esc(m.title) + '</b>' + note + '</figcaption></figure>';
  }
  return { card: card, money: money };
};
