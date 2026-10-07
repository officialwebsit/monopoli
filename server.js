// Petualangan Matematika Online – server tanpa dependensi. Jalankan: node server.js
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const { T, Q, MIS, BON } = require('./data');
const PORT = process.env.PORT || 3000;
const ICONS = ["👦🏻", "👧🏻", "👦🏽", "👧🏽", "🧒🏼", "👦🏿", "👧🏿", "🧒🏽"];
const games = {};

/* ---------- template materi (disimpan di templates.json) ---------- */
const DIR = process.env.DATA_DIR || __dirname, TF = path.join(DIR, 'templates.json'), PIN = process.env.GURU_PIN || '';
let TPL = []; try { TPL = JSON.parse(fs.readFileSync(TF, 'utf8')); } catch (e) { }
const saveTpl = () => { try { fs.writeFileSync(TF, JSON.stringify(TPL)); } catch (e) { console.log('Gagal menyimpan template:', e.message); } };
const sx = (x, n) => String(x == null ? '' : x).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim().slice(0, n);
function clean(qs) {
  if (!Array.isArray(qs) || qs.length < 3 || qs.length > 100) throw new Error('Minimal 3 soal (maksimal 100)');
  return qs.map((x, i) => {
    const q = sx(x.q, 300), o = (Array.isArray(x.o) ? x.o : []).map(v => sx(v, 120)).filter(Boolean).slice(0, 4);
    if (!q) throw new Error(`Soal ${i + 1}: pertanyaan masih kosong`);
    if (o.length < 2) throw new Error(`Soal ${i + 1}: isi jawaban benar dan minimal 1 pilihan salah`);
    const r = { q, o, e: sx(x.e, 300) || 'Jawaban yang benar: ' + o[0] };
    const n = Array.isArray(x.f) && { r: 2, s: 1, t: 3 }[x.f[0]];
    if (n) { const l = x.f.slice(1, 1 + n).map(v => sx(v, 12)); while (l.length < n) l.push(''); r.f = [x.f[0], ...l]; }
    return r;
  });
}
const DEF = { id: 'default', name: 'Keliling Bangun Datar (bawaan)', qs: Q };
const shuf = a => a.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
const rid = () => crypto.randomBytes(6).toString('hex');

/* ---------- siaran status ke semua perangkat ---------- */
function push(g) {
  g.t = Date.now();
  const q = g.q && { title: g.q.title, icon: g.q.icon, pts: g.q.pts, pen: g.q.pen, text: g.q.text, f: g.q.f, opts: g.q.opts.map(o => o.x) };
  const base = {
    code: g.code, nq: g.qs.length, phase: g.phase, laps: g.laps, cur: g.cur, dice: g.dice, msg: g.msg, q, fb: g.fb, card: g.card,
    players: g.players.map(p => ({ name: p.name, ic: p.ic, pos: p.pos, s: p.s, on: p.on }))
  };
  g.cl.forEach(c => c.res.write('data: ' + JSON.stringify({
    ...base, me: g.players.findIndex(p => p.id === c.pid), host: !!c.hid && c.hid === g.host
  }) + '\n\n'));
}

/* ---------- aturan permainan ---------- */
function addPos(p, n) {
  const o = Math.floor(p.pos / 40);
  p.pos = Math.max(0, p.pos + n);
  if (Math.floor(p.pos / 40) > o && n > 0) p.s += 10; // bonus melewati MULAI
}
function turnMsg(g) { g.msg = `Giliran ${g.players[g.cur].name}. Lempar dadu!`; }

function roll(g) {
  const k = 1 + Math.floor(Math.random() * 6), p = g.players[g.cur];
  g.dice = k; g.phase = 'moving'; g.msg = `${p.name} melempar dadu: ${k}`; push(g);
  let n = k;
  const iv = setInterval(() => {
    addPos(p, 1);
    if (--n === 0) { clearInterval(iv); land(g, p); }
    push(g);
  }, 300);
}

function land(g, p) {
  const t = T[p.pos % 40], ty = t[0];
  g.msg = `${p.name} di ${t[1]}`;
  if (ty === 'start' || ty === 'cor') {
    p.s += 5;
    g.card = { icon: t[2], title: t[1], text: ty === 'start' ? 'Kembali ke MULAI. +5 poin' : `Istirahat sejenak di ${t[1]}. +5 poin` };
    g.phase = 'card';
  } else if (ty === 'mis' || ty === 'bon') {
    const c = shuf(ty === 'mis' ? MIS : BON)[0];
    if (c[1].p) p.s += c[1].p;
    if (c[1].m) addPos(p, c[1].m);
    g.card = { icon: t[2], title: t[1], text: c[0] };
    g.phase = 'card';
  } else {
    if (!g.deck.length) g.deck = shuf(g.qs.map((_, i) => i));
    const q = g.qs[g.deck.pop()];
    g.q = {
      title: t[1], icon: t[2], pts: ty === 'ch' ? 15 : ty === 'kt' ? 20 : 10, pen: ty === 'kt' ? 5 : 0,
      text: q.q, f: q.f, e: q.e, opts: shuf(q.o.map((x, i) => ({ x, c: i === 0 })))
    };
    g.fb = null; g.phase = 'question';
  }
}

function endTurn(g) {
  g.q = null; g.fb = null; g.card = null;
  if (g.players[g.cur].pos >= g.laps * 40) g.final = true;
  g.cur = (g.cur + 1) % g.players.length;
  if (g.final && g.cur === 0) { g.phase = 'over'; g.msg = 'Permainan selesai!'; }
  else { g.phase = 'roll'; turnMsg(g); }
}

