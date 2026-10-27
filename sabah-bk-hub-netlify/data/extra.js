/* ============================================================
   EXTRA SAMPLE LAYER (formats copied from the reference hub)
   Everything here is sample content. Real data stays in data.js.
   ============================================================ */
(function () {
  const H = window.HUB;
  const rng = seed => { let x = (seed * 2654435761 >>> 0) % 2147483647 || 1; const f = () => ((x = (x * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 8; i++) f(); return f; };
  const R = rng(4242), r = (a, b, d = 0) => +(a + R() * (b - a)).toFixed(d);

  // ---- playbook cards (name, color, items [title, note])
  H.pbk = {
    Offense: [
      ["Fast break", "#2f7fd0", [["Outlet", ""], ["Kick ahead", ""], ["Kick across", ""], ["Rim runner", ""], ["Early 1 on 1", ""]]],
      ["Secondary break", "#2f7fd0", [["X1", ""], ["X2", ""], ["X3", ""], ["X4", ""], ["X5", ""], ["X6", ""]]],
      ["Series A", "#27ae60", [["A1", ""], ["A2", ""]]],
      ["Series B", "#27ae60", [["B1", ""], ["B2", ""], ["B3", ""], ["B4", ""], ["B5", ""], ["B6", ""]]],
      ["Series C", "#27ae60", [["C1", ""], ["C2", ""], ["C3", ""], ["C4", ""]]],
      ["Series D", "#27ae60", [["D1", ""], ["D2", ""], ["D3", ""], ["D4", ""], ["D5", ""], ["D6", ""]]],
      ["Series E", "#27ae60", [["E1", ""], ["E2", ""], ["E3", ""], ["E4", ""]]],
      ["VS Switch", "#c4402f", [["Guard mismatch", "1-on-1 perimeter"], ["Big mismatch", "1-on-1 post"], ["If 3/4 front", "flash, create triangle, feed inside"], ["Head", "guards DHO, attack the big"]]],
      ["Baseline (BOB)", "#c4402f", [["Y1", ""], ["Y2", ""]]],
      ["Sideline (SOB)", "#c4402f", [["Z1", ""], ["Z2", ""], ["Z3", ""]]],
      ["Finals", "#c4402f", [["F1", ""], ["F2", ""], ["F3", ""], ["F4", ""]]],
      ["PNR guidelines", "#7d3cb3", [["Reads", "flat, red, ice"], ["Spacing", "middle, side, step"]]],
      ["Ball inside", "#c8a232", [["Split off-screen", ""], ["Feet inside", "1x1"], ["Feet outside", "dho"]]]
    ],
    Defense: [
      ["Man to man", "#2f7fd0", [["Base", "stay home on shooters"], ["Ice", "side ball screens"], ["Show", "top ball screens"], ["Switch 1 to 4", "late clock"]]],
      ["Ball screen coverage", "#27ae60", [["Ice", "force baseline"], ["Under", "vs non shooters"], ["Flat", "big drops to the level"], ["Switch", "after the second action"]]],
      ["Transition defense", "#c4402f", [["Sprint back", "two rim protectors"], ["Stop ball", "first three seconds"], ["Match up", "find your man"]]],
      ["Zone", "#7d3cb3", [["2-3", "vs bad shooting teams"], ["Box and one", "last resort"]]],
      ["Out of bounds", "#c8a232", [["Switch all", "last 5 seconds"], ["Face guard", ""]]]
    ],
    ATOs: [["ATO's", "#c8a232", [["ATO1", ""], ["ATO2", ""], ["ATO3", ""], ["ATO4", ""]]]]
  };

  // ---- set table (half court, transition, SLOB, BLOB, ATO)
  const nm = [
    ["H1A", "", "Half court", "", 30], ["H0", "", "Half court", "", 17], ["H1E", "", "Half court", "", 14], ["H2A", "", "Half court", "", 9],
    ["H5A", "", "Half court", "", 9], ["H3A", "", "Half court", "", 8], ["H1C", "", "Half court", "", 8],
    ["T1", "", "Transition", "", 16], ["T3", "", "Transition", "", 39], ["T5", "", "Transition", "", 7],
    ["S5", "", "SLOB", "", 11], ["S1", "", "SLOB", "", 10], ["S3", "", "SLOB", "", 9],
    ["B2", "", "BLOB", "", 6], ["B1", "", "BLOB", "", 5],
    ["A1", "", "ATO", "", 4], ["A2", "", "ATO", "", 3]
  ];
  const adj = ["Our rules", "Switch the 1 to 4", "Ice the ball screen", "Stay home on shooters", "Rare set", "Our rules, they play a few"];
  H.setTable = nm.map((s, i) => ({ code: s[0], name: s[1], cat: s[2], call: s[3], use: s[4], ppp: r(0.78, 1.55, 2), vol: Math.round(s[4] / 2.4), last4: [r(0, 7, 0), r(0, 7, 0), r(0, 7, 0), r(0, 7, 0)].map(Math.round), adj: adj[i % adj.length], star: i % 3 === 0 }));

  // ---- standings (sample around the real record) + fixtures labels
  H.standing = [["Sabah BK", 4, 3, 1, 8], ["LIO Lions", 3, 2, 1, 4], ["NTD", 3, 1, 2, -6], ["Nakhchivan", 3, 2, 1, 5]];
  H.formDots = id => (id === "SBK" ? "wlwlw" : id === "NAK" ? "wwlwl" : "wlwwl").split("");

  // ---- player development table (sample)
  H.devTable = H.dev.map(p => {
    const S = H.sample["P" + p.id], m = (v, d) => ({ v, d, s: Array.from({ length: 6 }, () => r(v * 0.6, v * 1.3, 1)) });
    return { id: p.id, n: p.n, name: p.name, goal: p.goals[0], gp: 4, min: S.min, cols: { Minutes: m(S.min, +r(-3, 4, 1)), Points: m(S.pts, +r(-4, 5, 1)), "TS%": m(S.ts, +r(-6, 6, 0)), Assists: m(S.ast, +r(-1, 2, 1)), Rebounds: m(S.reb, +r(-2, 2, 1)), PIR: m(+(S.pts + S.reb + S.ast).toFixed(1), +r(-5, 5, 1)), "Net rtg": m(r(-12, 12, 1), +r(-10, 10, 1)) } };
  });
  H.sources.extra = "sample";
})();
