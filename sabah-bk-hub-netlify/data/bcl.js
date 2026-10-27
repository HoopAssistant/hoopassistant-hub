/* ============================================================
   Real Champions League layer for the two games Sabah BC has played.
   Everything is derived from data/bcl_real.js (built from the scraped CSVs).
   Our games G2 and G3 map to Champions League games 136223 and 136226.
   ============================================================ */
(function () {
  const H = window.HUB, R = H.R, X = H.real; if (!R) return;
  const fmtMin = s => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  H.bcl = {}; H.bclAvg = {};
  Object.entries(R.gameMap).forEach(([gid, cid]) => {
    const g = X.games.find(x => x.id === cid), us = R.teamGame(cid, "SAB"), them = R.teamGame(cid, us.opp), sh = R.shots({ gid: cid, team: "SAB" }), shO = R.shots({ gid: cid, team: us.opp });
    const row = r => ({ pid: r[0], id: R.rosterIdx(R.name(r[0])), n: X.players[r[0]].num, name: R.name(r[0]), min: fmtMin(r[2]), sec: r[2], pts: r[3], fgm: r[4], fga: r[5], tpm: r[6], tpa: r[7], ftm: r[8], fta: r[9], reb: r[10] + r[11], ast: r[12], to: r[13], stl: r[14], blk: r[15], pf: r[16], pm: r[18], eff: r[19], st: r[20] });
    const rowsOf = c => X.box[cid].filter(r => r[1] === c).map(row).sort((a, b) => b.sec - a.sec);
    H.bcl[gid] = { cid, url: "https://www.championsleague.basketball/en/games/" + cid, us, them, rows: rowsOf("SAB"), orows: rowsOf(us.opp), oppName: X.teams[us.opp].name, shots: sh, shotsO: shO };
    const S = H.sample[gid]; if (!S) return;
    S.q = [us.q, us.oq];
    S.ff = [["eFG%", us.ff.efg, us.off.efg], ["Turnover %", us.ff.tov, us.off.tov], ["Offensive rebound %", us.ff.orb, us.off.orb], ["Free throw rate", us.ff.ftr, us.off.ftr]].map(([k, a, b]) => ({ k, a: +a.toFixed(1), b: +b.toFixed(1) }));
    S.mix = R.zones(sh); S.shots = R.bins(sh);
    S.top = H.bcl[gid].rows.slice().sort((a, b) => b.pts - a.pts).slice(0, 3).map(x => ({ id: x.id, pts: x.pts, reb: x.reb, ast: x.ast, min: Math.round(x.sec / 60) }));
    S.real = true;
  });
  // per player: averages and real shot charts for our squad
  R.players("SAB").forEach(p => { const idx = R.rosterIdx(p.name); if (idx < 0) return; H.bclAvg[idx] = { pid: p.pid, gp: p.gp, min: +p.min.toFixed(1), pts: +p.pts.toFixed(1), reb: +p.reb.toFixed(1), ast: +p.ast.toFixed(1), stl: +p.stl.toFixed(1), blk: +p.blk.toFixed(1), eff: +p.eff.toFixed(1), fgp: +p.fgp.toFixed(1), tpp: +p.tpp.toFixed(1), ftp: +p.ftp.toFixed(1) };
    const S = H.sample["P" + idx]; if (!S) return; const sh = R.shots({ pid: p.pid, team: "SAB" });
    S.min = H.bclAvg[idx].min; S.pts = H.bclAvg[idx].pts; S.reb = H.bclAvg[idx].reb; S.ast = H.bclAvg[idx].ast; S.fg = Math.round(p.fgp); S.tp = Math.round(p.tpp); S.ft = Math.round(p.ftp);
    if (sh.length) S.shots = R.bins(sh); S.real = true; });
  H.sources.bcl = "scrape";
})();