/* ---------- API ---------- */
function api(url, j, res) {
  const out = (c, o) => { res.writeHead(c, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
  const err = (c, m) => out(c, { err: m });
  if (url === '/api/create' || url.startsWith('/api/tpl/')) {
    if (PIN && String(j.pin || '') !== PIN) return err(401, 'PIN guru salah');
  }
  if (url === '/api/tpl/list') return out(200, [DEF, ...TPL].map(t => ({ id: t.id, name: t.name, n: t.qs.length })));
  if (url === '/api/tpl/get') {
    const t = j.id === 'default' ? DEF : TPL.find(x => x.id === j.id);
    return t ? out(200, t) : err(404, 'Materi tidak ditemukan');
  }
  if (url === '/api/tpl/save') {
    try {
      const qs = clean(j.qs), name = sx(j.name, 60) || 'Materi tanpa nama';
      let t = TPL.find(x => x.id === j.id);
      if (t) { t.name = name; t.qs = qs; } else { t = { id: rid(), name, qs }; TPL.push(t); }
      saveTpl(); return out(200, { id: t.id });
    } catch (e) { return err(400, e.message); }
  }
  if (url === '/api/tpl/del') { TPL = TPL.filter(x => x.id !== j.id); saveTpl(); return out(200, { ok: 1 }); }
  if (url === '/api/create') {
    let code; do { code = String(1000 + Math.floor(Math.random() * 9000)); } while (games[code]);
    const laps = Math.min(3, Math.max(1, +j.laps || 2));
    let qs = Q; if (j.qs) { try { qs = clean(j.qs); } catch (e) { return err(400, e.message); } }
    games[code] = { code, qs, host: rid(), phase: 'lobby', laps, players: [], cur: 0, deck: [], cl: new Set(), dice: 0, msg: '', t: Date.now() };
    return out(200, { code, hid: games[code].host });
  }
  const g = games[String(j.code || '')];
  if (!g) return err(404, 'Kode tidak ditemukan');
  if (url === '/api/join') {
    const name = String(j.name || '').replace(/[<>&"'`]/g, '').trim().slice(0, 14);
    if (!name) return err(400, 'Isi namamu dulu');
    const old = g.players.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (old) return out(200, { code: g.code, pid: old.id }); // masuk kembali
    if (g.phase !== 'lobby') return err(400, 'Permainan sudah dimulai');
    if (g.players.length >= 8) return err(400, 'Permainan sudah penuh (maks. 8)');
    const p = { id: rid(), name, ic: ICONS[g.players.length], pos: 0, s: 0, on: false };
    g.players.push(p); push(g);
    return out(200, { code: g.code, pid: p.id });
  }
  const host = !!j.hid && j.hid === g.host, me = g.players.find(p => p.id === j.pid), cp = g.players[g.cur];
  const can = host || (me && me === cp);
  if (url === '/api/start' && host && g.phase === 'lobby' && g.players.length) { g.cur = 0; g.final = false; g.phase = 'roll'; turnMsg(g); }
  else if (url === '/api/roll' && can && g.phase === 'roll') roll(g);
  else if (url === '/api/answer' && me && me === cp && g.phase === 'question') {
    const o = g.q.opts[+j.i];
    if (!o) return err(400, 'Pilihan tidak valid');
    if (o.c) cp.s += g.q.pts; else cp.s = Math.max(0, cp.s - g.q.pen);
    g.fb = { pick: +j.i, right: g.q.opts.findIndex(x => x.c), ok: o.c, e: g.q.e };
    g.phase = 'feedback';
  }
  else if (url === '/api/next' && can && (g.phase === 'feedback' || g.phase === 'card')) endTurn(g);
  else if (url === '/api/skip' && host && ['roll', 'question', 'feedback', 'card'].includes(g.phase)) endTurn(g);
  else if (url === '/api/restart' && host && g.phase === 'over') {
    g.players.forEach(p => { p.pos = 0; p.s = 0; }); g.phase = 'lobby'; g.cur = 0; g.final = false; g.dice = 0; g.msg = '';
  }
  else return err(400, 'Aksi tidak diizinkan');
  push(g); out(200, { ok: 1 });
}

/* ---------- HTTP ---------- */
http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (req.method === 'GET' && u.pathname === '/events') {
    const g = games[u.searchParams.get('code')];
    if (!g) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    const c = { res, pid: u.searchParams.get('pid') || '', hid: u.searchParams.get('hid') || '' };
    const p = g.players.find(x => x.id === c.pid);
    g.cl.add(c); if (p) p.on = true;
    push(g);
    const hb = setInterval(() => res.write(': ping\n\n'), 25000);
    req.on('close', () => {
      clearInterval(hb); g.cl.delete(c);
      if (p && ![...g.cl].some(x => x.pid === p.id)) { p.on = false; push(g); }
    });
    return;
  }
  if (req.method === 'POST') {
    let b = '';
    req.on('data', d => { b += d; if (b.length > 1e4) req.destroy(); });
    req.on('end', () => { let j = {}; try { j = JSON.parse(b || '{}'); } catch (e) { } api(u.pathname, j, res); });
    return;
  }
  if (u.pathname === '/tiles') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(T)); }
  if (u.pathname === '/info') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ pin: !!PIN })); }
  if (u.pathname === '/health') { res.writeHead(200); return res.end('ok'); }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fs.readFileSync(path.join(__dirname, 'public', 'index.html')));
}).listen(PORT, () => console.log('Petualangan Matematika berjalan di http://localhost:' + PORT));

// hapus permainan yang tidak aktif > 6 jam
setInterval(() => { for (const k in games) if (Date.now() - games[k].t > 6 * 3600e3 && !games[k].cl.size) delete games[k]; }, 3600e3);
