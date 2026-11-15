/* The cutaway building. One SVG, drawn in code, with a tiny one-point-perspective
   engine so the rooms have real depth and shift as the visitor moves.
   No dependencies. Colours come from CSS variables (--accent, --on-accent). */
window.SMBuilding = (function () {
  'use strict';

  var VBW = 640, VBH = 900;
  var BX0 = 110, BX1 = 530, WALL = 12, RX0 = BX0 + WALL, RX1 = BX1 - WALL, RW = RX1 - RX0;
  var FH = 128, SLAB = 16, ROOF = 232, GROUND = 812;
  var K = 0.3, VBLEND = 0.34;
  var VP0 = { x: 320, y: 470 };

  var ROOMS = [
    { id: 'ground', code: 'G', y1: 812 },
    { id: 'sales', code: '1', y1: 668 },
    { id: 'money', code: '2', y1: 524 },
    { id: 'work', code: '3', y1: 380 }
  ];
  ROOMS.forEach(function (r) { r.y0 = r.y1 - FH; r.cy = (r.y0 + r.y1) / 2; r.h = FH; });
  var ROOFROOM = { id: 'roof', code: 'R', y1: ROOF, y0: ROOF - 180, cy: ROOF - 40, h: 180 };

  var uidCount = 0;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function r1(n) { return Math.round(n * 10) / 10; }

  /* ---------- sprites (local coordinates, origin at base centre, y up = negative) ---------- */

  function shadow(rx, ry, o) { return '<ellipse class="shadow" cx="0" cy="0" rx="' + rx + '" ry="' + (ry || 4) + '" opacity="' + (o || 0.2) + '"/>'; }

  function lamp() {
    return '<path class="glow cone" d="M-9 28h18l46 96h-110z" fill="url(#CONE)"/><circle class="glow" cx="0" cy="32" r="58" fill="url(#GLOW)"/>' +
      '<line x1="0" y1="0" x2="0" y2="18" class="si" stroke-width="1.2"/>' +
      '<path d="M-8 18h16l5 10h-26z" class="fi"/>' +
      '<ellipse class="bulb" cx="0" cy="28.5" rx="7" ry="2.4"/>';
  }
  function striplight() {
    return '<rect class="glow" x="-70" y="0" width="140" height="70" fill="url(#GLOWDOWN)"/>' +
      '<rect class="bulb" x="-46" y="1" width="92" height="3" rx="1.5"/>';
  }

  function plant(h) {
    h = h || 46;
    return shadow(15, 3.2) +
      '<path d="M-9 0l-3-16h24l-3 16z" fill="#B5754F"/><rect x="-13" y="-19" width="26" height="4" rx="1.5" fill="#9C6040"/>' +
      '<g fill="#66733F"><path d="M0-18c-3-14-12-20-18-22 2 10 6 18 18 22z"/><path d="M0-18c3-16 12-24 20-26-2 12-7 22-20 26z" fill="#7C8A4E"/>' +
      '<path d="M0-18c-1-18 0-30 2-' + h + ' 5 12 4 28-2 ' + h + 'z" fill="#56633A"/><path d="M0-18c-6-9-15-10-22-9 5 6 12 10 22 9z" fill="#7C8A4E"/></g>';
  }

  function counter() {
    return shadow(66, 5) +
      '<rect x="-56" y="-40" width="112" height="40" rx="1.5" fill="#5E4A3B"/>' +
      '<rect x="-56" y="-16" width="112" height="5" class="fa"/>' +
      '<rect x="-60" y="-46" width="120" height="7" rx="2.5" class="fi"/>' +
      '<circle cx="-22" cy="-28" r="8.5" class="fp"/><text class="mono-glyph fa" x="-22" y="-24.6" font-size="9.5" text-anchor="middle" data-mono></text>' +
      '<rect x="14" y="-61" width="24" height="15" rx="2" class="fi"/><rect x="17" y="-68" width="18" height="9" rx="1.5" class="fa"/>' +
      '<path d="M-46-46v-15h15v15z" class="fp"/><path d="M-42-61c0-7 7-7 7 0" fill="none" class="si" stroke-width="1.2"/><rect x="-46" y="-56" width="15" height="3" class="fa"/>';
  }

  function displayTable() {
    return shadow(40, 4) +
      '<rect x="-30" y="-20" width="3" height="20" class="fi"/><rect x="27" y="-20" width="3" height="20" class="fi"/>' +
      '<rect x="-36" y="-24" width="72" height="5" rx="2.5" class="fi"/>' +
      '<rect x="-27" y="-42" width="18" height="18" rx="1" class="fa"/><rect x="-24" y="-54" width="12" height="12" rx="1" class="fp"/>' +
      '<rect x="-6" y="-38" width="16" height="14" rx="1" fill="#E6D8BF"/><rect x="-6" y="-33" width="16" height="2.5" class="fi" opacity=".55"/>' +
      '<rect x="13" y="-48" width="14" height="24" rx="1" fill="#C4A484"/><rect x="13" y="-40" width="14" height="5" class="fa"/>';
  }

  function desk(flip) {
    return shadow(54, 4.5) +
      '<rect x="-44" y="-30" width="3" height="30" class="fi"/><rect x="41" y="-30" width="3" height="30" class="fi"/>' +
      '<rect x="' + (flip ? -41 : 19) + '" y="-30" width="22" height="15" fill="#6B5443"/><rect x="' + (flip ? -33 : 27) + '" y="-24" width="6" height="1.6" class="fp" opacity=".7"/>' +
      '<rect x="-48" y="-34" width="96" height="4.5" rx="1.5" class="fi"/>' +
      '<rect x="-9" y="-36.5" width="18" height="2.5" rx="1" class="fi"/><rect x="-2" y="-42" width="4" height="6" class="fi"/>' +
      '<rect x="-22" y="-68" width="44" height="27" rx="2.5" class="fi"/><rect x="-19" y="-65" width="38" height="21" rx="1" fill="#F7F0E2"/>' +
      '<rect x="-15" y="-52" width="5" height="6" class="fi" opacity=".35"/><rect x="-8" y="-56" width="5" height="10" class="fi" opacity=".35"/><rect x="-1" y="-54" width="5" height="8" class="fi" opacity=".35"/><rect x="6" y="-60" width="5" height="14" class="fa"/>' +
      '<rect x="' + (flip ? 30 : -38) + '" y="-41" width="7" height="7" rx="1" class="fa"/>';
  }

  function rack() {
    return shadow(22, 3) +
      '<rect x="-18" y="-58" width="2.5" height="58" class="fi"/><rect x="15.5" y="-58" width="2.5" height="58" class="fi"/>' +
      '<rect x="-18" y="-22" width="36" height="2.5" class="fi"/><rect x="-18" y="-44" width="36" height="2.5" class="fi"/>' +
      '<g transform="rotate(-6 -8 -22)"><rect x="-14" y="-41" width="12" height="17" class="fa"/><rect x="-12" y="-37" width="8" height="2" class="fo"/></g>' +
      '<g transform="rotate(-6 6 -22)"><rect x="1" y="-41" width="12" height="17" class="fp" stroke="#1A1613" stroke-width=".6"/><rect x="3" y="-37" width="8" height="2" class="fa"/></g>' +
      '<g transform="rotate(-6 -8 -44)"><rect x="-14" y="-63" width="12" height="17" fill="#C4A484"/><rect x="-12" y="-59" width="8" height="2" class="fi" opacity=".6"/></g>' +
      '<g transform="rotate(-6 6 -44)"><rect x="1" y="-63" width="12" height="17" class="fa"/><rect x="3" y="-59" width="8" height="2" class="fo"/></g>';
  }

  function suitcase() {
    return shadow(20, 3) +
      '<path d="M-6-25v-5h12v5" fill="none" class="si" stroke-width="2"/>' +
      '<rect x="-17" y="-25" width="34" height="25" rx="3.5" fill="#B5754F"/><rect x="-10" y="-25" width="3" height="25" fill="#7E4E33"/><rect x="7" y="-25" width="3" height="25" fill="#7E4E33"/>' +
      '<circle cx="-1" cy="-15" r="4.5" class="fa"/><rect x="-3" y="-8" width="8" height="5" rx="1" class="fp" transform="rotate(-10 1 -6)"/>';
  }

  function safe() {
    return shadow(26, 4, 0.5) +
      '<rect x="-21" y="-46" width="42" height="43" rx="3" fill="#5A4C41" stroke="#0F0C0A" stroke-width="1"/>' +
      '<rect x="-16" y="-41" width="32" height="33" rx="2" fill="#4A3E35"/>' +
      '<circle cx="-3" cy="-24.5" r="7.5" fill="none" stroke="#E9DFCD" stroke-width="1.6"/><circle cx="-3" cy="-24.5" r="1.8" fill="#E9DFCD"/>' +
      '<path d="M-3-32v3M-3-20v3M-10.5-24.5h3M1.5-24.5h3" stroke="#E9DFCD" stroke-width="1"/>' +
      '<rect x="9" y="-31" width="3" height="13" rx="1.5" class="fa"/>' +
      '<rect x="-17" y="-3" width="6" height="3" fill="#0F0C0A"/><rect x="11" y="-3" width="6" height="3" fill="#0F0C0A"/>';
  }

  function coins() {
    var s = shadow(32, 4, 0.5), xs = [-19, 0, 19], ns = [4, 8, 6];
    for (var i = 0; i < 3; i++) for (var j = 0; j < ns[i]; j++)
      s += '<ellipse cx="' + xs[i] + '" cy="' + (-2.6 - j * 3.1) + '" rx="8.6" ry="2.8" fill="' + (j === ns[i] - 1 ? '#F6D271' : '#E3B341') + '" stroke="#8A6516" stroke-width=".6"/>';
    return s;
  }

  function console_() {
    return shadow(48, 4, 0.5) +
      '<rect x="-40" y="-26" width="3" height="26" fill="#0F0C0A"/><rect x="37" y="-26" width="3" height="26" fill="#0F0C0A"/>' +
      '<rect x="-44" y="-30" width="88" height="4.5" rx="1.5" fill="#6B5443"/>' +
      '<path d="M-14-30l3-19h24l3 19z" fill="#0F0C0A"/><path d="M-9.5-32l2.2-14.5h16.6l2.2 14.5z" class="fa" opacity=".9"/>' +
      '<rect x="22" y="-37" width="9" height="7" rx="1" fill="#E9DFCD"/>';
  }

  function conveyor() {
    var id = 'CLIPBELT', s = shadow(168, 5.5);
    s += '<rect x="-150" y="-26" width="4" height="26" class="fi"/><rect x="-60" y="-26" width="4" height="26" class="fi"/><rect x="56" y="-26" width="4" height="26" class="fi"/><rect x="146" y="-26" width="4" height="26" class="fi"/>';
    s += '<rect x="-162" y="-35" width="324" height="11" rx="5.5" class="fi"/>';
    for (var x = -152; x <= 152; x += 19) s += '<circle cx="' + x + '" cy="-29.5" r="2.6" fill="#8C7B6A"/>';
    // messy papers going in (left), neat folders coming out (right)
    s += '<g clip-path="url(#' + id + 'L)">';
    for (var i = 0; i < 3; i++) s += '<g class="belt-in" style="animation-delay:' + (-i * 1.5) + 's"><g transform="rotate(' + [-14, 9, -6][i] + ' -150 -47)">' +
      '<rect x="-158" y="-58" width="16" height="21" rx="1" fill="#FBF6EC" stroke="#1A1613" stroke-width=".6"/><path d="M-155-53h10M-155-49h10M-155-45h6" stroke="#1A1613" stroke-width="1" opacity=".45"/></g></g>';
    s += '</g><g clip-path="url(#' + id + 'R)">';
    for (i = 0; i < 3; i++) s += '<g class="belt-out" style="animation-delay:' + (-i * 1.5) + 's">' +
      '<rect x="24" y="-51" width="20" height="16" rx="2" class="fa"/><path d="M29.5-43l3 3 6-7" fill="none" class="so" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>';
    s += '</g>';
    // the machine
    s += '<path d="M-14-94l-6-12h40l-6 12z" fill="#6B5443"/>' +
      '<rect x="-38" y="-94" width="76" height="64" rx="7" fill="#3A312A" stroke="#1A1613" stroke-width="1"/>' +
      '<rect x="-25" y="-82" width="50" height="20" rx="4" fill="#14110E"/>' +
      '<circle class="blip b1" cx="-12" cy="-72" r="3"/><circle class="blip b2" cx="0" cy="-72" r="3"/><circle class="blip b3" cx="12" cy="-72" r="3"/>' +
      '<rect x="-25" y="-54" width="22" height="4" rx="2" fill="#E9DFCD" opacity=".55"/><rect x="-25" y="-46" width="14" height="4" rx="2" fill="#E9DFCD" opacity=".3"/>' +
      '<circle cx="19" cy="-48" r="5.5" fill="none" stroke="#E9DFCD" stroke-width="1.4"/><path d="M19-48l3-3" stroke="#E9DFCD" stroke-width="1.4" stroke-linecap="round"/>';
    return s;
  }

  function outputStack() {
    var s = shadow(26, 3.5) + '<circle cx="-14" cy="-3" r="3" class="fi"/><circle cx="14" cy="-3" r="3" class="fi"/><rect x="-21" y="-9" width="42" height="3.5" rx="1" class="fi"/>';
    for (var i = 0; i < 4; i++) s += '<rect x="' + (-18 + (i % 2)) + '" y="' + (-21 - i * 12) + '" width="36" height="11" rx="1.5" fill="#EFE4CF" stroke="#1A1613" stroke-width=".7"/><rect x="' + (-18 + (i % 2)) + '" y="' + (-18 - i * 12) + '" width="36" height="3" class="fa"/>';
    return s;
  }

  function gear(cx, cy, r, teeth, cls) {
    var d = '', n = teeth * 2, i, a, rad;
    for (i = 0; i < n; i++) {
      rad = (i % 2 === 0) ? r : r * 0.8;
      a = (i / n) * Math.PI * 2; var a2 = ((i + 0.5) / n) * Math.PI * 2;
      d += (i ? 'L' : 'M') + r1(Math.cos(a) * rad) + ' ' + r1(Math.sin(a) * rad) + 'L' + r1(Math.cos(a2) * rad) + ' ' + r1(Math.sin(a2) * rad);
    }
    return '<g transform="translate(' + cx + ' ' + cy + ')"><g class="gear ' + cls + '"><path d="' + d + 'z" fill="#D9C7A6" stroke="#1A1613" stroke-width="1.2" stroke-linejoin="round"/><circle r="' + r1(r * 0.36) + '" fill="#EADFCB" stroke="#1A1613" stroke-width="1.2"/><circle r="' + r1(r * 0.1) + '" class="fi"/></g></g>';
  }

  /* ---------- back walls (local x 0..396, y -128..0) ---------- */

  function backGround() {
    var s = '', shelves = [-30, -62, -94], cols = ['#E6D8BF', '#C4A484', 'A', '#6B5443', '#FBF6EC', '#D6B58C'];
    var seq = [[14, 20, 0], [10, 14, 1], [16, 24, 2], [12, 16, 4], [18, 12, 3], [10, 22, 5], [14, 14, 0], [16, 18, 2], [12, 24, 1], [18, 16, 4], [10, 12, 3], [14, 20, 5]];
    for (var r = 0; r < 3; r++) {
      var x = 30, i = r * 3;
      while (x < 222) {
        var b = seq[i % seq.length], c = cols[(b[2] + r) % cols.length];
        s += '<rect x="' + x + '" y="' + (shelves[r] - b[1]) + '" width="' + b[0] + '" height="' + b[1] + '" rx="1" ' + (c === 'A' ? 'class="fa"' : 'fill="' + c + '"') + (c === '#FBF6EC' ? ' stroke="#1A1613" stroke-width=".5"' : '') + '/>';
        x += b[0] + 5; i++;
      }
      s += '<rect x="24" y="' + shelves[r] + '" width="210" height="3" fill="#5E4A3B"/>';
    }
    // poster with the monogram
    s += '<rect x="262" y="-114" width="62" height="82" rx="2" fill="#FBF6EC" stroke="#1A1613" stroke-width="1.2"/>' +
      '<circle cx="293" cy="-80" r="20" class="fa"/><text class="mono-glyph fo" x="293" y="-72.5" font-size="21" text-anchor="middle" data-mono></text>' +
      '<rect x="273" y="-50" width="40" height="3" class="fi" opacity=".6"/><rect x="281" y="-43" width="24" height="2.5" class="fi" opacity=".3"/>';
    // back door
    s += '<rect x="342" y="-92" width="38" height="92" rx="1.5" fill="#CDB893"/><rect x="342" y="-92" width="38" height="92" rx="1.5" fill="none" stroke="#1A1613" stroke-width="1" opacity=".5"/><circle cx="361" cy="-68" r="8" fill="#F7F0E2" stroke="#1A1613" stroke-width="1" opacity=".8"/><circle cx="349" cy="-44" r="1.8" class="fi"/>';
    return s;
  }

  var MAP = [
    '............................',
    '..####......##..#######.....',
    '.######....####.#########...',
    '..#####....###..########....',
    '...###......##...######.....',
    '....##.....####...###.......',
    '.....###...####....#........',
    '.....####...###........##...',
    '......###...##........####..',
    '......##..............###...',
    '......#.....................'
  ];
  function backSales() {
    var s = '<rect x="20" y="-116" width="204" height="90" rx="3" fill="#F7F0E2" stroke="#1A1613" stroke-width="1.2"/>';
    var ox = 30, oy = -108, c = 6.7, pin = function (col, row) { return [ox + col * c, oy + row * c]; };
    for (var r = 0; r < MAP.length; r++) for (var q = 0; q < MAP[r].length; q++) if (MAP[r][q] === '#') s += '<circle cx="' + r1(ox + q * c) + '" cy="' + r1(oy + r * c) + '" r="1.7" fill="#C9B594"/>';
    var home = pin(18, 4), dests = [pin(12, 2), pin(4, 2), pin(23, 8), pin(13, 6)];
    dests.forEach(function (d, i) {
      var mx = (home[0] + d[0]) / 2, my = Math.min(home[1], d[1]) - 16;
      s += '<path class="route sa" style="animation-delay:' + (i * -0.9) + 's" d="M' + r1(home[0]) + ' ' + r1(home[1]) + 'Q' + r1(mx) + ' ' + r1(my) + ' ' + r1(d[0]) + ' ' + r1(d[1]) + '" fill="none" stroke-width="1.3" stroke-dasharray="3 3"/>';
      s += '<circle cx="' + r1(d[0]) + '" cy="' + r1(d[1]) + '" r="3.2" class="fa" stroke="#F7F0E2" stroke-width="1"/>';
    });
    s += '<circle class="ping" cx="' + r1(home[0]) + '" cy="' + r1(home[1]) + '" r="7" fill="none" class="sa" stroke-width="1"/><circle cx="' + r1(home[0]) + '" cy="' + r1(home[1]) + '" r="4" class="fi" stroke="#F7F0E2" stroke-width="1"/>';
    // sales board: four columns, fewer cards each step, one card moves to "won"
    s += '<rect x="238" y="-116" width="138" height="90" rx="3" fill="#3A312A" stroke="#1A1613" stroke-width="1.2"/>';
    var counts = [3, 3, 2, 1];
    for (var k = 0; k < 4; k++) {
      var cx = 245 + k * 32;
      s += '<rect x="' + cx + '" y="-108" width="18" height="3" rx="1.5" fill="#F7F0E2" opacity=".45"/>';
      for (var j = 0; j < counts[k]; j++) {
        var moving = (k === 2 && j === 1);
        s += '<rect ' + (moving ? 'class="fa card-move"' : 'fill="#F7F0E2" opacity="' + (k === 3 ? 1 : 0.86) + '"') + ' x="' + cx + '" y="' + (-100 + j * 16) + '" width="27" height="12" rx="2"/>';
        if (!moving) s += '<rect x="' + (cx + 3) + '" y="' + (-96 + j * 16) + '" width="' + (10 + ((k + j) % 3) * 4) + '" height="2" rx="1" fill="#1A1613" opacity=".45"/>';
      }
    }
    s += '<path d="M344-52l4 4 8-9" fill="none" class="sa" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
    return s;
  }

  function backMoney() {
    var s = '<rect x="30" y="-118" width="336" height="98" rx="6" fill="#14110E" stroke="#4A3F36" stroke-width="1.5"/>';
    s += '<circle class="live" cx="44" cy="-108" r="2.6"/><rect x="51" y="-110" width="52" height="4" rx="2" fill="#F7F0E2" opacity=".8" data-screenname/>';
    for (var i = 0; i < 3; i++) {
      var x = 42 + i * 106;
      s += '<rect x="' + x + '" y="-100" width="98" height="27" rx="3.5" fill="#F7F0E2" opacity=".07"/>' +
        '<rect x="' + (x + 7) + '" y="-94" width="' + [26, 34, 22][i] + '" height="2.6" rx="1.3" fill="#F7F0E2" opacity=".42"/>' +
        '<rect x="' + (x + 7) + '" y="-87" width="' + [50, 42, 56][i] + '" height="8" rx="2" fill="#F7F0E2" opacity=".95"/>' +
        '<rect x="' + (x + 72) + '" y="-86" width="19" height="6" rx="3" class="fa" opacity="' + (i === 1 ? 0.45 : 1) + '"/>';
    }
    var pts = [[42, -34], [76, -41], [108, -38], [142, -48], [176, -45], [208, -55], [242, -52], [276, -60], [310, -57], [352, -67]];
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join('');
    s += '<path d="M42-34H352M42-48H352M42-62H352" stroke="#F7F0E2" stroke-width=".6" opacity=".12"/>';
    for (i = 0; i < 16; i++) s += '<rect x="' + (44 + i * 19.6) + '" y="' + (-28 - [4, 6, 5, 8, 7, 10, 9, 12, 10, 13, 12, 15, 14, 17, 16, 19][i] * 0.9 + 1) + '" width="9" height="' + ([4, 6, 5, 8, 7, 10, 9, 12, 10, 13, 12, 15, 14, 17, 16, 19][i] * 0.9) + '" rx="1" ' + (i > 12 ? 'class="fa"' : 'fill="#F7F0E2" opacity=".2"') + '/>';
    s += '<path d="' + d + 'V-27H42z" fill="url(#AREA)" opacity=".55"/><path class="chartline sa" d="' + d + '" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" pathLength="100"/>' +
      '<circle class="ping fa" cx="352" cy="-67" r="6" opacity=".35"/><circle cx="352" cy="-67" r="3.4" class="fa" stroke="#14110E" stroke-width="1"/>';
    return s;
  }

  function backWork() {
    var s = '<rect x="24" y="-116" width="108" height="90" rx="3" fill="#F7F0E2" stroke="#1A1613" stroke-width="1.2"/><rect x="34" y="-108" width="44" height="4" rx="2" class="fi" opacity=".7"/>';
    for (var i = 0; i < 4; i++) {
      var y = -94 + i * 16;
      s += '<rect x="34" y="' + y + '" width="10" height="10" rx="2.5" fill="none" stroke="#1A1613" stroke-width="1.2"/>' +
        '<rect x="51" y="' + (y + 3.5) + '" width="' + [62, 48, 68, 40][i] + '" height="3" rx="1.5" class="fi" opacity=".3"/>' +
        '<path class="tick t' + i + ' sa" d="M36 ' + (y + 5) + 'l3 3 6-8" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" pathLength="10"/>';
    }
    s += gear(268, -78, 30, 11, 'cw') + gear(318, -46, 19, 8, 'ccw') + gear(214, -46, 17, 7, 'ccw');
    s += '<rect x="150" y="-124" width="230" height="5" rx="2.5" fill="#B8A688"/><rect x="352" y="-124" width="5" height="30" fill="#B8A688"/>';
    return s;
  }

  /* ---------- rooms: materials and objects ---------- */

  var MAT = {
    ground: { wall: '#F4EAD7', lwall: '#E3D4B8', rwall: '#ECDFC6', ceil: '#FCF6EA', floor: '#D9C5A3', line: '#1A1613', lo: 0.13 },
    sales: { wall: '#E7D8BD', lwall: '#D3C1A1', rwall: '#DDCCAE', ceil: '#F2E7D2', floor: '#B48F69', line: '#1A1613', lo: 0.16 },
    money: { wall: '#2B2420', lwall: '#201A16', rwall: '#251F1B', ceil: '#3A302A', floor: '#1B1613', line: '#FFFFFF', lo: 0.07 },
    work: { wall: '#ECE2CF', lwall: '#D8CBB3', rwall: '#E2D6C0', ceil: '#F8F1E2', floor: '#A39382', line: '#1A1613', lo: 0.15 }
  };

  // each object: [u (px from room left), v (px above floor, or 'c' = hangs from ceiling), t (depth 0..1), svg, extra class]
  var OBJ = {
    ground: [
      [120, 'c', 0.55, lamp()], [290, 'c', 0.55, lamp()],
      [300, 0, 0.62, counter()],
      [122, 0, 0.36, displayTable()],
      [26, 0, 0.14, plant(50)]
    ],
    sales: [
      [100, 'c', 0.5, lamp()], [296, 'c', 0.5, lamp()],
      [112, 0, 0.6, desk(false)], [286, 0, 0.6, desk(true)],
      [364, 0, 0.2, rack()],
      [34, 0, 0.16, suitcase()]
    ],
    money: [
      [198, 'c', 0.45, striplight()],
      [56, 0, 0.42, safe()],
      [210, 0, 0.6, console_()],
      [340, 0, 0.26, coins()]
    ],
    work: [
      [90, 'c', 0.3, lamp()], [306, 'c', 0.3, lamp()],
      [198, 0, 0.56, conveyor()],
      [362, 0, 0.14, outputStack()],
      [28, 0, 0.12, plant(40)]
    ]
  };
  var BACK = { ground: backGround, sales: backSales, money: backMoney, work: backWork };

  /* ---------- the roof ---------- */

  function telescope() {
    return shadow(18, 2.5, 0.15) +
      '<path d="M0-30L-13 0M0-30L13 0M0-30L1 0" class="si" stroke-width="2" stroke-linecap="round" fill="none"/>' +
      '<g transform="rotate(-32 0 -32)"><rect x="-22" y="-37" width="46" height="10" rx="2" class="fi"/><rect x="20" y="-39" width="9" height="14" rx="2" class="fa"/><rect x="-27" y="-35" width="6" height="6" rx="1" class="fi"/></g>' +
      '<circle cx="0" cy="-31" r="3" class="fp" stroke="#1A1613" stroke-width="1.2"/>';
  }
  function signpost() {
    return shadow(8, 2, 0.15) + '<rect x="-1.5" y="-52" width="3" height="52" class="fi"/>' +
      '<path d="M2-50h22l6 5.5-6 5.5h-22z" class="fa"/>' +
      '<path d="M-2-37h-24l-6 5.5 6 5.5h24z" class="fp" stroke="#1A1613" stroke-width="1"/><rect x="-24" y="-33" width="14" height="2.4" rx="1.2" class="fi" opacity=".5"/>' +
      '<path d="M2-24h17l6 5.5-6 5.5h-17z" class="fp" stroke="#1A1613" stroke-width="1"/><rect x="5" y="-20" width="10" height="2.4" rx="1.2" class="fi" opacity=".5"/>';
  }
  function planter(w) {
    return '<g fill="#66733F"><circle cx="' + (-w / 4) + '" cy="-15" r="8"/><circle cx="' + (w / 5) + '" cy="-17" r="9.5" fill="#56633A"/><circle cx="0" cy="-13" r="7" fill="#7C8A4E"/></g>' +
      '<rect x="' + (-w / 2) + '" y="-11" width="' + w + '" height="11" rx="1.5" fill="#B5754F"/><rect x="' + (-w / 2) + '" y="-11" width="' + w + '" height="3" fill="#9C6040"/>';
  }
  function flag() {
    var a = 'M0-236q13-7 27 0t27 0v34q-13 7-27 0t-27 0z', b = 'M0-236q13 6 27 0t27 0v34q-13-6-27 0t-27 0z';
    return shadow(6, 2, 0.15) + '<rect x="-1.75" y="-244" width="3.5" height="244" class="fi"/><circle cx="0" cy="-246" r="4" class="fi"/>' +
      '<path class="fa" d="' + a + '">' + (reduce ? '' : '<animate attributeName="d" dur="3.2s" repeatCount="indefinite" values="' + a + ';' + b + ';' + a + '" calcMode="spline" keyTimes="0;.5;1" keySplines=".4 0 .6 1;.4 0 .6 1"/>') + '</path>' +
      '<text class="mono-glyph fo" x="27" y="-212.5" font-size="18" text-anchor="middle" data-mono></text>';
  }

  /* ---------- assemble ---------- */

  function create(host, opts) {
    opts = opts || {};
    var uid = 'b' + (++uidCount);
    var U = function (s) { return s.replace(/url\(#/g, 'url(#' + uid).replace(/id="/g, 'id="' + uid); };
    var vp = { x: VP0.x, y: VP0.y }, target = { x: VP0.x, y: VP0.y }, light = { x: 0 }, lightT = { x: 0 }, raf = 0;

    var defs = '<defs>' +
      '<radialGradient id="GLOW"><stop offset="0" stop-color="#FFE7A8" stop-opacity=".85"/><stop offset=".35" stop-color="#FFD98A" stop-opacity=".28"/><stop offset="1" stop-color="#FFD98A" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="GLOWDOWN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE7A8" stop-opacity=".35"/><stop offset="1" stop-color="#FFE7A8" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="AREA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="stop-a" stop-opacity=".6"/><stop offset="1" class="stop-a" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="CONE" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE7A8" stop-opacity=".42"/><stop offset="1" stop-color="#FFE7A8" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="TORCH"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="FLOORSHADE" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="WALLSHADE" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".1"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>' +
      '<clipPath id="CLIPBELTL"><rect x="-170" y="-90" width="134" height="56"/></clipPath><clipPath id="CLIPBELTR"><rect x="36" y="-90" width="134" height="56"/></clipPath>';
    ROOMS.forEach(function (r) { defs += '<clipPath id="CLIP' + r.id + '"><rect x="' + RX0 + '" y="' + r.y0 + '" width="' + RW + '" height="' + FH + '"/></clipPath>'; });
    defs += '</defs>';

    // sky
    var sky = '<g class="bld-sky"><circle class="sun-ghost" cx="456" cy="196" r="124"/><g class="sun-rise"><g data-sun><circle class="sun fa" cx="456" cy="196" r="124"/></g></g>' +
      '<g class="plane"><path class="sa" d="M505 196Q560 120 612 104" fill="none" stroke-width="1.4" stroke-dasharray="2 5" stroke-linecap="round"/><path class="fi" d="M606 96l22 2-14 14-1.5-7.5z"/></g>' +
      '<g class="stars">' + [[60, 90], [150, 40], [250, 70], [560, 60], [600, 190], [40, 260], [585, 330], [300, 30]].map(function (p, i) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (1 + (i % 3) * 0.5) + '"/>'; }).join('') + '</g></g>';

    // ground
    var ground = '<g class="bld-ground"><polygon class="cast" data-cast points=""/>' +
      '<path class="groundline" d="M-900 ' + GROUND + 'H1540"/><path class="kerb" d="M-900 ' + (GROUND + 22) + 'H1540"/>' +
      '<g class="tree" transform="translate(624 ' + GROUND + ')">' + shadow(22, 3, 0.14) + '<rect x="-2.5" y="-46" width="5" height="46" class="fi"/><g fill="#7C8A4E" stroke="#1A1613" stroke-width="1.3"><circle cx="-13" cy="-58" r="17"/><circle cx="13" cy="-62" r="19" fill="#66733F"/><circle cx="0" cy="-80" r="20"/></g></g>' +
      '<g class="streetlamp" transform="translate(584 ' + GROUND + ')">' + shadow(9, 2.2, 0.14) + '<circle class="glow" cx="-16" cy="-118" r="60" fill="url(#GLOW)"/><rect x="-1.75" y="-128" width="3.5" height="128" class="fi"/><rect x="-5" y="-6" width="10" height="6" rx="1" class="fi"/><path d="M0-126q-2-10-16-10" fill="none" class="si" stroke-width="3" stroke-linecap="round"/><path d="M-26-134h14l3 8h-20z" class="fi"/><ellipse class="bulb" cx="-19" cy="-125.5" rx="7" ry="2"/></g></g>';

    // rooms
    var rooms = '';
    ROOMS.forEach(function (r, i) {
      var m = MAT[r.id], g = '<g class="bld-floor" data-floor="' + r.id + '" style="--i:' + i + '">';
      g += '<g clip-path="url(#CLIP' + r.id + ')">' +
        '<rect x="' + RX0 + '" y="' + r.y0 + '" width="' + RW + '" height="' + FH + '" fill="' + m.wall + '"/>' +
        '<polygon data-s="ceil" fill="' + m.ceil + '"/><polygon data-s="floor" fill="' + m.floor + '"/><polygon data-s="lwall" fill="' + m.lwall + '"/><polygon data-s="rwall" fill="' + m.rwall + '"/>' +
        '<rect data-s="back" fill="' + m.wall + '"/><rect data-s="backshade" fill="url(#WALLSHADE)"/>' +
        '<polygon data-s="floorshade" fill="url(#FLOORSHADE)" opacity=".5"/>' +
        '<path data-s="lines" fill="none" stroke="' + m.line + '" stroke-opacity="' + m.lo + '" stroke-width=".8"/>' +
        '<path data-s="edges" fill="none" stroke="' + m.line + '" stroke-opacity="' + (m.lo * 1.8) + '" stroke-width="1"/>' +
        (r.id === 'money' ? '<polygon data-s="screenglow" class="fa" opacity=".16"/>' : '') +
        '<g data-p="0,0,1" class="backwall"><g class="obj" style="--d:.05s">' + BACK[r.id]() + '</g></g>';
      OBJ[r.id].slice().sort(function (a, b) { return b[2] - a[2]; }).forEach(function (o, j) {
        g += '<g data-p="' + o[0] + ',' + o[1] + ',' + o[2] + '"><g class="obj' + (o[1] === 'c' ? ' hang' : '') + '" style="--d:' + (0.12 + j * 0.06) + 's">' + o[3] + '</g></g>';
      });
      g += '<polygon class="glint" data-s="glint"/><polygon class="glint" data-s="glint2"/><rect class="room-tint" x="' + RX0 + '" y="' + r.y0 + '" width="' + RW + '" height="' + FH + '"/></g>';
      // structure: side walls and the slab above
      var top = r.y0 - SLAB;
      g += '<rect class="struct" x="' + BX0 + '" y="' + r.y0 + '" width="' + WALL + '" height="' + FH + '"/><rect class="struct" x="' + RX1 + '" y="' + r.y0 + '" width="' + WALL + '" height="' + FH + '"/>';
      if (i < 3) g += '<rect class="struct" x="' + (BX0 - 5) + '" y="' + top + '" width="' + (BX1 - BX0 + 10) + '" height="' + SLAB + '"/><path class="struct-hi" d="M' + (BX0 - 5) + ' ' + (top + 0.5) + 'h' + (BX1 - BX0 + 10) + '"/>';
      else g += '<rect class="struct" x="' + (BX0 - 9) + '" y="' + ROOF + '" width="' + (BX1 - BX0 + 18) + '" height="' + (r.y0 - ROOF) + '"/><path class="struct-hi" d="M' + (BX0 - 9) + ' ' + (ROOF + 0.5) + 'h' + (BX1 - BX0 + 18) + '"/>';
      if (i === 0) g += '<rect class="struct" x="' + (BX0 - 12) + '" y="' + GROUND + '" width="' + (BX1 - BX0 + 24) + '" height="7"/>';
      g += '<rect class="hit" data-hit="' + r.id + '" x="' + BX0 + '" y="' + (r.y0 - SLAB / 2) + '" width="' + (BX1 - BX0) + '" height="' + (FH + SLAB) + '"/></g>';
      rooms += g;
    });

    // roof
    var roof = '<g class="bld-floor bld-roof" data-floor="roof" style="--i:4">' +
      '<g data-p="10,0,0.9" data-room="roof"><g class="obj" style="--d:.5s">' + flag() + '</g></g>' +
      '<g data-p="198,0,0.55" data-room="roof"><g class="obj sign" style="--d:.2s"><g data-signframe></g><text class="signtext-depth" data-signtext text-anchor="middle"></text><text class="signtext" data-signtext text-anchor="middle"></text></g></g>' +
      '<g data-p="236,0,0.3" data-room="roof"><g class="obj" style="--d:.42s"><g transform="scale(1.25)">' + signpost() + '</g></g></g>' +
      '<g data-p="334,0,0.14" data-room="roof"><g class="obj" style="--d:.48s"><g transform="scale(1.45)">' + telescope() + '</g></g></g>' +
      '<g data-p="64,0,0.12" data-room="roof"><g class="obj" style="--d:.36s">' + planter(44) + '</g></g>' +
      '<g data-p="128,0,0.12" data-room="roof"><g class="obj" style="--d:.4s">' + planter(28) + '</g></g>' +
      '<rect class="struct" x="' + (BX0 - 9) + '" y="' + (ROOF - 7) + '" width="' + (BX1 - BX0 + 18) + '" height="7" rx="1"/>' +
      '<rect class="hit" data-hit="roof" x="' + BX0 + '" y="' + (ROOF - 150) + '" width="' + (BX1 - BX0) + '" height="150"/></g>';

    // front: shop sign on the first slab, blade sign on the side wall
    var front = '<g class="bld-floor bld-front" style="--i:0"><g class="obj" style="--d:.5s">' +
      '<g data-fascia><rect class="fascia fa" x="220" y="664" width="200" height="24" rx="4"/><text class="fasciatext fo" data-fasciatext x="320" y="680.6" text-anchor="middle"></text></g>' +
      '<path d="M530 602h22" class="si" stroke-width="2.5"/><rect x="540" y="606" width="30" height="30" rx="5" class="fp" stroke="#1A1613" stroke-width="1.5"/><path d="M548 602v4M562 602v4" class="si" stroke-width="1.5"/>' +
      '<text class="mono-glyph fa" x="555" y="626.4" font-size="14.5" text-anchor="middle" data-mono></text></g></g>';

    // the drawing (before the building is built)
    var plan = '<g class="bld-plan"><rect class="pl" x="' + BX0 + '" y="' + ROOF + '" width="' + (BX1 - BX0) + '" height="' + (GROUND - ROOF) + '"/>';
    ROOMS.forEach(function (r) { plan += '<path class="pl" d="M' + BX0 + ' ' + r.y0 + 'H' + BX1 + '"/><path class="pl thin" data-wire="' + r.id + '"/>'; });
    plan += '<rect class="pl" x="150" y="96" width="340" height="66" rx="4" data-planbox/><path class="pl thin" d="M196 162V232M444 162V232"/>' +
      '<text class="plantext" data-plantext x="320" y="143" text-anchor="middle"></text>' +
      '<path class="pl thin" d="M70 110v14M63 117h14M570 110v14M563 117h14"/>' +
      '</g>';

    // dimension line with floor codes (stays in both states)
    var dims = '<g class="bld-dims"><path d="M82 ' + (ROOF - 110) + 'V' + GROUND + '" class="dimline"/>';
    [ROOF - 110, ROOF, 380, 524, 668, 812].forEach(function (y) { dims += '<path d="M77 ' + y + 'h10" class="dimline"/>'; });
    [['R', ROOF - 55, 'roof'], ['3', 316, 'work'], ['2', 460, 'money'], ['1', 604, 'sales'], ['G', 748, 'ground']].forEach(function (d) {
      dims += '<g class="dimcode" data-code="' + d[2] + '"><circle cx="56" cy="' + d[1] + '" r="13"/><text x="56" y="' + (d[1] + 4.6) + '" text-anchor="middle">' + d[0] + '</text></g>';
    });
    dims += '</g>';

    var svg = '<svg class="bld" viewBox="0 0 ' + VBW + ' ' + VBH + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="' + uid + 'title" focusable="false">' +
      '<title id="' + uid + 'title"></title>' + U(defs + sky + ground) + plan + dims + U(rooms + roof + front) +
      '<circle class="torch" data-torch cx="320" cy="400" r="300" fill="url(#' + uid + 'TORCH)"/></svg>';

    host.innerHTML = svg;
    var root = host.querySelector('svg');
    var titleEl = root.querySelector('title');
    var projEls = [].slice.call(root.querySelectorAll('[data-p]')).map(function (el) {
      var p = el.getAttribute('data-p').split(','), fl = el.closest('[data-floor]').getAttribute('data-floor');
      var room = fl === 'roof' ? ROOFROOM : ROOMS.filter(function (r) { return r.id === fl; })[0];
      return { el: el, u: +p[0], v: p[1] === 'c' ? room.h : +p[1], t: +p[2], room: room };
    });
    var surf = {};
    ROOMS.forEach(function (r) {
      var g = root.querySelector('[data-floor="' + r.id + '"]'); surf[r.id] = {};
      [].forEach.call(g.querySelectorAll('[data-s]'), function (el) { surf[r.id][el.getAttribute('data-s')] = el; });
      surf[r.id].wire = root.querySelector('[data-wire="' + r.id + '"]');
    });
    var castEl = root.querySelector('[data-cast]'), sunEl = root.querySelector('[data-sun]'), torchEl = root.querySelector('[data-torch]');

    function P(room, u, v, t) {
      var x = RX0 + u, y = room.y1 - v, f = K * t;
      var vy = room.cy + (vp.y - room.cy) * VBLEND;
      return [x + (vp.x - x) * f, y + (vy - y) * f, 1 - f];
    }
    function pt(a) { return r1(a[0]) + ',' + r1(a[1]); }

    function render() {
      ROOMS.forEach(function (r) {
        var s = surf[r.id];
        var bl = P(r, 0, 0, 1), br = P(r, RW, 0, 1), tl = P(r, 0, FH, 1), tr = P(r, RW, FH, 1);
        var FL = [RX0, r.y1], FR = [RX1, r.y1], TL = [RX0, r.y0], TR = [RX1, r.y0];
        s.floor.setAttribute('points', pt(FL) + ' ' + pt(FR) + ' ' + pt(br) + ' ' + pt(bl));
        s.ceil.setAttribute('points', pt(TL) + ' ' + pt(TR) + ' ' + pt(tr) + ' ' + pt(tl));
        s.lwall.setAttribute('points', pt(TL) + ' ' + pt(tl) + ' ' + pt(bl) + ' ' + pt(FL));
        s.rwall.setAttribute('points', pt(TR) + ' ' + pt(tr) + ' ' + pt(br) + ' ' + pt(FR));
        ['back', 'backshade'].forEach(function (k) {
          s[k].setAttribute('x', r1(tl[0])); s[k].setAttribute('y', r1(tl[1])); s[k].setAttribute('width', r1(tr[0] - tl[0])); s[k].setAttribute('height', r1(bl[1] - tl[1]));
        });
        s.floorshade.setAttribute('points', pt(bl) + ' ' + pt(br) + ' ' + pt(P(r, RW, 0, 0.55)) + ' ' + pt(P(r, 0, 0, 0.55)));
        var d = '', i, a, b;
        for (i = 1; i < 9; i++) { a = [RX0 + (RW / 9) * i, r.y1]; b = P(r, (RW / 9) * i, 0, 1); d += 'M' + pt(a) + 'L' + pt(b); }
        for (i = 1; i < 3; i++) { a = P(r, 0, 0, i / 3); b = P(r, RW, 0, i / 3); d += 'M' + pt(a) + 'L' + pt(b); }
        for (i = 1; i < 5; i++) { a = [RX0 + (RW / 5) * i, r.y0]; b = P(r, (RW / 5) * i, FH, 1); d += 'M' + pt(a) + 'L' + pt(b); }
        s.lines.setAttribute('d', d);
        s.edges.setAttribute('d', 'M' + pt(tl) + 'L' + pt(bl) + 'M' + pt(tr) + 'L' + pt(br) + 'M' + pt(bl) + 'L' + pt(br) + 'M' + pt(tl) + 'L' + pt(tr));
        var gx = RX0 + 250 - (vp.x - VP0.x) * 2.2 + (r.y1 - 600) * 0.5;
        s.glint.setAttribute('points', r1(gx + 60) + ',' + r.y0 + ' ' + r1(gx + 108) + ',' + r.y0 + ' ' + r1(gx + 44) + ',' + r.y1 + ' ' + r1(gx - 4) + ',' + r.y1);
        s.glint2.setAttribute('points', r1(gx + 122) + ',' + r.y0 + ' ' + r1(gx + 136) + ',' + r.y0 + ' ' + r1(gx + 72) + ',' + r.y1 + ' ' + r1(gx + 58) + ',' + r.y1);
        if (s.screenglow) s.screenglow.setAttribute('points', pt(P(r, 40, 0, 1)) + ' ' + pt(P(r, 356, 0, 1)) + ' ' + pt(P(r, 396, 0, 0.25)) + ' ' + pt(P(r, 0, 0, 0.25)));
        s.wire.setAttribute('d', 'M' + pt(tl) + 'L' + pt(tr) + 'L' + pt(br) + 'L' + pt(bl) + 'zM' + pt(TL) + 'L' + pt(tl) + 'M' + pt(TR) + 'L' + pt(tr) + 'M' + pt(FL) + 'L' + pt(bl) + 'M' + pt(FR) + 'L' + pt(br));
      });
      projEls.forEach(function (o) {
        var p = P(o.room, o.u, o.v, o.t);
        o.el.setAttribute('transform', 'translate(' + r1(p[0]) + ' ' + r1(p[1]) + ') scale(' + (Math.round(p[2] * 1000) / 1000) + ')');
      });
      var sx = -light.x * 46;
      castEl.setAttribute('points', (BX0 - 12) + ',' + (GROUND + 7) + ' ' + (BX1 + 12) + ',' + (GROUND + 7) + ' ' + r1(BX1 + 12 + sx - 44) + ',' + (GROUND + 34) + ' ' + r1(BX0 - 12 + sx - 44) + ',' + (GROUND + 34));
      sunEl.setAttribute('transform', 'translate(' + r1(light.x * 16) + ' ' + r1((vp.y - VP0.y) * 0.12) + ')');
    }

    function tick() {
      raf = 0;
      vp.x += (target.x - vp.x) * 0.12; vp.y += (target.y - vp.y) * 0.12; light.x += (lightT.x - light.x) * 0.1;
      render();
      if (Math.abs(target.x - vp.x) > 0.15 || Math.abs(target.y - vp.y) > 0.15 || Math.abs(lightT.x - light.x) > 0.004) raf = requestAnimationFrame(tick);
    }
    function look(nx, ny) { // nx, ny in -1..1
      nx = Math.max(-1, Math.min(1, nx)); ny = Math.max(-1, Math.min(1, ny));
      target.x = VP0.x + nx * 92; target.y = VP0.y + ny * 70; lightT.x = nx;
      if (reduce) return;
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function torch(x, y, on) { // svg coordinates
      torchEl.setAttribute('cx', r1(x)); torchEl.setAttribute('cy', r1(y)); torchEl.style.opacity = on ? 1 : 0;
    }
    function toSvg(clientX, clientY) {
      var b = root.getBoundingClientRect(), sc = Math.min(b.width / VBW, b.height / VBH);
      var ox = b.left + (b.width - VBW * sc) / 2, oy = b.top + (b.height - VBH * sc) / 2;
      return [(clientX - ox) / sc, (clientY - oy) / sc];
    }

    /* ---- name, monogram ---- */
    var signTexts = [].slice.call(root.querySelectorAll('[data-signtext]')), frameEl = root.querySelector('[data-signframe]');
    var planText = root.querySelector('[data-plantext]'), planBox = root.querySelector('[data-planbox]');
    var fasciaText = root.querySelector('[data-fasciatext]'), fasciaRect = root.querySelector('.fascia');
    var current = { name: '', mono: '' };

    function fitLines(textEl, str, maxW, maxSize, minSize, lineGap) {
      // returns {size, lines, width}; breaks into two lines when one line would get too small
      var measure = function (s, size) { textEl.setAttribute('font-size', size); textEl.textContent = s; return textEl.getComputedTextLength(); };
      var w = measure(str, maxSize), size = maxSize, lines = [str];
      if (w > maxW) size = Math.max(minSize, maxSize * maxW / w);
      if (size < maxSize * 0.56 && /\s/.test(str.trim())) {
        var words = str.trim().split(/\s+/), best = null;
        for (var i = 1; i < words.length; i++) {
          var a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
          var m = Math.max(measure(a, maxSize), measure(b, maxSize));
          if (!best || m < best.m) best = { m: m, a: a, b: b };
        }
        var s2 = Math.min(maxSize * 0.62, Math.max(minSize, maxSize * maxW / best.m));
        if (s2 > size) { size = s2; lines = [best.a, best.b]; }
      }
      var width = 0; lines.forEach(function (l) { width = Math.max(width, measure(l, size)); });
      if (width > maxW) { size = size * maxW / width; width = maxW; }
      return { size: size, lines: lines, width: width };
    }
    function setLines(textEl, fit, baseY, x) {
      textEl.textContent = '';
      textEl.setAttribute('font-size', r1(fit.size));
      fit.lines.forEach(function (l, i) {
        var ts = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        ts.setAttribute('x', x); ts.setAttribute('y', r1(baseY - (fit.lines.length - 1 - i) * fit.size * 0.98));
        ts.textContent = l; textEl.appendChild(ts);
      });
    }

    function setBrand(b) {
      current = { name: b.name || '', mono: b.monogram || '' };
      var up = (b.signName || b.name || '').toLocaleUpperCase();
      [].forEach.call(root.querySelectorAll('[data-mono]'), function (t) {
        t.textContent = current.mono;
        var base = +(t.getAttribute('data-fs') || t.getAttribute('font-size')); t.setAttribute('data-fs', base);
        t.setAttribute('font-size', [...current.mono].length > 1 ? r1(base * 0.72) : base);
      });
      // roof sign
      var fit = fitLines(signTexts[1], up || ' ', 372, 66, 15);
      signTexts.forEach(function (t) { setLines(t, fit, -96, 0); });
      // keep the coloured depth in proportion to the letters, so small two-line names stay crisp
      var dep = Math.max(1.4, Math.min(3.5, fit.size * 0.053)).toFixed(1);
      signTexts[0].style.transform = 'translate(' + dep + 'px, ' + dep + 'px)';
      var w = Math.max(150, fit.width + 26), h = fit.size * 0.74 * fit.lines.length + (fit.lines.length - 1) * fit.size * 0.24;
      var fr = '<rect x="' + r1(-w / 2) + '" y="-91" width="' + r1(w) + '" height="4.5" rx="1" class="fi"/>', n = Math.max(2, Math.round(w / 110)), i, x;
      for (i = 0; i <= n; i++) { x = -w / 2 + 10 + (w - 20) * i / n; fr += '<rect x="' + r1(x - 1.6) + '" y="-88" width="3.2" height="88" class="fi"/>'; }
      fr += '<path d="M' + r1(-w / 2 + 10) + ' -87l16 14M' + r1(w / 2 - 10) + ' -87l-16 14" class="si" stroke-width="1.4"/>';
      frameEl.innerHTML = fr;
      // the drawing's dashed sign
      var pf = fitLines(planText, up || ' ', 310, 40, 11);
      setLines(planText, pf, pf.lines.length > 1 ? 150 : 143 - (40 - pf.size) * 0.3, 320);
      var pw = Math.max(170, pf.width + 44); planBox.setAttribute('x', r1(320 - pw / 2)); planBox.setAttribute('width', r1(pw));
      // shop sign
      fasciaText.setAttribute('font-size', 12.5); fasciaText.textContent = up;
      var fw = fasciaText.getComputedTextLength();
      if (fw > 330) { fasciaText.setAttribute('font-size', r1(12.5 * 330 / fw)); fw = 330; }
      var bw = Math.max(96, fw + 34); fasciaRect.setAttribute('x', r1(320 - bw / 2)); fasciaRect.setAttribute('width', r1(bw));
      titleEl.textContent = (b.name ? b.name + ', drawn as a five-floor building. ' : 'A five-floor building. ') + 'Ground floor: your look and your website. First floor: customers and sales. Second floor: see your money. Third floor: work that does itself. Roof: where to go next.';
    }

    function setState(s) { // 'plan' | 'built'
      root.classList.toggle('is-plan', s === 'plan'); root.classList.toggle('is-built', s === 'built');
    }
    function highlight(id) {
      [].forEach.call(root.querySelectorAll('.bld-floor'), function (g) { g.classList.toggle('is-hot', !!id && g.getAttribute('data-floor') === id); });
      [].forEach.call(root.querySelectorAll('.dimcode'), function (g) { g.classList.toggle('is-hot', !!id && g.getAttribute('data-code') === id); });
      root.classList.toggle('has-hot', !!id);
    }
    function setPicked(ids) {
      [].forEach.call(root.querySelectorAll('.dimcode'), function (g) { g.classList.toggle('is-picked', ids.indexOf(g.getAttribute('data-code')) > -1); });
    }

    root.addEventListener('pointerover', function (e) { var h = e.target.getAttribute && e.target.getAttribute('data-hit'); if (h && opts.onHover) opts.onHover(h); });
    root.addEventListener('pointerout', function (e) { var h = e.target.getAttribute && e.target.getAttribute('data-hit'); if (h && opts.onHover) opts.onHover(null); });
    root.addEventListener('click', function (e) { var h = e.target.getAttribute && e.target.getAttribute('data-hit'); if (h && opts.onPick) opts.onPick(h); });

    setState(opts.state || 'plan');
    render();
    setBrand({ name: '', monogram: '' });

    return { el: root, look: look, torch: torch, toSvg: toSvg, setBrand: setBrand, setState: setState, highlight: highlight, setPicked: setPicked, refit: function () { setBrand({ name: current.name, monogram: current.mono }); }, render: render };
  }

  return { create: create, VBW: VBW, VBH: VBH };
})();
