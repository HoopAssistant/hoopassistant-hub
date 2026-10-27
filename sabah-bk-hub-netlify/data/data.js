/* ============================================================
   SABAH BK HUB · DATA LAYER
   source flags (HUB.sources):
     "scrape" -> REAL data (demo: from Eurobasket; production: from the league)
     "sample" -> sample content that shows what HoopAssistant tagging produces
   To update: edit this file, same shape. Nothing else needs to change.
   ============================================================ */
(function () {
  let s = 23;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const r = (a, b, d = 0) => +(a + rnd() * (b - a)).toFixed(d);
  const pick = a => a[Math.floor(rnd() * a.length)];

  const club = { name: "Sabah BK", short: "SBK", city: "Baku", league: "Azerbaijan Basketball League", season: "2026/27", coach: "Spasic" };

  // ================= REAL =================
  const teams = [
    { id: "SBK", name: "Sabah BK" }, { id: "LIO", name: "Lions" }, { id: "NTD", name: "NTD" },
    { id: "NAK", name: "Nakhchivan" }, { id: "RYT", name: "Rytas" }, { id: "TRA", name: "Trabzonspor" }, { id: "NAN", name: "Nanterre" }
  ];
  const games = [
    { id: "G1", date: "2026-09-30", comp: "ABL", round: 1, home: true,  opp: "LIO", score: [84, 74] },
    { id: "G2", date: "2026-10-06", comp: "BCL", round: 1, home: false, opp: "RYT", score: [73, 82] },
    { id: "G3", date: "2026-10-14", comp: "BCL", round: 2, home: false, opp: "TRA", score: [83, 100] },
    { id: "G4", date: "2026-10-19", comp: "ABL", round: 3, home: true,  opp: "NTD", score: [100, 75] },
    { id: "G5", date: "2026-10-23", comp: "ABL", round: 4, home: null,  opp: "NAK", score: null },
    { id: "G6", date: "2026-10-27", comp: "BCL", round: 4, home: null,  opp: "NAN", score: null },
    { id: "G7", date: "2026-11-10", comp: "BCL", round: 6, home: null,  opp: "TRA", score: null },
    { id: "G8", date: "2026-12-09", comp: "BCL", round: 8, home: null,  opp: "NAN", score: null },
    { id: "G9", date: "2026-12-22", comp: "BCL", round: 10, home: null, opp: "RYT", score: null }
  ];
  const compName = { ABL: "Azerbaijan Basketball League", BCL: "Basketball Champions League" };
  const roster = [
    [4, "Gerry Blakes", "SG", 32, "USA", 193, "Hefei (CHN)"], [3, "Michael Ertel II", "G", 27, "USA", 187, "HK JinNiu (CHN)"],
    [21, "Charles Manning Jr.", "G/F", 28, "USA", 196, "Karsiyaka (TUR)"], [29, "Mindaugas Susinskas", "PF", 31, "Lithuania", 205, "Girona (ESP)"],
    [23, "Kamran Mammadov", "PG", 26, "Azerbaijan", 188, "Neftci"], [33, "Nick Perkins", "F/C", 30, "USA", 203, "San German (PUR)"],
    [13, "Tajuan Agee", "PF", 28, "USA-Philippines", 206, "Bourg (FRA)"], [24, "Evan Bruinsma", "PF", 34, "USA", 203, "Bnei Hertzeliya (ISR)"],
    [35, "Frankie Fidler", "F", 23, "USA", 201, "Portland TB (USA)"], [15, "Quincy Ballard", "C", 25, "USA", 213, "Michigan State (USA)"],
    [12, "Rashid Abbasov", "F", 21, "Azerbaijan", 196, "Sheki"], [null, "Huseyn Mammadov", "C", 18, "Azerbaijan", 200, "Sabah"],
    [99, "Huseyn Memmedov", "F", 18, "Azerbaijan", 198, "Guba"], [14, "Endar Poladkhanli", "F/C", 27, "Azerbaijan", 198, "Serhedci"],
    [7, "Shirzad Shirzadov", "G/F", 26, "Azerbaijan", 188, "NTD"], [16, "I Agbason", "C", 17, "Azerbaijan", 205, "Sabah"],
    [null, "Musa Isayev", "C", 16, "Azerbaijan", 206, "Sabah"], [null, "Huseyn Qafalanov", "C", 18, "Azerbaijan", 210, "Sumqayit"]
  ].map(([n, name, pos, age, nat, cm, prev], id) => ({ id, n, name, pos, age, nat, cm, prev }));
  const teamStats = [
    ["Games", 2, 2], ["Points per game", 92.0, 78.0], ["2FG%", 57.3, 54.5], ["3FG%", 35.4, 28.0], ["FT%", 76.5, 73.2],
    ["Offensive rebounds", 9.5, 5.0], ["Defensive rebounds", 28.0, 26.0], ["Total rebounds", 37.5, 31.0], ["Assists", 19.0, 19.5],
    ["Turnovers", 11.0, 9.0], ["Steals", 9.5, 8.0], ["Blocks", 4.5, 3.0],
    ["Opponent points", 74.5, 91.0], ["Opponent 2FG%", 38.8, 59.7], ["Opponent 3FG%", 37.0, 38.5]
  ].map(([k, abl, bcl]) => ({ k, abl, bcl }));

  // ================= SAMPLE (what HoopAssistant tagging produces) =================
  // shot bins for a court 500 x 470, hoop at (250, 52)
  const bins = (n, bias = 0) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = rnd(); let x, y, base;
      if (t < 0.30) { x = 250 + r(-34, 34); y = r(40, 100); base = 62; }
      else if (t < 0.42) { x = 250 + r(-60, 60); y = r(105, 185); base = 41; }
      else if (t < 0.60) { const a = r(0.25, 2.9, 2), d = r(105, 185); x = 250 + Math.cos(a) * d; y = 52 + Math.sin(a) * d; base = 39; }
      else { const a = r(0.12, 3.02, 2), d = r(248, 268); x = 250 + Math.cos(a) * d; y = 52 + Math.sin(a) * d; base = 35; }
      x = Math.max(24, Math.min(476, x)); y = Math.max(10, Math.min(440, y));
      out.push({ x: Math.round(x), y: Math.round(y), att: r(2, 12), pct: Math.max(8, Math.min(78, Math.round(base + bias + r(-16, 16)))) });
    }
    return out;
  };

  const sample = {};
  // per game
  games.filter(g => g.score).forEach(g => {
    const split = tot => { const q = [0, 1, 2].map(() => Math.round(tot / 4 + r(-4, 4))); q.push(tot - q.reduce((a, b) => a + b, 0)); return q; };
    const win = g.score[0] > g.score[1];
    sample[g.id] = {
      q: [split(g.score[0]), split(g.score[1])],
      ff: [["eFG%", r(48, 60), r(44, 56)], ["Turnover %", r(11, 17, 1), r(11, 17, 1)], ["Offensive rebound %", r(22, 34, 1), r(22, 34, 1)], ["Free throw rate", r(20, 38, 1), r(20, 38, 1)]].map(([k, a, b]) => ({ k, a, b })),
      play: [["Half court set", 52], ["Transition", 14], ["Early offense", 12], ["SLOB", 7], ["BLOB", 5], ["Final possession", 4], ["Out of sets", 6]].map(([k, f]) => ({ k, freq: f + r(-3, 3), ppp: r(0.85, 1.35, 2), opp: r(0.85, 1.3, 2) })),
      mix: [r(38, 50), r(14, 22), r(30, 42)],
      shots: bins(46, win ? 3 : -3),
      top: [0, 1, 3, 2, 8, 9].sort(() => rnd() - 0.5).slice(0, 3).map(i => ({ id: roster[i].id, pts: r(11, 24), reb: r(2, 9), ast: r(1, 7), min: r(20, 33, 0) })).sort((a, b) => b.pts - a.pts)
    };
  });
  // per player
  roster.forEach((p, i) => {
    const rot = i < 10, min = rot ? r(16, 31, 1) : r(0, 8, 1);
    sample["P" + p.id] = {
      min, pts: +(min * r(0.38, 0.62, 2)).toFixed(1), reb: +(min * r(0.1, 0.32, 2)).toFixed(1), ast: +(min * r(0.04, 0.22, 2)).toFixed(1),
      fg: r(40, 58), tp: r(26, 42), ft: r(62, 88), ts: r(50, 64), usg: r(14, 28),
      trend: Array.from({ length: 4 }, () => r(4, 24)),
      shots: bins(rot ? 38 : 10, r(-2, 5)),
      note: pick(["Looks to attack closeouts and finish through contact.", "Best in pick and roll as the roll man, lives above the rim.", "Spot up threat, shoots the corner three at a high rate.", "Plays downhill off the dribble, finds the weak side.", "Anchors the paint and communicates the coverage."]),
      tags: [pick(["Spot up", "Pick and roll", "Transition", "Post up", "Cut"]), pick(["Corner three", "Rim finisher", "Pull up", "Floater", "Offensive rebounder"])]
    };
  });

  const trendSeries = games.filter(g => g.score).map(g => ({ id: g.id, label: g.comp + " " + (g.home ? "vs" : g.home === false ? "@" : "") + " " + (teams.find(t => t.id === g.opp).name), off: r(0.98, 1.3, 2), def: r(0.95, 1.3, 2), tp: r(26, 42, 1) }));
  const seasonPlay = [["Half court set", 52], ["Transition", 14], ["Early offense", 12], ["SLOB", 7], ["BLOB", 5], ["Final possession", 4], ["Out of sets", 6]].map(([k, f]) => ({ k, freq: f, ppp: r(0.9, 1.35, 2), opp: r(0.9, 1.3, 2), ref: r(1.0, 1.2, 2) }));
  const quarters = ["Q1", "Q2", "Q3", "Q4"].map(k => ({ k, v: r(-0.18, 0.2, 2) }));

  const rivals = {};
  const keys = [
    ["Pick and roll ball handler is their main action, they hunt the pull up three.", "Weak against early offense, 1.3 points per possession allowed.", "Protect the defensive glass, they send 3 to the offensive boards."],
    ["Run most of their offense through the post, double early.", "They switch every ball screen, punish the mismatch.", "Slow transition defense after made baskets."],
    ["High pace, over 80 possessions per game, force them to half court.", "Cover the ball screen with drop, pull the big up.", "Their best shooter takes 22% of the shots, stay attached."]
  ];
  ["LIO", "NTD", "NAK", "RYT", "TRA", "NAN"].forEach((id, i) => {
    rivals[id] = {
      ppp: r(0.98, 1.2, 2), pppAllowed: r(0.98, 1.2, 2), pace: r(72, 84, 1), keys: keys[i % 3],
      mix: [["Half court", r(40, 55)], ["Transition", r(10, 20)], ["Early offense", r(8, 16)], ["SLOB", r(5, 9)], ["BLOB", r(3, 7)]],
      ppps: [r(1, 1.2, 2), r(1.2, 1.5, 2), r(1.1, 1.4, 2), r(0.9, 1.1, 2), r(0.9, 1.1, 2)],
      coverage: [["Drop", r(15, 35)], ["Show", r(10, 25)], ["Switch", r(10, 25)], ["Ice", r(5, 20)], ["Under", r(5, 15)]],
      key: { n: 9 + i, name: "Key player", pos: pick(["SG", "PG", "PF"]), pts: r(12, 22, 1), fg: r(41, 52), tp: r(31, 41), tags: ["Scorer", "Pull up off dribble", "Takes 20% of their shots"], shots: bins(42, 2) },
      sets: [["H1A", "Horns Weave + PNR", r(18, 32)], ["H2E", "Spain PNR", r(8, 15)], ["H3A", "Shuffle Post Up", r(5, 11)], ["T1", "Ball Reversal DHO", r(5, 12)]].map(([c, n, u]) => ({ code: c, name: n, use: u, ppp: r(0.8, 1.5, 2), adj: pick(["Be aggressive on the weave", "Switch the 1 to 4", "Ice the ball screen", "Stay home on shooters"]) })),
      players: Array.from({ length: 8 }, (_, k) => ({ n: k * 3 + 2, name: "Player " + String.fromCharCode(65 + k), min: r(10, 30, 1), pts: r(3, 20, 1), reb: r(1, 8, 1), ast: r(0.5, 5, 1), fg: r(35, 58), tp: r(22, 42) })).sort((a, b) => b.pts - a.pts)
    };
  });

  const playbook = [
    ["Fast break", ["Outlet", "Kick ahead", "Kick across", "Rim runner", "Early 1 on 1"]],
    ["1 Series", ["1 Ghost", "15 Ghost veer"]], ["2 Series", ["2 Low", "2 Flash", "2 Down", "2 Special"]],
    ["3 Series", ["3 Side", "3 Down", "3 Curl"]], ["Elbow Series", ["Elbow 4", "Elbow 5", "Elbow Dribble", "Elbow Side"]],
    ["BLOB", ["Box", "Stack", "Last"]], ["SLOB", ["Sideline 1", "Sideline 2", "Last"]], ["PNR guidelines", ["Reads: flat, red, ice", "Spacing: middle, side, step"]]
  ];
  // diagrams: pos = 5 players [x,y], mv = moves [x1,y1,x2,y2,type]
  const sets = [
    ["H1A", "Horns Weave + PNR", 30, 1.0, "Horns look with weave action into a pick and roll. Our main half court set.",
      [[250, 300], [130, 250], [370, 250], [185, 200], [315, 200]], [[250, 300, 200, 220, "cut"], [185, 200, 232, 262, "screen"], [130, 250, 150, 120, "cut"], [315, 200, 300, 110, "cut"], [250, 300, 130, 250, "pass"]]],
    ["H2A", "Ghost Flare", 9, 1.71, "Ghost screen into a flare for the shooter. High value, low volume.",
      [[250, 310], [90, 230], [410, 230], [190, 180], [310, 180]], [[250, 310, 190, 200, "pass"], [310, 180, 410, 120, "screen"], [410, 230, 440, 130, "cut"], [190, 180, 150, 110, "cut"]]],
    ["H3A", "Post Up", 8, 0.33, "Entry to the post after a shuffle. Low efficiency in the sample.",
      [[250, 300], [100, 240], [400, 240], [180, 160], [330, 130]], [[250, 300, 180, 240, "pass"], [100, 240, 160, 130, "cut"], [330, 130, 190, 130, "screen"], [180, 240, 175, 130, "pass"]]],
    ["H1C", "Horns", 8, 0.81, "Base horns look, early reads for the 4 and 5.",
      [[250, 310], [90, 250], [410, 250], [190, 190], [310, 190]], [[250, 310, 190, 230, "pass"], [190, 190, 210, 250, "screen"], [310, 190, 290, 250, "screen"], [90, 250, 120, 140, "cut"]]],
    ["T1", "Ball Reversal DHO", 16, 1.25, "Reverse the ball and hand off on the second side.",
      [[150, 320], [250, 340], [400, 250], [120, 190], [350, 170]], [[150, 320, 250, 340, "pass"], [250, 340, 400, 250, "pass"], [400, 250, 340, 190, "cut"], [350, 170, 410, 220, "screen"]]]
  ].map(([code, name, use, ppp, desc, pos, mv]) => ({ code, name, use, ppp, desc, pos, mv }));
  const rotation = {
    PG: ["Mammadov","Mammadov","Mammadov","Mammadov","Ertel","Ertel","Ertel","Ertel","Mammadov","Mammadov"],
    SG: ["Blakes","Blakes","Blakes","Blakes","Blakes","Shirzadov","Shirzadov","Shirzadov","Blakes","Blakes"],
    SF: ["Manning","Manning","Manning","Fidler","Fidler","Fidler","Fidler","Fidler","Manning","Manning"],
    PF: ["Susinskas","Susinskas","Susinskas","Susinskas","Agee","Agee","Agee","Agee","Agee","Susinskas"],
    C:  ["Ballard","Ballard","Ballard","Ballard","Perkins","Perkins","Perkins","Perkins","Ballard","Ballard"]
  };
  const dev = [["Blakes", "Three point shooting"], ["Ertel", "Creating and passing"], ["Manning", "Defensive solidity"], ["Susinskas", "Shooting"], ["Ballard", "Rim protection"], ["Fidler", "Three point shooting"]].map(([last, goal]) => {
    const p = roster.find(x => x.name.includes(last));
    return { id: p.id, n: p.n, name: p.name, goals: [goal], metrics: [["3P%", r(25, 45)], ["TS%", r(48, 62)], ["AST/TO", r(1, 3, 1)], ["Min", r(15, 30, 1)]].map(([k, v]) => ({ k, v, series: Array.from({ length: 6 }, () => r(20, 60)) })) };
  });
  const clips = [["Horns Weave + PNR", "Q2 6:42"], ["Ghost Flare three", "Q3 8:15"], ["Transition stop", "Q1 3:20"], ["BLOB Box", "Q4 4:08"], ["Ice on the ball screen", "Q2 1:55"], ["Offensive rebound", "Q4 2:31"]];

  window.HUB = {
    club, teams, games, compName, roster, teamStats, sample, trendSeries, seasonPlay, quarters, rivals, playbook, sets, rotation, dev, clips,
    sources: { dashboard: "scrape", league: "scrape", planning: "scrape", post: "sample", trends: "sample", pre: "sample", gameplan: "sample", playbook: "sample", dev: "sample", game: "scrape", player: "scrape", set: "sample", client: "client" }
  };
})();
