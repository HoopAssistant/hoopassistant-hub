/* ============================================================
   PRACTICE LAYER (sample tagging + sheet templates)
   Ball reversals, paint touches, types of paint touch and efficiency.
   genTag(id) builds the tagging of one practice. In production this
   comes from the tagging file the staff uploads after each practice.
   ============================================================ */
(function () {
  const H = window.HUB;
  const hash = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rng = seed => { let x = (seed * 2654435761 >>> 0) % 2147483647 || 1; const f = () => ((x = (x * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 8; i++) f(); return f; };
  const iso = d => d.toISOString().slice(0, 10);

  // ---- practice calendar: every day Mon to Sat, except game days
  const gameDates = new Set(H.games.map(g => g.date));
  const kinds = [
    ["Contact", "Contact + 5v5 live"], ["Shooting", "Shooting + 5v5 live"], ["Tape", "Tape + walkthrough"],
    ["5v5", "5v5 live"], ["Shooting", "Shooting + paint touch drills"], ["Walkthrough", "Walkthrough"]
  ];
  const practices = [];
  for (let d = new Date("2026-09-14T12:00:00Z"); iso(d) <= "2026-12-31"; d.setUTCDate(d.getUTCDate() + 1)) {
    const dow = (d.getUTCDay() + 6) % 7; if (dow === 6) continue; const id = iso(d);
    if (gameDates.has(id)) continue;
    const k = kinds[dow];
    practices.push({ id: "T" + id, date: id, kind: k[0], title: k[1], tagged: !["Tape", "Walkthrough"].includes(k[0]) });
  }
  const past = id => id < "2026-10-22";

  // ---- sheet template (rows: time, block, minutes, drill, notes)
  const blocks = {
    Contact: [["Activation", 10, "Dynamic warm up", "All"], ["Contact finishing", 15, "Rim finishing with contact", "Bigs + wings"], ["Shell drill", 15, "4v4 shell, closeouts", "Starters"], ["5v5 live", 25, "Half court live, tag paint touches", "All"], ["Free throws", 8, "Pressure free throws", "All"]],
    Shooting: [["Activation", 10, "Dynamic warm up", "All"], ["Shooting", 20, "Catch and shoot, off the dribble", "Guards + wings"], ["Paint touch drill", 15, "Drive and kick, 3 reversal rule", "All"], ["5v5 live", 25, "Half court live, tag reversals", "All"], ["Free throws", 8, "Pressure free throws", "All"]],
    Tape: [["Tape session", 25, "Previous game, coverages", "All"], ["Walkthrough", 20, "Opponent sets", "All"], ["Shooting", 15, "Free shooting", "Individuals"]],
    "5v5": [["Activation", 10, "Dynamic warm up", "All"], ["Ball reversal drill", 15, "Reverse before the shot", "All"], ["5v5 live", 30, "Full court, tag reversals and paint touches", "All"], ["Free throws", 8, "Pressure free throws", "All"]],
    Walkthrough: [["Walkthrough", 30, "Opponent sets and BLOB, SLOB", "All"], ["Shooting", 15, "Free shooting", "Individuals"]]
  };
  H.defaultSheet = id => {
    const p = practices.find(x => x.id === id), b = blocks[p ? p.kind : "Shooting"], start = 10 * 60 + 30; let t = start;
    return b.map(([block, min, drill, who]) => { const row = { time: String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0"), block, min, drill, who }; t += min; return row; });
  };

  // ---- tagging generator
  H.genTag = function (id) {
    const R = rng(hash(id)), r = (a, b, d = 0) => +(a + R() * (b - a)).toFixed(d);
    const poss = Math.round(r(58, 108));
    const w = [r(30, 40), r(28, 34), r(18, 26), r(8, 16)], tw = w.reduce((a, b) => a + b, 0);
    const reversals = ["0", "1", "2", "3+"].map((k, i) => ({ k, share: +(w[i] / tw * 100).toFixed(1), ppp: r(0.84 + i * 0.12, 0.96 + i * 0.13, 2) }));
    const ptPct = r(52, 74), pt = Math.round(poss * ptPct / 100);
    const tw2 = [r(26, 34), r(10, 16), r(14, 22), r(10, 16), r(14, 22), r(5, 10), r(3, 8)], ts = tw2.reduce((a, b) => a + b, 0);
    const names = ["Dribble drive", "Post touch", "Cut to rim", "Roll or dive catch", "Kick in pass", "Putback", "Others"];
    const types = names.map((k, i) => { const c = Math.round(pt * tw2[i] / ts); return { k, count: c, pct: +(c / poss * 100).toFixed(1), ppp: r(i === 0 ? 1.08 : 0.95, i === 3 ? 1.45 : 1.3, 2), ast: Math.round(c * r(0.18, 0.42, 2)), kick3: Math.round(c * r(0.05, 0.3, 2)) }; });
    const o = [r(38, 48), r(18, 28), r(8, 14), r(8, 14)], to = o.reduce((a, b) => a + b, 0);
    const outcomes = [["Shot at the rim", "#1a7d52"], ["Kick out three", "#2f5bd0"], ["Foul drawn", "#c9a227"], ["Turnover", "#c4404a"]].map(([k, c], i) => ({ k, c, share: +(o[i] / to * 100).toFixed(1) }));
    const sc = [r(8, 14), r(24, 34), r(30, 40), r(14, 22)], tc = sc.reduce((a, b) => a + b, 0);
    const clock = ["0 to 6 s", "7 to 12 s", "13 to 18 s", "19 to 24 s"].map((k, i) => ({ k, share: +(sc[i] / tc * 100).toFixed(1) }));
    const ids = [0, 1, 2, 3, 4, 8, 9, 5].sort(() => R() - 0.5).slice(0, 6);
    const players = ids.map(i => ({ id: i, count: Math.round(r(4, 18)), ppp: r(0.9, 1.4, 2) })).sort((a, b) => b.count - a.count);
    return { poss, ppp: r(0.96, 1.24, 2), ptPct: +ptPct.toFixed(1), pt, pppWith: r(1.12, 1.34, 2), pppWithout: r(0.78, 0.98, 2), revPct: +(100 - reversals[0].share).toFixed(1), reversals, types, outcomes, clock, players };
  };

  // ---- season weekly trend (sample)
  const R2 = rng(99), rr = (a, b, d = 1) => +(a + R2() * (b - a)).toFixed(d);
  H.practiceTrend = ["Sep 14", "Sep 21", "Sep 28", "Oct 5", "Oct 12", "Oct 19"].map((w, i) => ({ w, pt: rr(55 + i * 2, 62 + i * 2), rev: rr(54 + i * 2.5, 62 + i * 2.5), ppp: rr(1.0 + i * 0.015, 1.08 + i * 0.015, 2) }));
  H.practices = practices; H.isPast = past;
  H.sources.practice = "sample";
})();
