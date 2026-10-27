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
      ["Secondary break", "#2f7fd0", [["Punch", "Step with PG, others split off screen"], ["7 / 7 Clear", ""], ["5 Side", "Off screens"], ["5 Zoom", "DHO + PnR middle"], ["5 Dribble", "Cut + DHO"], ["54", "Flare"]]],
      ["1 Series", "#27ae60", [["1", "ghost 1-2"], ["15", "ghost veer + ghost"]]],
      ["2 Series", "#27ae60", [["2 Low", ""], ["2 Flash", "spain flare"], ["2 Down", ""], ["2 C", "twist with the 4 + double drag"], ["2 Special", "PnR last + off screen"], ["2 Side", "double exit"]]],
      ["3 Series", "#27ae60", [["3", "side PnR / step up PnR"], ["3 C", "curl the 3 + flare, 4 + 1-5 middle PnR"], ["3 Side", "fake step + off screen / veer"], ["3 Down", "spain PnR"]]],
      ["Elbow Series", "#27ae60", [["Elbow 4", "DH 1-4-5"], ["Elbow Vueltas", "back pick 1-3 + DHO PnR"], ["Elbow Dribble", "DHO + PnR 2-3"], ["Elbow 5", ""], ["Elbow 2", "DH 1-2-5"], ["Elbow Side", "veer"]]],
      ["Chest Series", "#27ae60", [["Chest 24", "ram screen + PnR / pin down"], ["Chest 25", "ram screen + PnR / pin down"], ["Chest 45", "4 to dunker or space"], ["Chest 54", ""]]],
      ["VS Switch", "#c4402f", [["Guard mismatch", "1-on-1 perimeter"], ["Big mismatch", "1-on-1 post"], ["If 3/4 front", "flash, create triangle, feed inside"], ["Head", "guards DHO, attack the big"]]],
      ["Baseline (BOB)", "#c4402f", [["Pio Pio", ""], ["Last", ""]]],
      ["Sideline (SOB)", "#c4402f", [["3 Series", ""], ["3 Special", ""], ["Last", ""]]],
      ["Finals", "#c4402f", [["Thumb Up", ""], ["Thumbs flash", "spain flare"], ["Thumbs down", "spain"], ["Thumbs side", "veer"]]],
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
    ATOs: [["ATO's", "#c8a232", [["Ghost Flare", "three for Blakes"], ["Horns Weave", "pick and pop"], ["Box", "lob to the big"], ["Last shot", "Ghost Flare"]]]]
  };

  // ---- set table (half court, transition, SLOB, BLOB, ATO)
  const nm = [
    ["H1A", "Horns Weave + PNR", "Half court", "41", 30], ["H0", "No structure", "Half court", "", 17], ["H1E", "PnP Spanolis Step Up", "Half court", "Horns Side", 14], ["H2A", "Ghost Flare", "Half court", "Pistol", 9],
    ["H5A", "PD Entry Box to Big Pass", "Half court", "44", 9], ["H3A", "Iverson Shuffle Post Up", "Half court", "5 Down", 8], ["H1C", "Horns", "Half court", "Horns", 8],
    ["T1", "Ball Reversal DHO Step Up", "Transition", "Head", 16], ["T3", "Pistol Offense", "Transition", "Head", 39], ["T5", "Side Veer", "Transition", "Thumb side", 7],
    ["S5", "Pin Touch Flare Iso", "SLOB", "Knee", 11], ["S1", "Rip Low Post", "SLOB", "Fist", 10], ["S3", "Stagger", "SLOB", "Double Fist", 9],
    ["B2", "Box Lob", "BLOB", "Box", 6], ["B1", "Stack Pop", "BLOB", "Stack", 5],
    ["A1", "Ghost Flare Three", "ATO", "Ghost", 4], ["A2", "Horns Weave Pop", "ATO", "Weave", 3]
  ];
  const adj = ["Weavers be aggressive + PNR our rules", "Same as our 7 but 4-5, our rules. Deny at crazy 5 or stepup PG.", "Attack or under? You say you want to play it different. I think should be under + PNR rule.", "Same as our 1. Flare between 1-2-5, always 5 screener, over/under + flat high, mentality destroys gaps.", "Rare set", "BP our rules, stay to destroy post up necessary STS switch 4", "#33 GIBSON aggressive 1x1, PNR more aggressive here to ball", "Our rules, they play a few"];
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
