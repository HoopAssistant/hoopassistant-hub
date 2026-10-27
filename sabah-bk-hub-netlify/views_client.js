/* Client data: anonymized Nacsport exports (post game, pre game, training). Parsed in the browser, so a CSV loaded from a file or synced
   from a published Google Sheet goes through exactly the same code as the built in sessions. */
window.HUB.V2s.push(function (K) {
  const { esc, H, card, kpi, head, hbars, ls } = K;
  const SRC = "sbk_client_src", SYNC = "sbk_client_sync", EXTRA = "sbk_client_extra";
  const MAXROWS = 5000, MAXCSV = 2000000, SYNC_MS = 5 * 60 * 1000;
  const TYPES = { post: "Post game", pre: "Pre game", training: "Training" };
  const obj = x => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
  const arr = x => (Array.isArray(x) ? x : []);
  const S = { filter: {}, lim: {}, busy: {}, msg: {}, fail: {} };

  // ---------- CSV parsing: BOM, CRLF / CR / LF, quotes, comma / semicolon / tab
  const parseCsv = text => {
    let t = String(text || "").replace(/^﻿/, ""); if (t.length > MAXCSV) t = t.slice(0, MAXCSV);
    const first = t.split(/\r\n|\r|\n/, 1)[0] || "", sep = [",", ";", "\t"].map(c => [c, first.split(c).length]).sort((a, b) => b[1] - a[1])[0][0];
    const rows = []; let row = [], cur = "", q = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"' && cur === "") q = true;
      else if (c === sep) { row.push(cur); cur = ""; }
      else if (c === "\r" || c === "\n") { if (c === "\r" && t[i + 1] === "\n") i++; row.push(cur); cur = ""; if (row.some(x => x !== "")) rows.push(row); row = []; if (rows.length > MAXROWS + 1) break; }
      else cur += c;
    }
    if (cur !== "" || row.length) { row.push(cur); if (row.some(x => x !== "")) rows.push(row); }
    return rows;
  };
  const fold = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const secs = s => { const m = /^(?:(\d{1,3}):)?(\d{1,3}):(\d{2})(?:\.\d+)?$/.exec(String(s || "").trim()); if (!m) return null; return (m[1] ? +m[1] * 3600 : 0) + (+m[2]) * 60 + +m[3]; };
  const mmss = n => { n = Math.max(0, Math.round(n || 0)); const h = Math.floor(n / 3600), m = Math.floor(n % 3600 / 60), s = n % 60; return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0"); };
  const clean = s => String(s || "").replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
  const strip = s => clean(s).replace(/^#[A-Z0-9]+\s+/, "");

  // rows -> clips. A clip: [start, end, category, quarter, zone, [players], [other tags]]
  const normalize = rows => {
    rows = arr(rows); if (!rows.length) return { clips: [], bad: 0, ok: false };
    const hd = rows[0].map(fold), find = (names, d) => { const i = hd.findIndex(h => names.indexOf(h) >= 0); return i >= 0 ? i : d; };
    const iS = find(["inicio", "start", "begin"], 0), iE = find(["fin", "end"], 1), iC = find(["categoria", "category"], 2), iD = find(["descriptores", "descriptors", "descripcion"], 3);
    const known = hd.some(h => ["inicio", "start", "categoria", "category"].indexOf(h) >= 0), body = known || secs(rows[0][iS]) == null ? rows.slice(1) : rows;
    const clips = []; let bad = 0;
    for (const r of body) {
      const a = secs(r[iS]), b = secs(r[iE]); if (a == null || b == null || b < a) { bad++; continue; }
      let qt = "", zone = "", pl = [], tags = [];
      for (const raw of String(r[iD] || "").split(/\s+-\s+/)) {
        const t = strip(raw); if (!t) continue;
        let m;
        if ((m = /^(?:J\d+\s+)?((?:Own|Opp)\s+\w+)$/.exec(clean(raw).replace(/^#/, ""))) || (m = /^((?:Own|Opp)\s+\w+)$/.exec(t))) { pl.indexOf(m[1]) < 0 && pl.push(m[1]); }
        else if (/^(\d)Q$|^OT\d?$/.test(t)) qt = t;
        else if (/^[CM][1-3]$/.test(t)) zone = zone || t;
        else if (tags.indexOf(t) < 0) tags.push(t);
      }
      clips.push([a, b, strip(r[iC]) || "(none)", qt, zone, pl, tags]);
      if (clips.length >= MAXROWS) break;
    }
    return { clips, bad, ok: clips.length > 0 };
  };

  // ---------- sessions: built in + files loaded by the user; the newest synced copy wins
  const builtin = () => arr(obj(H.client).sessions);
  const extras = () => arr(ls.get(EXTRA)).filter(x => x && typeof x.id === "string" && typeof x.csv === "string");
  const syncs = () => obj(ls.get(SYNC)), urls = () => obj(ls.get(SRC));
  const sessions = () => builtin().concat(extras().map(x => Object.assign({}, x, { extra: true })));
  const CACHE = {};
  const data = s => { const sy = obj(syncs()[s.id]), csv = typeof sy.csv === "string" ? sy.csv : s.csv, key = s.id + ":" + csv.length + ":" + (sy.ts || 0), c = CACHE[s.id]; if (c && c.key === key) return c.v; const v = Object.assign(normalize(parseCsv(csv)), { synced: sy.ts || 0 }); CACHE[s.id] = { key, v }; return v; };

  // ---------- statistics
  const count = (list, f) => { const m = {}; for (const x of list) for (const k of f(x)) m[k] = (m[k] || 0) + 1; return Object.keys(m).map(k => [k, m[k]]).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)); };
  const bars = (rows, n, col) => rows.length ? hbars(rows.slice(0, n).map(([k, v]) => ({ k: esc(k), v, c: col })), {}) : '<p class="note">No data.</p>';
  const filt = (clips, f) => clips.filter(c => (!f.q || c[3] === f.q) && (!f.cat || c[2] === f.cat) && (f.pl || []).every(p => c[5].indexOf(p) >= 0));
  const FK = id => S.filter[id] || (S.filter[id] = { pl: [], cat: "", q: "" });

  // ---------- views
  const status = id => S.msg[id] ? `<p class="note" role="status">${esc(S.msg[id])}</p>` : "";
  const sourcesCard = () => {
    const u = urls(), sy = syncs();
    const rows = sessions().map(s => { const d = data(s), t = obj(sy[s.id]).ts; return `<tr><td><b>${esc(s.label)}</b><br><small class="mut">${esc(TYPES[s.type] || s.type)} · ${d.clips.length} clips${d.bad ? ` · ${d.bad} rows skipped` : ""}${t ? " · synced " + esc(new Date(t).toLocaleString()) : " · built in copy"}</small></td>
      <td><input class="clurl" type="url" inputmode="url" maxlength="600" placeholder="Published Google Sheet CSV link" aria-label="Google Sheet CSV link for ${esc(s.label)}" data-inp="clurl" data-id="${esc(s.id)}" value="${esc(u[s.id] || "")}"></td>
      <td><button class="mbtn" data-act="clsync" data-id="${esc(s.id)}" ${S.busy[s.id] ? "disabled" : ""}>${S.busy[s.id] ? "Syncing..." : "Sync"}</button>${s.extra ? ` <button class="mbtn" data-act="cldel" data-id="${esc(s.id)}">Remove</button>` : ""}</td></tr>${S.msg[s.id] ? `<tr><td colspan="3">${status(s.id)}</td></tr>` : ""}`; }).join("");
    return card("Data sources", `<p class="note">Each session can read a Google Sheet tab published as CSV (File, Share, Publish to web, pick the tab, format CSV). The link is read when you open this page and at most every 5 minutes. Upload only anonymized files: a published link is readable by anyone who has it.</p>
      <table class="dense clsrc"><tr><th>Session</th><th>Link</th><th></th></tr>${rows}</table>
      <div class="ctrlrow" style="margin-top:12px"><button class="mbtn p" data-act="clsyncall">Sync all</button>
      <label class="gpl"><b>Load a CSV from this computer</b><span class="note"> (Nacsport export: Inicio, Fin, Categoría, Descriptores. UTF-8, Latin-1, comma or semicolon)</span><br>
      <select data-chg="cltype" aria-label="Type of session to load"><option value="post">Post game</option><option value="pre">Pre game</option><option value="training">Training</option></select>
      <input type="file" accept=".csv,text/csv,text/plain" data-chg="clfile" aria-label="Choose a CSV file"></label></div>${status("_file")}`, "client");
  };
  const aggregate = list => { const all = [].concat(...list.map(s => data(s).clips)); return all; };
  const index = () => {
    const ss = sessions(), pre = ss.filter(s => s.type === "pre"), tr = ss.filter(s => s.type === "training"), post = ss.filter(s => s.type === "post");
    const link = s => `<a class="lnk" href="#/client/${esc(s.id)}"><b>${esc(s.label)}</b></a>`;
    const tbl = l => `<table class="dense"><tr><th>Session</th><th>Team</th><th class="n">Clips</th><th class="n">Clip time</th><th class="n">Avg clip</th></tr>${l.map(s => { const d = data(s), tot = d.clips.reduce((a, c) => a + (c[1] - c[0]), 0); return `<tr><td>${link(s)}</td><td>${esc(s.team || "")}</td><td class="n">${d.clips.length}</td><td class="n">${mmss(tot)}</td><td class="n">${d.clips.length ? Math.round(tot / d.clips.length) + " s" : ""}</td></tr>`; }).join("")}</table>`;
    const grp = (title, l, empty) => card(title, l.length ? tbl(l) : `<p class="note">${empty}</p>`, "client", "", String(l.length));
    const list = grp("Our team: post game", post, "Load a post game CSV below.") + grp("Rival: pre game", pre, "Load a pre game CSV below.") + grp("Training", tr, "Load a training CSV below.");
    let scout = "";
    if (pre.length) { const all = aggregate(pre), n = pre.length;
      scout = card(`Scouting summary, ${esc(pre[0].team || "rival")}, ${n} game${n > 1 ? "s" : ""}`, `<div class="grid g2"><div><h3>Most used sets and actions</h3>${bars(count(all, c => [c[2]]), 12, "#2f5bd0")}</div><div><h3>Players involved</h3>${bars(count(all, c => c[5]), 10, "#b5373a")}</div></div><div class="grid g2" style="margin-top:12px"><div><h3>By quarter</h3>${bars(count(all, c => c[3] ? [c[3]] : []), 6, "#1a7d52")}</div><div><h3>By zone</h3>${bars(count(all, c => c[4] ? [c[4]] : []), 6, "#8a6b00")}</div></div>`, "client"); }
    let cmp = "";
    if (tr.length > 1) { const cats = count(aggregate(tr), c => [c[2]]).map(x => x[0]).slice(0, 10), cs = tr.map(s => Object.fromEntries(count(data(s).clips, c => [c[2]])));
      cmp = card("Training comparison", `<table class="dense"><tr><th>Category</th>${tr.map(s => `<th class="n">${esc(s.label.replace("Training ", ""))}</th>`).join("")}</tr>${cats.map(k => `<tr><td>${esc(k)}</td>${cs.map(m => `<td class="n">${m[k] || 0}</td>`).join("")}</tr>`).join("")}</table>`, "client"); }
    return head("client", "Client Data", '<span class="note">Anonymized test data from a real client</span>') + `<div class="wm">Real tagging exports (Nacsport) with player and team names replaced by aliases: Own = your team, Opp = the scouted rival, Rival 1 and 2, Opponent A to C.</div>` + list + scout + cmp + sourcesCard();
  };
  const detail = id => {
    const s = sessions().find(x => x.id === id); if (!s) return `<div class="sb"><h2>Not found</h2><p>That session does not exist. <a class="lnk" href="#/client">Back to Client Data</a></p></div>`;
    const d = data(s), f = FK(id), all = d.clips, fl = filt(all, f), tot = fl.reduce((a, c) => a + (c[1] - c[0]), 0);
    const players = count(all, c => c[5]).map(x => x[0]), cats = count(all, c => [c[2]]), qs = count(all, c => c[3] ? [c[3]] : []);
    const chips = players.map(p => `<a class="fchip ${f.pl.indexOf(p) >= 0 ? "on" : ""}" data-act="clpl" data-id="${esc(id)}" data-p="${esc(p)}" role="button" aria-pressed="${f.pl.indexOf(p) >= 0}">${esc(p)}</a>`).join("");
    const lim = S.lim[id] || 60;
    const tops = count(fl, c => c[6]).slice(0, 12);
    const rows = fl.slice(0, lim).map(c => `<tr><td class="n">${mmss(c[0])}</td><td class="n">${mmss(c[1] - c[0])}</td><td>${esc(c[2])}</td><td>${esc(c[3])}</td><td>${esc(c[4])}</td><td>${c[5].map(esc).join(", ")}</td><td>${c[6].map(esc).join(" · ")}</td></tr>`).join("");
    return head("client", esc(s.label), `<a class="btn" href="#/client">‹ All sessions</a>`) + `<div class="wm">${esc(TYPES[s.type] || s.type)} · ${esc(s.team || "")} · anonymized test data${d.synced ? " · synced " + esc(new Date(d.synced).toLocaleString()) : ""}${d.bad ? ` · ${d.bad} rows skipped` : ""}</div>` + status(id)
      + `<div class="grid g4" style="margin-bottom:14px">${kpi("Clips", fl.length + (fl.length !== all.length ? " of " + all.length : ""))}${kpi("Clip time", mmss(tot))}${kpi("Average clip", fl.length ? Math.round(tot / fl.length) + " s" : "0 s")}${kpi("Players tagged", players.length)}</div>`
      + card("Filters", `<div class="ctrlrow"><label>Category <select data-chg="clcat" data-id="${esc(id)}" aria-label="Category filter"><option value="">All</option>${cats.map(([k, v]) => `<option value="${esc(k)}" ${f.cat === k ? "selected" : ""}>${esc(k)} (${v})</option>`).join("")}</select></label>
        <label>Quarter <select data-chg="clq" data-id="${esc(id)}" aria-label="Quarter filter"><option value="">All</option>${qs.map(([k]) => `<option value="${esc(k)}" ${f.q === k ? "selected" : ""}>${esc(k)}</option>`).join("")}</select></label>
        ${f.pl.length || f.cat || f.q ? `<button class="mbtn" data-act="clreset" data-id="${esc(id)}">Clear filters</button>` : ""}</div>
        <p class="note">Pick one or more players: only clips where all of them appear are kept (pairs and trios).</p><div class="fchips">${chips || '<span class="note">No players tagged.</span>'}</div>`, "client")
      + `<div class="grid g2">${card("Categories", bars(count(fl, c => [c[2]]), 12, "#2f5bd0"), "client")}${card("Tags and actions", bars(tops, 12, "#1a7d52"), "client")}</div>`
      + `<div class="grid g2">${card("Quarter", bars(count(fl, c => c[3] ? [c[3]] : []), 6, "#8a6b00"), "client")}${card("Zone", bars(count(fl, c => c[4] ? [c[4]] : []), 6, "#b5373a"), "client")}</div>`
      + card("Clips", fl.length ? `<div class="tw"><table class="dense"><tr><th class="n">Start</th><th class="n">Length</th><th>Category</th><th>Q</th><th>Zone</th><th>Players</th><th>Tags</th></tr>${rows}</table></div>${fl.length > lim ? `<p class="note">Showing ${lim} of ${fl.length}. <a class="lnk" data-act="clmore" data-id="${esc(id)}">Show 60 more</a></p>` : ""}` : '<p class="note">No clips match these filters.</p>', "client", "", String(fl.length));
  };
  const client = (a, b) => { sync(null, false); return a ? detail(a) : index(); };

  // ---------- actions
  const F = el => FK(el.dataset.id);
  H.acts.clpl = el => { const f = F(el), p = el.dataset.p, i = f.pl.indexOf(p); if (i >= 0) f.pl.splice(i, 1); else f.pl.push(p); S.lim[el.dataset.id] = 60; return "render"; };
  H.acts.clreset = el => { S.filter[el.dataset.id] = null; S.lim[el.dataset.id] = 60; return "render"; };
  H.acts.clmore = el => { S.lim[el.dataset.id] = (S.lim[el.dataset.id] || 60) + 60; return "render"; };
  H.inputs.clcat = el => { F(el).cat = el.value; S.lim[el.dataset.id] = 60; K.render(); };
  H.inputs.clq = el => { F(el).q = el.value; S.lim[el.dataset.id] = 60; K.render(); };
  H.inputs.clurl = el => { const id = el.dataset.id, u = obj(urls()); const v = el.value.trim(); if (v) u[id] = v; else delete u[id]; ls.set(SRC, u); };
  H.inputs.cltype = () => {};
  const okUrl = v => { try { const u = new URL(v); return u.protocol === "https:" && u.hostname === "docs.google.com" && /^\/spreadsheets\//.test(u.pathname) ? u.href : ""; } catch (e) { return ""; } };
  const sync = async (id, force) => {
    const u = obj(urls()), sy = obj(syncs()), ids = id ? [id] : Object.keys(u).filter(k => sessions().some(s => s.id === k)); let did = false;
    for (const k of ids) {
      if (S.busy[k]) continue; const link = okUrl(u[k]); if (!link) { if (u[k] && force) { S.msg[k] = "Only https links from docs.google.com/spreadsheets are accepted."; K.render(); } continue; }
      if (!force && ((obj(sy[k]).ts && Date.now() - obj(sy[k]).ts < SYNC_MS) || (S.fail[k] && Date.now() - S.fail[k] < SYNC_MS))) continue;
      did = true; S.busy[k] = true; const ac = typeof AbortController === "function" ? new AbortController() : null, to = setTimeout(() => ac && ac.abort(), 10000);
      try {
        const r = await fetch(link, { credentials: "omit", referrerPolicy: "no-referrer", cache: "no-store", signal: ac ? ac.signal : undefined });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const txt = await r.text(); if (txt.length > MAXCSV) throw new Error("file too large");
        if (/^\s*<(!doctype|html)/i.test(txt)) throw new Error("the link is not a published CSV");
        const n = normalize(parseCsv(txt)); if (!n.ok) throw new Error("no valid clips found (needs Inicio, Fin, Categoría, Descriptores)");
        const cur = obj(syncs()); cur[k] = { csv: txt, ts: Date.now() }; if (ls.set(SYNC, cur)) S.msg[k] = "Synced " + n.clips.length + " clips" + (n.bad ? ", " + n.bad + " rows skipped" : "") + "."; else S.msg[k] = "Synced but could not be saved (storage full).";
        delete CACHE[k];
      } catch (e) { S.fail[k] = Date.now(); S.msg[k] = "Sync failed (" + (e && e.name === "AbortError" ? "timeout" : (e && e.message) || "network") + "). Showing the last saved copy."; }
      clearTimeout(to); S.busy[k] = false;
    }
    if (did) K.render();
  };
  H.acts.clsync = el => { sync(el.dataset.id, true); return false; };
  H.acts.clsyncall = () => { sync(null, true); return false; };
  H.acts.cldel = el => { const id = el.dataset.id; ls.set(EXTRA, extras().filter(x => x.id !== id)); const u = obj(urls()); delete u[id]; ls.set(SRC, u); const sy = obj(syncs()); delete sy[id]; ls.set(SYNC, sy); delete CACHE[id]; return "render"; };
  const decode = buf => { try { return new TextDecoder("utf-8", { fatal: true }).decode(buf); } catch (e) { return new TextDecoder("windows-1252").decode(buf); } };
  H.inputs.clfile = el => {
    const f = el.files && el.files[0]; if (!f) return; const type = (el.closest("label").querySelector("select") || {}).value || "post";
    const done = m => { S.msg._file = m; el.value = ""; K.render(); };
    if (f.size > MAXCSV) return done("That file is too large (limit 2 MB).");
    const rd = new FileReader(); rd.onerror = () => done("The file could not be read.");
    rd.onload = () => { try {
      const txt = decode(rd.result), n = normalize(parseCsv(txt)); if (!n.ok) return done("No valid clips found. The file needs the columns Inicio, Fin, Categoría, Descriptores.");
      const ex = extras(), all = sessions().length; if (ex.length >= 12) return done("Too many loaded files. Remove one first.");
      const label = clean(f.name.replace(/\.[^.]+$/, "")).slice(0, 60) || "Loaded file", id = "X" + Date.now().toString(36) + ex.length;
      ex.push({ id, type: ["post", "pre", "training"].indexOf(type) >= 0 ? type : "post", label, team: "", csv: txt });
      done(ls.set(EXTRA, ex) ? "Loaded " + n.clips.length + " clips" + (n.bad ? ", " + n.bad + " rows skipped" : "") + "." : "Could not save the file (storage full).");
    } catch (e) { done("The file could not be read."); } };
    rd.readAsArrayBuffer(f);
  };
  return { client };
});
