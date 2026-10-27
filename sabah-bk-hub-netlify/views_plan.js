/* Game Plan (template + rotation tool), Playbook (links, images, playlist) and the clip playlist button. */
window.HUB.V2s.push(function (K) {
  const { H, card, kpi, head, chip, tn, fmt, fmtL, vs, ls, modal, closeModal, render, diagram, slug, played, next } = K, RL = H.R, RX = H.real, V = H.v2;
  const { f1, f0, f2, nm, keysFor, last, pcol } = V;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // =============== Game plan ===============
  const GPK = c => "sbk_gp_" + c;
  const emptyPlan = () => ({ g: {}, tof: [], tomin: 20, off: "", def: "", ato: "", notes: "", sets: [] });
  const getPlan = c => Object.assign(emptyPlan(), ls.get(GPK(c)) || {});
  const savePlan = (c, p) => ls.set(GPK(c), p);
  const GS = { opp: null, src: null };
  const oppList = () => { const up = H.games.filter(g => g.comp === "BCL" && !g.score).map(g => RL.map[g.opp]).filter(Boolean); return [...new Set(up.concat(RL.all.filter(c => c !== "SAB")))]; };
  const rosterOrder = () => { const m = {}; RL.players("SAB").forEach(p => { m[RL.rosterIdx(p.name)] = p.min; }); return H.roster.slice().sort((a, b) => (m[b.id] || -1) - (m[a.id] || -1)); };
  const avgMin = () => { const m = {}; RL.players("SAB").forEach(p => { m[RL.rosterIdx(p.name)] = p.min; }); return m; };
  const nxtBCL = () => H.games.find(g => g.comp === "BCL" && !g.score);
  const N = 40;
  const onFloor = (P, i) => rosterOrder().filter(r => (P.g[r.id] || [])[i]);
  const rotGrid = P => { const rows = rosterOrder(), am = avgMin();
    const cnt = i => rows.reduce((a, r) => a + ((P.g[r.id] || [])[i] ? 1 : 0), 0);
    const head1 = `<tr><th class="nm"></th>${[1, 2, 3, 4].map(q => `<th colspan="10" class="qh">Q${q}</th>`).join("")}<th class="sm">PLAN</th><th class="sm">AVG</th></tr>`;
    const head2 = `<tr><th class="nm"></th>${Array.from({ length: N }, (_, i) => `<th class="mh ${i % 10 === 0 ? "qs" : ""} ${P.tof.includes(i) ? "tof" : ""}" data-act="rottoflag" data-i="${i}" title="Click to mark a timeout in this minute">${i % 10 + 1}${P.tof.includes(i) ? "<b>TO</b>" : ""}</th>`).join("")}<th class="sm"></th><th class="sm"></th></tr>`;
    const body = rows.map(r => { const a = P.g[r.id] || [], t = a.filter(Boolean).length;
      return `<tr><th class="nm"><span>${r.n != null ? "#" + r.n : ""}</span> ${esc(last(r.name))}</th>${Array.from({ length: N }, (_, i) => `<td data-rc="${r.id},${i}" class="${a[i] ? "on" : ""} ${i % 10 === 0 ? "qs" : ""}"></td>`).join("")}<td class="sm"><b>${t}'</b></td><td class="sm mut">${am[r.id] ? f1(am[r.id]) : "·"}</td></tr>`; }).join("");
    const foot = `<tr class="cntr"><th class="nm">ON FLOOR</th>${Array.from({ length: N }, (_, i) => `<td class="${cnt(i) === 5 ? "ok" : "bad"} ${i % 10 === 0 ? "qs" : ""}">${cnt(i)}</td>`).join("")}<td class="sm"><b>${rows.reduce((a, r) => a + (P.g[r.id] || []).filter(Boolean).length, 0)}'</b></td><td class="sm mut">200'</td></tr>`;
    // five man units
    const U = {}; for (let i = 0; i < N; i++) { const on = onFloor(P, i); if (on.length !== 5) continue; const k = on.map(r => r.id).sort((a, b) => a - b).join(","); (U[k] = U[k] || { ids: on, m: 0 }).m++; }
    const units = Object.values(U).sort((a, b) => b.m - a.m).slice(0, 5);
    const bad = Array.from({ length: N }, (_, i) => i).filter(i => cnt(i) !== 5 && rows.some(r => (P.g[r.id] || [])[i])).length;
    const sum = `<div class="rotsum"><div><small>FIVE MAN UNITS, MOST MINUTES</small>${units.length ? units.map(u => `<div class="unit"><b>${u.m}'</b> ${u.ids.map(r => esc(last(r.name))).join(" · ")}</div>`).join("") : '<div class="mut">Paint minutes to see the units.</div>'}</div><div><small>CHECK</small><div class="unit ${bad ? "wr" : "okk"}">${bad ? bad + " minutes without exactly five players" : "Every painted minute has five players"}</div><div class="mut" style="margin-top:6px">Timeouts marked: ${P.tof.length ? P.tof.slice().sort((a, b) => a - b).map(i => "Q" + (Math.floor(i / 10) + 1) + " min " + (i % 10 + 1)).join(", ") : "none"}</div></div></div>`;
    return `<div class="rotwrap"><table class="gantt">${head1}${head2}${body}${foot}</table></div>${sum}`; };
  const gplan = () => {
    const nb = nxtBCL(), code = GS.opp || (nb && RL.map[nb.opp]) || "NTR"; GS.opp = code;
    const P = getPlan(code), tg = RL.teamGames("SAB");
    const L = RL.league(), U = L.SAB, T = L[code], row = (l, k, f = f1) => `<tr><td>${l}</td><td class="n"><b>${f(U[k])}</b> <small class="mut">#${RL.rank(k, "SAB")}</small></td><td class="n"><b>${f(T[k])}</b> <small class="mut">#${RL.rank(k, code)}</small></td></tr>`;
    const isNext = nb && RL.map[nb.opp] === code;
    const ctrl = `<div class="ctrl"><b>${isNext ? fmtL(nb.date).toUpperCase() + " · " : ""}${nm(code).toUpperCase()}</b><span class="pill y">${isNext ? "NEXT GAME" : "PLAN"}</span><span>OPPONENT</span><select data-chg="gpopp">${oppList().map(c => `<option value="${c}" ${c === code ? "selected" : ""}>${nm(c)}</option>`).join("")}</select><a class="btn" href="#/team/${code}">Scouting report ›</a><span class="mut">Saved on this computer</span></div>`;
    const keys = card("Key numbers", `<div class="grid g2"><div><ul class="keys">${keysFor(code).slice(0, 5).map(k => `<li>${esc(k)}</li>`).join("")}</ul></div><div><table class="dense"><tr><th></th><th class="n">US</th><th class="n">${esc(nm(code).toUpperCase())}</th></tr>${row("Offensive rating", "ortg")}${row("Defensive rating", "drtg")}${row("Pace", "pace")}${row("eFG%", "efg")}${row("Turnover %", "tov")}${row("Offensive rebound %", "orb")}</table></div></div>`, "scrape");
    const srcSel = `<select data-chg="rotsrc">${tg.slice().reverse().map(g => { const X = RX.games.find(x => x.id === g.gid); return `<option value="${g.gid}" ${GS.src === g.gid ? "selected" : ""}>${X.date.slice(5)} ${X.a === "SAB" ? "vs " + nm(X.b) : "@ " + nm(X.a)}</option>`; }).join("")}</select>`;
    const rot = card("Rotation, 40 minutes", `<div class="rotbar"><span class="mut">Drag across the grid to put a player on the floor. Click a minute number to mark a timeout.</span><span style="flex:1"></span>${srcSel}<button class="mbtn" data-act="rotload">Load that game's rotation</button><button class="mbtn" data-act="rotstart">Starters + bench template</button><button class="mbtn" data-act="rotclear">Clear</button></div><div id="rotholder">${rotGrid(P)}</div>`, "", "", "builder");
    const plans = card("Plan", `<div class="grid g2"><label class="gpl"><b>Offense</b><textarea maxlength="20000" rows="5" data-inp="gptxt" data-f="off" placeholder="How we attack them: sets, matchups, who we look for">${esc(P.off)}</textarea></label><label class="gpl"><b>Defense</b><textarea maxlength="20000" rows="5" data-inp="gptxt" data-f="def" placeholder="Coverages, who we guard how, what we take away">${esc(P.def)}</textarea></label><label class="gpl"><b>ATO and special situations</b><textarea maxlength="20000" rows="4" data-inp="gptxt" data-f="ato" placeholder="After timeout, last shot, SLOB and BLOB">${esc(P.ato)}</textarea></label><label class="gpl"><b>Notes</b><textarea maxlength="20000" rows="4" data-inp="gptxt" data-f="notes" placeholder="Anything else for the staff">${esc(P.notes)}</textarea></label></div>
      <h3 class="sh" style="margin-top:14px">Sets we call</h3><div class="chips">${H.setTable.map(s => `<a class="oc ${P.sets.includes(s.code) ? "add" : ""}" data-act="gpset" data-c="${s.code}" style="${P.sets.includes(s.code) ? "background:#111;color:#c8a232" : ""}">${s.code}${s.name ? " " + esc(s.name) : ""}</a>`).join("")}</div>
      <div class="shbar" style="margin-top:14px"><button class="p" data-act="gptimeout">Timeout card</button><button data-act="gpprint">Print / PDF</button></div>`, "");
    return head("gameplan", "Game Plan") + ctrl + keys + rot + plans;
  };
  const gp = () => getPlan(GS.opp);
  const srcGame = () => GS.src || (RL.teamGames("SAB").slice(-1)[0] || {}).gid;
  const redraw = P => { const h = document.getElementById("rotholder"); if (h) h.innerHTML = rotGrid(P); };
  // drag to paint
  let DR = null;
  const cellOf = t => t && t.closest && t.closest("[data-rc]");
  const paint = c => { if (!DR || !c) return; const [id, i] = c.dataset.rc.split(","), a = DR.P.g[id] = DR.P.g[id] || Array(N).fill(false); if (a[+i] === DR.v) return; a[+i] = DR.v; redraw(DR.P); };
  document.addEventListener("pointerdown", e => { const c = cellOf(e.target); if (!c || e.button) return; const [id, i] = c.dataset.rc.split(","), P = gp(), cur = (P.g[id] || [])[+i]; DR = { P, v: !cur }; paint(c); e.preventDefault(); });
  document.addEventListener("pointerover", e => { if (DR) paint(cellOf(e.target)); });
  document.addEventListener("pointerup", () => { if (DR) { savePlan(GS.opp, DR.P); DR = null; } });
  H.acts.rottoflag = el => { const P = gp(), i = +el.dataset.i, k = P.tof.indexOf(i); k >= 0 ? P.tof.splice(k, 1) : P.tof.push(i); savePlan(GS.opp, P); redraw(P); return false; };
  H.acts.rotclear = () => { const P = gp(); P.g = {}; P.tof = []; savePlan(GS.opp, P); return "render"; };
  H.acts.rotload = () => { const gid = srcGame(); if (!gid) return false; const P = gp(), o = {}; for (let i = 0; i < N; i++) RL.floor(gid, "SAB", i * 60 + 30).forEach(pid => { const idx = RL.rosterIdx(RL.name(pid)); if (idx < 0) return; (o[idx] = o[idx] || Array(N).fill(false))[i] = true; }); P.g = o; savePlan(GS.opp, P); return "render"; };
  // simple template: top five by minutes play 7 of 10 minutes in every quarter, the next three share the rest
  H.acts.rotstart = () => { const P = gp(), r = rosterOrder().slice(0, 9), o = {}; r.forEach(x => o[x.id] = Array(N).fill(false));
    const pat = [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [5, 1, 2, 6, 4], [5, 6, 2, 7, 8], [5, 6, 7, 8, 3], [0, 6, 7, 8, 3], [0, 1, 7, 3, 4], [0, 1, 2, 3, 4]];
    for (let q = 0; q < 4; q++) pat.forEach((p, m) => p.forEach(k => { if (r[k]) o[r[k].id][q * 10 + m] = true; })); P.g = o; savePlan(GS.opp, P); return "render"; };
  H.inputs.rotsrc = el => { GS.src = el.value; };
  H.acts.gpset = el => { const P = gp(), c = el.dataset.c, i = P.sets.indexOf(c); i >= 0 ? P.sets.splice(i, 1) : P.sets.push(c); savePlan(GS.opp, P); return "render"; };
  H.acts.gpprint = () => { window.print(); return false; };
  const toCard = () => { const P = gp(), code = GS.opp, mn = Math.min(N - 1, Math.max(0, (P.tomin || 20) - 1)), on = onFloor(P, mn), ks = keysFor(code).slice(0, 3);
    const tos = P.tof.slice().sort((a, b) => a - b);
    modal(`<div class="toc"><div class="tohead"><div><small>TIMEOUT CARD</small><h2>${esc(nm(code).toUpperCase())}</h2></div><div class="tosel"><small>LINEUP AT</small><select data-chg="gpto">${Array.from({ length: N }, (_, i) => `<option value="${i + 1}" ${i === mn ? "selected" : ""}>Q${Math.floor(i / 10) + 1} min ${i % 10 + 1}</option>`).join("")}</select></div></div>
      <div class="toon"><small>ON THE FLOOR</small><div>${on.length ? on.map(r => `<span class="tp">${r.n != null ? "#" + r.n : ""} ${esc(last(r.name))}</span>`).join("") : '<span class="mut">Paint the rotation to see who is on the floor.</span>'}</div></div>
      <div class="grid g3"><div><b>Offense</b>${esc(P.off) || '<span class="mut">' + esc(ks[0] || "·") + "</span>"}</div><div><b>Defense</b>${esc(P.def) || '<span class="mut">' + esc(ks[1] || "·") + "</span>"}</div><div><b>Sets</b>${P.sets.length ? P.sets.map(c => { const s = H.setTable.find(x => x.code === c); return esc(c + (s && s.name ? " " + s.name : "")); }).join("<br>") : '<span class="mut">No sets selected</span>'}</div></div>
      <div class="tofoot"><div><b>ATO</b> ${esc(P.ato) || "·"}</div>${P.notes ? `<div><b>Notes</b> ${esc(P.notes)}</div>` : ""}${tos.length ? `<div><b>Planned timeouts</b> ${tos.map(i => "Q" + (Math.floor(i / 10) + 1) + " min " + (i % 10 + 1)).join(", ")}</div>` : ""}</div></div>`); };
  H.acts.gptimeout = () => { toCard(); return false; };
  H.inputs.gpto = el => { const P = gp(); P.tomin = +el.value; savePlan(GS.opp, P); toCard(); };
  H.inputs.gptxt = el => { const P = gp(); P[el.dataset.f] = el.value; savePlan(GS.opp, P); };
  H.inputs.gpopp = el => { GS.opp = el.value; render(); };

  // =============== Playbook ===============
  const safeUrl = u => /^https?:\/\/[^\s"'<>]+$/i.test(String(u || "").trim()) ? String(u).trim() : "";
  const safeImg = u => /^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+\/=]+$/.test(String(u || "")) ? u : "";
  const col = c => /^#[0-9a-fA-F]{3,8}$/.test(String(c)) ? c : "#555";
  const PG = { cards: {}, plays: {}, list: 100 };
  let uidn = 0; const uid = () => "u" + Date.now().toString(36) + (++uidn).toString(36) + Math.random().toString(36).slice(2, 5);
  const PBK = k => "sbk_pb_" + k, PLK = "sbk_playlist";
  const RC = {}, rget = k => { let raw = null; try { raw = localStorage.getItem(k); } catch (e) {} const c = RC[k]; if (c && c.raw === raw) return c.v; const v = raw === null ? null : ls.get(k); RC[k] = { raw, v }; return v; };
  const getItem = k => Object.assign({ link: "", note: "", img: "" }, rget(PBK(k)) || {});
  const setItem = (k, v) => ls.set(PBK(k), v);
  const playlist = () => { const x = rget(PLK); return Array.isArray(x) ? x.slice() : []; };
  const inList = k => playlist().some(x => x && x.key === k);
  const ytId = u => { const m = String(u || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : ""; };
  const videoBlock = link => { if (!link) return ""; const id = ytId(link); return id ? `<div class="vwrap"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="Play video" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>` : safeUrl(link) ? `<a class="btn" href="${esc(safeUrl(link))}" target="_blank" rel="noopener noreferrer">Open video ›</a>` : `<p class="mut">${esc(link)}</p>`; };
  let IM = null; // item open in the modal
  const itemModal = (key, name, cat) => { IM = { key, name, cat }; const it = getItem(key), on = inList(key);
    modal(`<h2>${esc(name)}</h2><p class="mut" style="margin:-6px 0 10px">${esc(cat || "")}</p>
      ${videoBlock(it.link)}${safeImg(it.img) ? `<img class="pbimg" src="${safeImg(it.img)}" alt="${esc(name)}">` : ""}
      <label class="gpl"><b>Video link (YouTube or any URL)</b><input data-inp="pbf" data-f="link" value="${esc(it.link)}" placeholder="https://www.youtube.com/watch?v=..."></label>
      <label class="gpl"><b>Notes</b><textarea maxlength="20000" rows="3" data-inp="pbf" data-f="note" placeholder="Reads, coaching points, who runs it">${esc(it.note)}</textarea></label>
      <div class="mrow"><label class="mbtn up">Upload image<input type="file" accept="image/*" data-chg="pbimg" hidden></label>${it.img ? `<button data-act="pbimgdel">Remove image</button>` : ""}<button class="p" data-act="pbpl">${on ? "Remove from playlist" : "Add to playlist"}</button>${it.link ? `<button data-act="pbreload">Show video</button>` : ""}</div>
      <p class="note">Saved on this computer. In production links, images and the playlist are stored with the club account.</p>`); };
  H.inputs.pbf = el => { if (!IM) return; const it = getItem(IM.key); it[el.dataset.f] = el.value; setItem(IM.key, it); };
  H.inputs.pbimg = el => { const f = el.files[0]; if (!f || !IM) return; const rd = new FileReader(); rd.onload = () => { const im = new Image(); im.onload = () => { const s = Math.min(1, 900 / Math.max(im.width, im.height)), c = document.createElement("canvas"); c.width = im.width * s; c.height = im.height * s; c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); const it = getItem(IM.key); it.img = c.toDataURL("image/jpeg", .72); setItem(IM.key, it); itemModal(IM.key, IM.name, IM.cat); }; im.src = rd.result; }; rd.readAsDataURL(f); };
  H.acts.pbimgdel = () => { const it = getItem(IM.key); it.img = ""; setItem(IM.key, it); itemModal(IM.key, IM.name, IM.cat); return false; };
  H.acts.pbreload = () => { itemModal(IM.key, IM.name, IM.cat); return false; };
  H.acts.pbpl = () => { toggleList(IM.key, IM.name, IM.cat); itemModal(IM.key, IM.name, IM.cat); return false; };
  const toggleList = (key, name, kind) => { const l = playlist(), i = l.findIndex(x => x.key === key); i >= 0 ? l.splice(i, 1) : l.push({ key, name, kind }); ls.set(PLK, l); };
  H.acts.pbopen = el => { itemModal(el.dataset.k, el.dataset.n, el.dataset.c); return false; };
  H.acts.pldel = el => { const l = playlist(); l.splice(+el.dataset.i, 1); ls.set(PLK, l); return "render"; };
  H.acts.plup = el => { const l = playlist(), i = +el.dataset.i; if (i > 0) { [l[i - 1], l[i]] = [l[i], l[i - 1]]; ls.set(PLK, l); } return "render"; };
  H.acts.plcopy = () => { const t = playlist().map((x, i) => `${i + 1}. ${x.name}${getItem(x.key).link ? " · " + getItem(x.key).link : ""}`).join("\n"); try { navigator.clipboard.writeText(t); } catch (e) {} return false; };
  // clip modal button in app.js
  H.acts.clipPl = el => { toggleList("clip:" + el.dataset.n, el.dataset.n, "Clip"); el.textContent = inList("clip:" + el.dataset.n) ? "In playlist ✓" : "Add to playlist"; return false; };

  // editable playbook: the staff structure lives in localStorage over the built in one
  const PBS = "sbk_pbk", PE = { on: false, reset: false };
  const clone = o => JSON.parse(JSON.stringify(o));
  const pbOk = d => d && typeof d === "object" && !Array.isArray(d) && ["Offense", "Defense", "ATOs"].every(k => Array.isArray(d[k]) && d[k].every(c => Array.isArray(c) && typeof c[0] === "string" && Array.isArray(c[2])));
  const pbData = () => { const d = rget(PBS); return pbOk(d) ? d : H.pbk; };
  const pbSave = d => ls.set(PBS, d);
  const COLS = ["#2f7fd0", "#27ae60", "#d0402f", "#8e44ad", "#c8a232", "#1b2436"];
  const ikey = (tab, c, x) => x[2] || slug(tab + ":" + c[0] + ":" + x[0]);
  H.acts.pbedit = () => { PE.on = !PE.on; PE.reset = false; if (PE.on) { const d = clone(pbData()); Object.keys(d).forEach(t => d[t].forEach(c => c[2].forEach(x => { x[2] = ikey(t, c, x); }))); pbSave(d); } return "render"; };
  const mut = (el, f) => { const d = clone(pbData()); f(d[el.dataset.t]); pbSave(d); };
  H.inputs.pbtitle = el => mut(el, a => { a[+el.dataset.ci][0] = el.value; });
  H.inputs.pbname = el => mut(el, a => { a[+el.dataset.ci][2][+el.dataset.ii][0] = el.value; });
  H.inputs.pbnote = el => mut(el, a => { a[+el.dataset.ci][2][+el.dataset.ii][1] = el.value; });
  H.inputs.pbcol = el => { mut(el, a => { a[+el.dataset.ci][1] = el.value; }); render(); };
  H.acts.pbadd = el => { mut(el, a => a[+el.dataset.ci][2].push(["New play", "", uid()])); return "render"; };
  H.acts.pbdel = el => { mut(el, a => a[+el.dataset.ci][2].splice(+el.dataset.ii, 1)); return "render"; };
  H.acts.pbaddcard = el => { mut(el, a => a.push(["New group", COLS[a.length % COLS.length], [["New play", "", uid()]]])); return "render"; };
  H.acts.pbdelcard = el => { mut(el, a => a.splice(+el.dataset.ci, 1)); return "render"; };
  H.acts.pbmove = el => { mut(el, a => { const i = +el.dataset.ci, j = i + +el.dataset.d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; }); return "render"; };
  H.acts.pbreset = () => { if (!PE.reset) { PE.reset = true; return "render"; } try { localStorage.removeItem(PBS); } catch (e) {} PE.reset = false; return "render"; };
  const playbook = arg => { const tab = ["Offense", "Defense", "ATOs", "Playlist"].includes(arg) ? arg : "Offense", pl = playlist(), ed = PE.on && tab !== "Playlist";
    const tabs = `<div class="ctrlrow"><div class="tabs pill">${[["Offense", "Offense"], ["Defense", "Defense"], ["ATOs", "ATO's"], ["Playlist", "Playlist (" + pl.length + ")"]].map(([k, n]) => `<a href="#/playbook/${k}" class="${tab === k ? "on" : ""}">${n}</a>`).join("")}</div>${tab !== "Playlist" ? `<span style="flex:1"></span>${ed ? `<button class="mbtn" data-act="pbreset">${PE.reset ? "Click again to restore the original" : "Restore original"}</button>` : ""}<button class="mbtn ${ed ? "p" : ""}" data-act="pbedit">${ed ? "Done editing" : "Edit playbook"}</button>` : ""}</div>`;
    if (tab === "Playlist") return head("playbook", "Playbook") + `<div class="wm">For privacy reasons, set and play names are shown as codes. Each team can add its own names.</div>` + tabs + card("Playlist", pl.length ? `<table class="dense"><tr><th>#</th><th>Play</th><th>Type</th><th>Video</th><th></th></tr>${pl.slice(0, PG.list).map((x, i) => { const it = getItem(x.key); return `<tr><td>${i + 1}</td><td><a class="lnk" data-act="pbopen" data-k="${esc(x.key)}" data-n="${esc(x.name)}" data-c="${esc(x.kind)}"><b>${esc(x.name)}</b></a>${it.note ? `<br><small class="mut">${esc(it.note.length > 160 ? it.note.slice(0, 160) + "…" : it.note)}</small>` : ""}</td><td>${esc(x.kind)}</td><td>${it.link ? `<a class="lnk" href="${esc(safeUrl(it.link))}" target="_blank" rel="noopener noreferrer">Open ›</a>` : '<span class="mut">no link</span>'}</td><td><a data-act="plup" data-i="${i}" class="x" title="Move up">↑</a> <a data-act="pldel" data-i="${i}" class="x">×</a></td></tr>`; }).join("")}</table>${pl.length > PG.list ? `<p class="note">Showing ${PG.list} of ${pl.length}. <a class="lnk" data-act="plmore">Show 100 more</a></p>` : ""}<div class="shbar" style="margin-top:12px"><button data-act="plcopy">Copy list</button><button data-act="gpprint">Print / PDF</button></div>` : `<p>The playlist is empty. Open any play and press Add to playlist. It also works from the video clips in the game pages.</p>`, "");
    const D = pbData()[tab] || [];
    const CL = PG.cards[tab] || 12, PL_ = n => n, cards = D.map((c, ci) => ci >= CL ? "" : ed
      ? `<div class="pb pbe"><div class="pbh" style="background:${col(c[1])}"><input class="pbti" data-inp="pbtitle" data-t="${tab}" data-ci="${ci}" value="${esc(c[0])}"><select data-chg="pbcol" data-t="${tab}" data-ci="${ci}">${COLS.map(k => `<option value="${k}" ${k === col(c[1]) ? "selected" : ""} style="background:${k};color:#fff">●</option>`).join("")}</select><a class="x" data-act="pbmove" data-t="${tab}" data-ci="${ci}" data-d="-1" title="Move up">↑</a><a class="x" data-act="pbmove" data-t="${tab}" data-ci="${ci}" data-d="1" title="Move down">↓</a><a class="x" data-act="pbdelcard" data-t="${tab}" data-ci="${ci}" title="Delete group">×</a></div><ul>${c[2].slice(0, PG.plays[tab + ci] || 20).map((x, ii) => { const key = ikey(tab, c, x), it = getItem(key); return `<li class="pbrow"><input class="pbn" data-inp="pbname" data-t="${tab}" data-ci="${ci}" data-ii="${ii}" value="${esc(x[0])}"><input class="pbd" data-inp="pbnote" data-t="${tab}" data-ci="${ci}" data-ii="${ii}" value="${esc(x[1])}" placeholder="note"><a class="x" data-act="pbopen" data-k="${esc(key)}" data-n="${esc(x[0])}" data-c="${esc(c[0])}" title="Link, image, notes">${it.link || it.img ? "▶" : "+"}</a><a class="x" data-act="pbdel" data-t="${tab}" data-ci="${ci}" data-ii="${ii}" title="Delete">×</a></li>`; }).join("")}${c[2].length > (PG.plays[tab + ci] || 20) ? `<li><a class="lnk" data-act="pbmoreplays" data-k="${esc(tab + ci)}">Show more plays (${c[2].length - (PG.plays[tab + ci] || 20)} hidden)</a></li>` : ""}<li><button class="mbtn" data-act="pbadd" data-t="${tab}" data-ci="${ci}">+ Add play</button></li></ul></div>`
      : `<div class="pb"><h3 style="background:${col(c[1])}">${esc(c[0])}</h3><ul>${c[2].slice(0, PG.plays[tab + ci] || 20).map(x => { const key = ikey(tab, c, x), it = getItem(key); return `<li class="ck" data-act="pbopen" data-k="${esc(key)}" data-n="${esc(x[0])}" data-c="${esc(c[0])}"><b>${esc(x[0])}</b> <span class="mut">${esc(x[1])}</span>${it.link ? ' <span class="dotv" title="has video">▶</span>' : ""}${it.img ? ' <span class="dotv" title="has image">▣</span>' : ""}${inList(key) ? ' <span class="dotv" title="in playlist">★</span>' : ""}</li>`; }).join("")}${c[2].length > (PG.plays[tab + ci] || 20) ? `<li><a class="lnk" data-act="pbmoreplays" data-k="${esc(tab + ci)}">Show more plays (${c[2].length - (PG.plays[tab + ci] || 20)} hidden)</a></li>` : ""}</ul></div>`).join("") + (D.length > CL ? `<div class="pb pbadd"><a class="lnk" data-act="pbmorecards" data-t="${esc(tab)}">Show more groups (${D.length - CL} hidden)</a></div>` : "");
    return head("playbook", "Playbook") + `<div class="wm">For privacy reasons, set and play names are shown as codes. Each team can add its own names.</div>` + tabs + `<div class="pbk">${cards}${ed ? `<div class="pb pbadd"><button class="mbtn p" data-act="pbaddcard" data-t="${tab}">+ Add group</button></div>` : ""}</div>` + (tab === "Offense" && !ed ? `<h3 class="sh" style="margin-top:22px">Key sets</h3><div class="grid g3">${H.sets.map(s => `<a class="setc" href="#/set/${s.code}">${diagram(s)}<div><b>${s.code}${s.name ? " · " + esc(s.name) : ""}</b><small>${s.desc}</small></div></a>`).join("")}</div>` : "");
  };
  const set = code => { const s = H.sets.find(x => x.code === code); if (!s) return playbook(); const key = "set:" + s.code, it = getItem(key);
    return head("set", `${s.code}${s.name ? " · " + esc(s.name) : ""}`, `<a class="btn" href="#/playbook">‹ Playbook</a> `) + `<div class="grid g2">${card("Diagram", safeImg(it.img) ? `<img class="pbimg" src="${safeImg(it.img)}" alt="">` : diagram(s), "")}
      <div>${card("Set", `<p>${s.desc}</p>${videoBlock(it.link)}<div class="shbar"><button data-act="pbopen" data-k="${esc(key)}" data-n="${esc(s.code + (s.name ? " " + s.name : ""))}" data-c="Key set">Link, image and notes</button><button data-act="pbtoggle" data-k="${esc(key)}" data-n="${esc(s.code + (s.name ? " " + s.name : ""))}">${inList(key) ? "Remove from playlist" : "Add to playlist"}</button></div>${it.note ? `<p class="note">${esc(it.note)}</p>` : ""}`, "")}</div></div>`; };
  H.acts.plmore = () => { PG.list += 100; return "render"; };
  H.acts.pbmoreplays = el => { PG.plays[el.dataset.k] = (PG.plays[el.dataset.k] || 20) + 100; return "render"; };
  H.acts.pbmorecards = el => { PG.cards[el.dataset.t] = (PG.cards[el.dataset.t] || 12) + 12; return "render"; };
  H.acts.pbtoggle = el => { toggleList(el.dataset.k, el.dataset.n, "Key set"); return "render"; };
  return { gameplan: gplan, playbook, set };
});
