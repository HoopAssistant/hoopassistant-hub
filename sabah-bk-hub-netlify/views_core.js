/* Shared helpers for the real-data views (percentiles, possession tables, team blocks).
   Loaded before app.js. app.js calls each factory in H.V2s with its own helper kit. */
window.HUB.V2s = window.HUB.V2s || [];
window.HUB.V2s.push(function (K) {
  const { H, card, kpi, chip, heat, lineChart, donut, hbars, tn, PC } = K, RL = H.R, RX = H.real;
  const f1 = v => (+v).toFixed(1), f0 = v => Math.round(+v), f2 = v => (+v).toFixed(2);
  const sum = (a, f) => a.reduce((x, y) => x + f(y), 0), avg = (a, f) => a.length ? sum(a, f) / a.length : 0;
  const nm = c => RX.teams[c] ? RX.teams[c].name : c;
  const last = n => { const w = n.split(" ").filter(x => !/^(jr\.?|ii|iii)$/i.test(x)); return w[w.length - 1]; };
  const pcol = p => p >= 70 ? "#2f9e69" : p >= 40 ? "#c8a232" : "#c24540";
  const ord = n => n + (n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th");
  // percentile row: label, value text, percentile 0..100, optional note
  const prow = (label, val, p, note = "") => `<div class="prow"><span>${label}</span><div class="pbt"><i style="width:${Math.max(3, p)}%;background:${pcol(p)}"></i></div><b>${val}</b><em style="color:${pcol(p)}">${p}</em>${note ? `<small>${note}</small>` : ""}</div>`;
  // rank KPI: value plus "#n of 32"
  const rk = (label, val, code, key) => `<div class="kpi rkp"><small>${label}</small><b>${val}</b><em class="rk" style="color:${pcol(RL.pct(key, code))}">#${RL.rank(key, code)} of ${Object.keys(RL.league()).length}</em></div>`;
  const heatc = (v, lo, hi, inv) => { let t = (v - lo) / ((hi - lo) || 1); t = Math.max(0, Math.min(1, inv ? 1 - t : t)); return heat(24 + (1 - t) * 0 + (t < .5 ? t * 32 : 16 + (t - .5) * 2 * 20) + 0); };
  // colour a PPP value against the league average for that possession type
  const gc = (v, ref) => { const d = v - ref; return d > .12 ? "#2f9e69" : d > .04 ? "#9ccfae" : d < -.12 ? "#d4594f" : d < -.04 ? "#ecb2a9" : "#e8e2d2"; };
  const tcol = ["#c24540", "#e08a2b", "#2f5fa8", "#595959", "#8e44ad"];
  // possession type table for an array of possession rows. side "off" or "def" only changes the wording.
  const typeTable = (arr, ref, gp, wording = "scores") => { const bt = RL.byType(arr);
    return `<table class="dense ht2"><tr><th>POSSESSION TYPE</th><th>BY SECONDS</th><th class="n">POSS/G</th><th class="n">% ALL</th><th class="n">PPP</th><th class="n">LEAGUE</th><th class="n">eFG%</th><th class="n">TOV%</th><th class="n">VS LEAGUE</th></tr>${bt.map((t, i) => `<tr><td><i class="dot" style="background:${tcol[i]}"></i><b>${t.k}</b></td><td>${t.range}</td><td class="n">${f1(t.n / gp)}</td><td class="n">${f0(t.freq)}%</td><td class="v" style="background:${gc(t.ppp, ref[i].ppp)}">${f2(t.ppp)}</td><td class="n">${f2(ref[i].ppp)}</td><td class="n">${f0(t.efg)}%</td><td class="n">${f0(t.tov)}%</td><td class="n ${t.ppp >= ref[i].ppp ? "w" : "l"}">${t.ppp >= ref[i].ppp ? "+" : ""}${f2(t.ppp - ref[i].ppp)}</td></tr>`).join("")}</table>`; };
  const startTable = (arr, gp) => { const bs = RL.byStart(arr); const lg = RL.byStart(RX.poss);
    return `<table class="dense"><tr><th>HOW THE POSSESSION STARTS</th><th class="n">POSS/G</th><th class="n">% ALL</th><th class="n">PPP</th><th class="n">LEAGUE</th></tr>${bs.map((s, i) => `<tr><td><b>${s.k}</b></td><td class="n">${f1(s.n / gp)}</td><td class="n">${f0(s.freq)}%</td><td class="v" style="background:${gc(s.ppp, lg[i].ppp)}">${f2(s.ppp)}</td><td class="n">${f2(lg[i].ppp)}</td></tr>`).join("")}</table>`; };
  const shotTable = arr => { const bs = RL.byShot(arr), lg = RL.byShot(RX.poss);
    return `<table class="dense"><tr><th>SHOT TYPE</th><th class="n">SHOTS</th><th class="n">% OF SHOTS</th><th class="n">FG%</th><th class="n">LEAGUE FG%</th><th class="n">ASSISTED</th></tr>${bs.filter(s => s.n).map((s, i) => { const L = lg[RL.SHOTCAT.indexOf(s.k)]; return `<tr><td><b>${s.k}</b></td><td class="n">${s.n}</td><td class="n">${f0(s.freq)}%</td><td class="n ${s.fgp >= L.fgp ? "w" : "l"}"><b>${f0(s.fgp)}%</b></td><td class="n">${f0(L.fgp)}%</td><td class="n">${s.n ? f0(s.ast) + "%" : "·"}</td></tr>`; }).join("")}</table>`; };
  const extras = (arr, gp) => { const e = RL.extra(arr); return `<div class="grid g4">${kpi("Fast break points", f1(e.fb / gp))}${kpi("Points off turnovers", f1(e.offTO / gp))}${kpi("Second chance points", f1(e.second / gp))}${kpi("Assisted baskets", f0(RL.assisted(arr)) + "%")}</div>`; };
  // possession donut (frequency by type)
  const typeDonut = (arr, label) => { const bt = RL.byType(arr), tot = sum(arr, p => p[5]) / (arr.length || 1); return donut(bt.map((t, i) => ({ k: t.k, v: Math.round(t.freq), c: tcol[i] })), f2(tot), label); };
  // court with bins, no click: coarse heat circles
  const courtHeat = bins => `<svg viewBox="0 0 500 470" class="court">${K.COURT}${bins.map(b => `<circle cx="${b.x}" cy="${b.y}" r="${(4 + b.att * 0.9).toFixed(1)}" fill="${heat(b.pct)}" stroke="#0003" stroke-width=".6" opacity=".92"><title>${b.n} shots · ${b.pct}%</title></circle>`).join("")}</svg><div class="legend"><span>Cold</span><i style="background:linear-gradient(90deg,${heat(24)},${heat(40)},${heat(60)})"></i><span>Hot</span><small>Dot size = attempts</small></div>`;
  const zoneStack = (sh, w = "") => { const z = RL.zones(sh); return `<div class="stack" ${w}>${z.map((m, i) => `<i style="flex:${Math.max(m, 1)};background:${["#2f9e69", "#999", "#2f5fa8"][i]}">${m > 12 ? ["Rim/paint ", "Mid ", "3PT "][i] + f0(m) + "%" : ""}</i>`).join("")}</div>`; };
  const teamLink = c => `<a class="lnk" href="#/team/${c}"><b>${nm(c)}</b></a>`;
  // standings with clickable teams
  const stand = (grp, hi) => `<table class="dense"><tr><th>#</th><th>Team</th><th class="n">GP</th><th class="n">W</th><th class="n">L</th><th class="n">PF</th><th class="n">PA</th><th class="n">DIFF</th><th>Form</th></tr>${RL.standings().filter(t => t.group === grp).map((t, i) => `<tr class="click ${t.code === hi ? "me" : ""}" data-href="#/team/${t.code}"><td>${i + 1}</td><td>${H.v2.logo((RX.teams[t.code] || {}).org)}<b>${t.name}</b> ›</td><td class="n">${t.gp}</td><td class="n">${t.w}</td><td class="n">${t.l}</td><td class="n">${t.pf}</td><td class="n">${t.pa}</td><td class="n ${t.pf - t.pa < 0 ? "l" : "w"}">${t.pf - t.pa > 0 ? "+" : ""}${t.pf - t.pa}</td><td>${t.form.map(c => `<i class="fd ${c}"></i>`).join("")}</td></tr>`).join("")}</table>`;
  const metrics = [["Offensive rating", "ortg", f1], ["Defensive rating", "drtg", f1], ["Net rating", "net", f1], ["Pace", "pace", f1], ["eFG%", "efg", f1], ["Turnover %", "tov", f1], ["Offensive rebound %", "orb", f1], ["Free throw rate", "ftr", f1]];
  const profile = code => metrics.map(([l, k, f]) => prow(l, f(RL.league()[code][k]), RL.pct(k, code), "#" + RL.rank(k, code))).join("");
  H.v2 = H.v2 || {};
  Object.assign(H.v2, { f1, f0, f2, sum, avg, nm, last, pcol, ord, prow, rk, gc, tcol, typeTable, startTable, shotTable, extras, typeDonut, courtHeat, zoneStack, teamLink, stand, profile, metrics, heatc });
  return {};
});
