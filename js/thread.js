/* Thread engine: geometry for the one line that runs through the site.
   - tangle(): a seeded, loopy scribble
   - route(): clean orthogonal routing with rounded corners, measured exactly
   - morph helpers to blend a tangle into a clean route
   No dependencies. Exposes window.Thread. */
(function () {
  'use strict';

  /* ---------- small maths ---------- */
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s += 0x6d2b79f5;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- curves ---------- */
  // Catmull-Rom through points. tension 1 = smooth curve, 0 = straight segments.
  function smoothPath(pts, tension) {
    if (!pts.length) return '';
    const f = n => n.toFixed(1);
    let d = 'M' + f(pts[0].x) + ' ' + f(pts[0].y);
    const k = tension / 6;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      if (k === 0) { d += 'L' + f(p2.x) + ' ' + f(p2.y); continue; }
      d += 'C' + f(p1.x + (p2.x - p0.x) * k) + ' ' + f(p1.y + (p2.y - p0.y) * k) + ' ' +
        f(p2.x - (p3.x - p1.x) * k) + ' ' + f(p2.y - (p3.y - p1.y) * k) + ' ' +
        f(p2.x) + ' ' + f(p2.y);
    }
    return d;
  }

  /* ---------- tangle ---------- */
  // A dense scribble around a centre, starting at `from` and ending at `to`.
  function tangle(opts) {
    const { cx, cy, rx, ry, n = 120, seed = 7, from, to, loops = 2.4 } = opts;
    const r = rng(seed);
    const harm = [];
    for (let h = 0; h < 3; h++) {
      harm.push({
        // non-integer frequencies so the loops never retrace each other
        fx: 0.7 + r() * 4.6, fy: 0.7 + r() * 4.6,
        px: r() * Math.PI * 2, py: r() * Math.PI * 2,
        a: [0.55, 0.3, 0.18][h]
      });
    }
    const pts = [];
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const t = u * Math.PI * 2 * loops;
      let x = 0, y = 0;
      for (const h of harm) {
        x += h.a * Math.sin(h.fx * t + h.px);
        y += h.a * Math.cos(h.fy * t + h.py);
      }
      x = cx + x * rx + (r() - 0.5) * rx * 0.06;
      y = cy + y * ry + (r() - 0.5) * ry * 0.06;
      // ease the ends onto the entry and exit points
      const wIn = from ? clamp(1 - u / 0.08) : 0;
      const wOut = to ? clamp((u - 0.92) / 0.08) : 0;
      if (wIn) { x = lerp(x, from.x, ease(wIn)); y = lerp(y, from.y, ease(wIn)); }
      if (wOut) { x = lerp(x, to.x, ease(wOut)); y = lerp(y, to.y, ease(wOut)); }
      pts.push({ x, y });
    }
    return pts;
  }

  /* ---------- orthogonal route with rounded corners ---------- */
  // Takes polyline vertices (axis-aligned), returns {d, length, at(len), segs}.
  function route(verts, radius = 18) {
    const v = [];
    for (const p of verts) {
      const last = v[v.length - 1];
      if (!last || dist(last, p) > 0.5) v.push({ x: p.x, y: p.y });
    }
    // drop collinear middle points
    for (let i = v.length - 2; i > 0; i--) {
      const a = v[i - 1], b = v[i], c = v[i + 1];
      if (Math.abs((b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x)) < 0.01) v.splice(i, 1);
    }
    const segs = [];
    let cursor = v[0];
    for (let i = 1; i < v.length; i++) {
      const V = v[i];
      if (i === v.length - 1) { segs.push(line(cursor, V)); break; }
      const P = v[i - 1], N = v[i + 1];
      const lin = dist(P, V), lout = dist(V, N);
      const din = { x: (V.x - P.x) / lin, y: (V.y - P.y) / lin };
      const dout = { x: (N.x - V.x) / lout, y: (N.y - V.y) / lout };
      const r = Math.min(radius, lin / 2, lout / 2);
      const S = { x: V.x - din.x * r, y: V.y - din.y * r };
      const E = { x: V.x + dout.x * r, y: V.y + dout.y * r };
      segs.push(line(cursor, S));
      if (r > 0.1) segs.push(arc(S, E, din, dout, r));
      cursor = E;
    }
    let length = 0;
    for (const s of segs) { s.l0 = length; length += s.len; }
    const f = n => n.toFixed(1);
    let d = v.length ? 'M' + f(v[0].x) + ' ' + f(v[0].y) : '';
    for (const s of segs) {
      d += s.type === 'L'
        ? 'L' + f(s.b.x) + ' ' + f(s.b.y)
        : 'A' + f(s.r) + ' ' + f(s.r) + ' 0 0 ' + s.sweep + ' ' + f(s.b.x) + ' ' + f(s.b.y);
    }
    function at(len) {
      len = clamp(len, 0, length);
      for (const s of segs) {
        if (len <= s.l0 + s.len || s === segs[segs.length - 1]) {
          const t = s.len ? (len - s.l0) / s.len : 0;
          if (s.type === 'L') return { x: lerp(s.a.x, s.b.x, t), y: lerp(s.a.y, s.b.y, t) };
          const ang = lerp(s.a0, s.a1, t);
          return { x: s.c.x + Math.cos(ang) * s.r, y: s.c.y + Math.sin(ang) * s.r };
        }
      }
      return v[0];
    }
    // cumulative length at each original vertex (nearest point on route)
    function lengthAtVertex(p) {
      let best = 0, bd = Infinity;
      for (let L = 0; L <= length; L += 4) {
        const q = at(L), dd = dist(p, q);
        if (dd < bd) { bd = dd; best = L; }
      }
      return best;
    }
    return { d, length, at, segs, verts: v, lengthAtVertex };
  }
  function line(a, b) { return { type: 'L', a, b, len: dist(a, b) }; }
  function arc(S, E, din, dout, r) {
    const c = { x: S.x + dout.x * r, y: S.y + dout.y * r };
    const cross = din.x * dout.y - din.y * dout.x;
    const a0 = Math.atan2(S.y - c.y, S.x - c.x);
    let a1 = Math.atan2(E.y - c.y, E.x - c.x);
    let da = a1 - a0;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    return { type: 'A', a: S, b: E, c, r, a0, a1: a0 + da, sweep: cross > 0 ? 1 : 0, len: Math.abs(da) * r };
  }

  // Orthogonal connector between two points. axis 'v' = leave vertically, 'h' = leave horizontally.
  function elbow(a, b, axis = 'v', bias = 0.5) {
    if (Math.abs(a.x - b.x) < 1 || Math.abs(a.y - b.y) < 1) return [a, b];
    if (axis === 'v') {
      const ym = lerp(a.y, b.y, bias);
      return [a, { x: a.x, y: ym }, { x: b.x, y: ym }, b];
    }
    const xm = lerp(a.x, b.x, bias);
    return [a, { x: xm, y: a.y }, { x: xm, y: b.y }, b];
  }

  // n points evenly spaced along a measured route, with corners snapped in so
  // the straightened line keeps crisp right angles.
  function sampleRoute(rt, n) {
    const pts = [];
    for (let i = 0; i < n; i++) pts.push(rt.at((i / (n - 1)) * rt.length));
    return pts;
  }

  // Blend two point lists. `stagger` makes one end resolve first.
  function blend(A, B, t, stagger = 0) {
    const n = A.length, out = new Array(n);
    for (let i = 0; i < n; i++) {
      const local = stagger ? clamp((t * (1 + stagger) - (i / (n - 1)) * stagger)) : t;
      const e = ease(local);
      out[i] = { x: lerp(A[i].x, B[i].x, e), y: lerp(A[i].y, B[i].y, e) };
    }
    return out;
  }

  window.Thread = { lerp, clamp, ease, easeOut, rng, smoothPath, tangle, route, elbow, sampleRoute, blend, dist };
})();
