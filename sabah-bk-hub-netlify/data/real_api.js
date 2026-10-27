/* Derived views of the real Champions League data (data/bcl_real.js). Pure computation, no data in here. */
(function () {
  const H = window.HUB, X = H.real; if (!X) return;
  const R = H.R = {};
  const POS = { PG: 1, G: 1.5, SG: 2, GF: 2.5, SF: 3, F: 3.5, PF: 4, FC: 4.5, C: 5 };
  R.map = { SBK: "SAB", RYT: "VILN", TRA: "TS", NAN: "NTR" };               // our team ids -> Champions League codes
  R.back = Object.fromEntries(Object.entries(R.map).map(([a, b]) => [b, a]));
  R.gameMap = { G2: "136223", G3: "136226" };                              // our game ids -> Champions League game ids
  R.gid = id => R.gameMap[id] || id;
  const bx = (gid, code) => X.box[gid].filter(r => r[1] === code);
  const sum = (a, i) => a.reduce((s, r) => s + r[i], 0);
  // box row layout: 0 pid 1 team 2 sec 3 pts 4 fgm 5 fga 6 tpm 7 tpa 8 ftm 9 fta 10 or 11 dr 12 ast 13 to 14 stl 15 blk 16 pf 17 fd 18 pm 19 eff 20 starter
  R.teamGame = (gid, code) => { const g = X.games.find(x => x.id === gid), opp = g.a === code ? g.b : g.a, r = bx(gid, code), o = bx(gid, opp), side = g.a === code ? 0 : 1;
    const T = a => ({ pts: sum(a, 3), fgm: sum(a, 4), fga: sum(a, 5), tpm: sum(a, 6), tpa: sum(a, 7), ftm: sum(a, 8), fta: sum(a, 9), or: sum(a, 10), dr: sum(a, 11), ast: sum(a, 12), to: sum(a, 13), stl: sum(a, 14), blk: sum(a, 15), pf: sum(a, 16) });
    const t = T(r), u = T(o), poss = t.fga + .44 * t.fta - t.or + t.to, oposs = u.fga + .44 * u.fta - u.or + u.to;
    return Object.assign(t, { gid, code, opp, date: g.date, home: side === 0, pts: side ? g.sb : g.sa, opts: side ? g.sa : g.sb, q: X.q[gid][side], oq: X.q[gid][1 - side], poss, oposs, o: u,
      ortg: (side ? g.sb : g.sa) / poss * 100, drtg: (side ? g.sa : g.sb) / oposs * 100,
      ff: { efg: (t.fgm + .5 * t.tpm) / t.fga * 100, tov: t.to / (t.fga + .44 * t.fta + t.to) * 100, orb: t.or / (t.or + u.dr) * 100, ftr: t.fta / t.fga * 100 },
      off: { efg: (u.fgm + .5 * u.tpm) / u.fga * 100, tov: u.to / (u.fga + .44 * u.fta + u.to) * 100, orb: u.or / (u.or + t.dr) * 100, ftr: u.fta / u.fga * 100 } }); };
  R.teamGames = code => X.games.filter(g => g.a === code || g.b === code).sort((a, b) => a.date < b.date ? -1 : 1).map(g => R.teamGame(g.id, code));
  R.team = code => { const G = R.teamGames(code), k = f => G.reduce((s, g) => s + f(g), 0) / G.length; if (!G.length) return null;
    return { code, name: X.teams[code].name, gp: G.length, games: G, pts: k(g => g.pts), opts: k(g => g.opts), poss: k(g => g.poss), ortg: k(g => g.ortg), drtg: k(g => g.drtg), fga: k(g => g.fga), fgp: k(g => g.fgm) / k(g => g.fga) * 100, tpa: k(g => g.tpa), tpp: k(g => g.tpm) / k(g => g.tpa) * 100, fta: k(g => g.fta), ftp: k(g => g.ftm) / k(g => g.fta) * 100, or: k(g => g.or), dr: k(g => g.dr), ast: k(g => g.ast), to: k(g => g.to), stl: k(g => g.stl), blk: k(g => g.blk), tpar: k(g => g.tpa) / k(g => g.fga) * 100,
      ff: { efg: k(g => g.ff.efg), tov: k(g => g.ff.tov), orb: k(g => g.ff.orb), ftr: k(g => g.ff.ftr) }, off: { efg: k(g => g.off.efg), tov: k(g => g.off.tov), orb: k(g => g.off.orb), ftr: k(g => g.off.ftr) }, w: G.filter(g => g.pts > g.opts).length, l: G.filter(g => g.pts < g.opts).length }; };
  R.standings = () => { const t = {}; X.games.forEach(g => { [[g.a, g.sa, g.sb], [g.b, g.sb, g.sa]].forEach(([c, f, a]) => { const o = t[c] = t[c] || { code: c, name: X.teams[c].name, group: X.teams[c].group, gp: 0, w: 0, l: 0, pf: 0, pa: 0, form: [] }; o.gp++; o.pf += f; o.pa += a; f > a ? o.w++ : o.l++; o.form.push(f > a ? "w" : "l"); }); });
    return Object.values(t).sort((a, b) => a.group < b.group ? -1 : a.group > b.group ? 1 : (b.w - a.w) || ((b.pf - b.pa) - (a.pf - a.pa))); };
  R.players = code => { const m = {}; X.games.filter(g => g.a === code || g.b === code).forEach(g => bx(g.id, code).forEach(r => { (m[r[0]] = m[r[0]] || []).push([g.id, ...r]); }));
    return Object.entries(m).map(([pid, L]) => { const av = i => L.reduce((s, r) => s + r[i + 1], 0) / L.length, P = X.players[pid]; return { pid, name: P.n, num: P.num, pos: P.pos, gp: L.length, min: av(2) / 60, pts: av(3), reb: av(10) + av(11), ast: av(12), to: av(13), stl: av(14), blk: av(15), eff: av(19), fgm: av(4), fga: av(5), tpm: av(6), tpa: av(7), ftm: av(8), fta: av(9), fgp: av(5) ? av(4) / av(5) * 100 : 0, tpp: av(7) ? av(6) / av(7) * 100 : 0, ftp: av(9) ? av(8) / av(9) * 100 : 0, log: L }; }).sort((a, b) => b.min - a.min); };
  // shots mapped onto the 500 x 470 court used by the site (hoop at 250, 52). Source court: x 0..280, y 0..249, hoop near (140, 29).
  R.shots = (f = {}) => X.shots.filter(s => (!f.gid || s[0] === f.gid) && (!f.team || s[1] === f.team) && (!f.pid || s[2] === f.pid));
  R.bins = (arr, cell = 36) => { const m = {}; arr.forEach(s => { const x = s[3] / 280 * 500, y = 2 + s[4] / 280 * 500; if (y > 450) return; const k = Math.floor(x / cell) + "," + Math.floor(y / cell), b = m[k] = m[k] || { x: 0, y: 0, att: 0, mk: 0 }; b.x += x; b.y += y; b.att++; b.mk += s[5]; });
    return Object.values(m).map(b => ({ x: Math.round(b.x / b.att), y: Math.round(b.y / b.att), att: Math.min(12, b.att), pct: Math.round(b.mk / b.att * 100), n: b.att })).filter(b => b.att >= 1); };
  R.zones = arr => { let rim = 0, mid = 0, three = 0; arr.forEach(s => { const d = Math.hypot(s[3] - 140, s[4] - 29); if (s[6]) three++; else if (d <= 48) rim++; else mid++; }); const t = rim + mid + three || 1; return [rim / t * 100, mid / t * 100, three / t * 100]; };
  // who is on the floor at a game second (stints come from the substitutions log)
  R.floor = (gid, code, sec) => { const S = X.stints[gid], out = []; Object.entries(S).forEach(([pid, L]) => { if (X.players[pid] && X.players[pid].t === code && L.some(([a, b]) => sec >= a && sec < b)) out.push(pid); }); return out.sort((a, b) => (POS[X.players[a].pos] || 3) - (POS[X.players[b].pos] || 3)); };
  R.rotation = (gid, code, q) => Array.from({ length: 10 }, (_, m) => R.floor(gid, code, (q - 1) * 600 + m * 60 + 30));
  R.clock = (gid, code) => bx(gid, code);
  R.name = pid => X.players[pid] ? X.players[pid].n : pid;
  R.last = pid => { const n = R.name(pid).split(" "); return n[n.length - 1].replace(/\b(Jr\.?|II|III)$/i, "").trim() || n[n.length - 2]; };
  R.rosterIdx = name => { const last = name.split(" ").filter(w => !/^(jr\.?|ii)$/i.test(w)).pop().toLowerCase(); return H.roster.findIndex(p => p.name.toLowerCase().includes(last)); };

  // ---------- possession layer (from play by play)
  // row: [gid, team, start, dur, type, pts, fgm, fga, tpa, to, fta, ftm, startKind, ato, shotcat, ast, fb]
  R.TYPES = ["Transition", "Early offense", "Half court", "Final position", "Second chance"];
  R.TRANGE = ["0 to 6 s", "7 to 10 s", "11 to 19 s", "20 s or more", "after an offensive rebound"];
  R.SHOTCAT = ["Layup", "Dunk", "Floater", "Hook", "Step back", "Pull up", "Turnaround / fadeaway", "Spot up jump shot"];
  R.START = ["Period start", "Defensive rebound", "Steal", "After a made basket", "After a turnover", "Offensive rebound", "Jump ball", "Other"];
  const psum = (a, f) => a.reduce((x, p) => x + f(p), 0);
  R.poss = (f = {}) => X.poss.filter(p => (!f.gid || p[0] === f.gid) && (!f.team || p[1] === f.team) && (!f.opp || (X.games.find(g => g.id === p[0]) && (g => (g.a === f.opp ? g.b : g.a))(X.games.find(g => g.id === p[0])) === f.opp)) );
  R.possAgainst = (code, gid) => X.poss.filter(p => { const g = G(p[0]); return (!gid || p[0] === gid) && (g.a === code || g.b === code) && p[1] !== code; });
  const G = id => X.games.find(g => g.id === id);
  R.byType = arr => { const tot = arr.length || 1; return R.TYPES.map((k, i) => { const a = arr.filter(p => p[4] === i), n = a.length, pts = psum(a, p => p[5]), fga = psum(a, p => p[7]), fgm = psum(a, p => p[6]), tpm = psum(a.filter(p => p[8] && p[6]), p => 1), to = psum(a, p => p[9]), fta = psum(a, p => p[10]);
    return { k, range: R.TRANGE[i], n, freq: n / tot * 100, pts, ppp: n ? pts / n : 0, fga, fgm, efg: fga ? (fgm + 0.5 * psum(a, p => p[8] && p[6] ? 1 : 0)) / fga * 100 : 0, tov: n ? to / n * 100 : 0, ftr: n ? fta / n : 0, ato: psum(a, p => p[13]) }; }); };
  R.byStart = arr => [1, 3, 4, 5].map(i => { const a = arr.filter(p => p[12] === i), n = a.length, pts = psum(a, p => p[5]); return { k: R.START[i], n, ppp: n ? pts / n : 0, freq: n / (arr.length || 1) * 100 }; });
  R.byShot = arr => { const a = arr.filter(p => p[7] > 0), tot = a.length || 1; return R.SHOTCAT.map((k, i) => { const b = a.filter(p => p[14] === i), m = psum(b, p => p[6]); return { k, n: b.length, freq: b.length / tot * 100, fgp: b.length ? m / b.length * 100 : 0, ast: m ? psum(b.filter(p => p[6]), p => p[15]) / m * 100 : 0 }; }); };
  R.assisted = arr => { const m = arr.filter(p => p[6]); return m.length ? psum(m, p => p[15]) / m.length * 100 : 0; };
  R.extra = arr => ({ fb: psum(arr, p => p[16] ? p[5] : 0), offTO: psum(arr.filter(p => p[12] === 2 || p[12] === 4), p => p[5]), second: psum(arr.filter(p => p[12] === 5), p => p[5]), ato: psum(arr.filter(p => p[13]), p => p[5]), atoN: psum(arr, p => p[13]) });
  R.leagueByType = () => R.byType(X.poss);
  R.pacePoss = arr => arr.length;

  // ---------- league table: one row per team with averages, used for percentiles and ranks
  let _lg = null;
  R.league = () => { if (_lg) return _lg; _lg = {}; Object.keys(X.teams).forEach(c => { const t = R.team(c); if (!t) return; const pa = R.poss({ team: c }), pd = R.possAgainst(c), bt = R.byType(pa), bd = R.byType(pd);
      _lg[c] = { code: c, name: t.name, gp: t.gp, ortg: t.ortg, drtg: t.drtg, net: t.ortg - t.drtg, pace: t.poss, efg: t.ff.efg, tov: t.ff.tov, orb: t.ff.orb, ftr: t.ff.ftr, oefg: t.off.efg, otov: t.off.tov, oorb: t.off.orb, oftr: t.off.ftr, tpar: t.tpar, tpp: t.tpp, ftp: t.ftp, fgp: t.fgp, ast: t.ast, to: t.to, stl: t.stl, blk: t.blk, ast_pct: R.assisted(pa),
        trans: bt[0].freq, early: bt[1].freq, half: bt[2].freq, final: bt[3].freq, second: bt[4].freq, pppT: bt[0].ppp, pppE: bt[1].ppp, pppH: bt[2].ppp, pppF: bt[3].ppp, pppS: bt[4].ppp, dpppT: bd[0].ppp, dpppH: bd[2].ppp }; });
    return _lg; };
  // higher is better unless the metric is in LOW
  R.LOW = { drtg: 1, tov: 1, oefg: 1, oorb: 1, oftr: 1, to: 1, dpppT: 1, dpppH: 1 };
  R.rank = (k, code) => { const a = Object.values(R.league()).map(t => t[k]).sort((x, y) => R.LOW[k] ? x - y : y - x), v = R.league()[code][k]; return a.indexOf(v) + 1; };
  R.pct = (k, code) => { const a = Object.values(R.league()).map(t => t[k]), v = R.league()[code][k], n = a.length, below = a.filter(x => R.LOW[k] ? x > v : x < v).length; return Math.round(below / (n - 1) * 100); };
  R.leagueAvg = k => { const a = Object.values(R.league()).map(t => t[k]); return a.reduce((x, y) => x + y, 0) / a.length; };
  R.all = Object.keys(X.teams);
  R.sab = "SAB";
})();
