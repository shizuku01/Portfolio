/* ============================================================
   Blocks — the Layout tab's section library.
   Loads AFTER dev-mode.js and mounts into its panel (no second
   pill, no second drawer). Drag a card onto the page to add a
   section; hover any section for move / delete.
   ============================================================ */
(function () {
  if (window.__DEVBLOCKS__) return; window.__DEVBLOCKS__ = true;
  var doc = document, body = doc.body;
  var STORE = 'devblocks:' + location.pathname;
  var lang = (window.__DM__ && window.__DM__.lang && window.__DM__.lang()) || 'en';
  var hist = [], indT = null, indB = true, moving = null, ORIGINAL = null;

  var T = {
    en: { heading: 'Heading', hero: 'Big title', features: 'Three columns', metrics: 'Number row', bignum: 'Huge number',
          quote: 'Quote', split: 'Two columns', cta: 'Call to action', logos: 'Logo row', spacer: 'Divider',
          added: 'Section added', deleted: 'Section deleted', up: 'Move up', down: 'Move down', del: 'Delete', drag: 'Drag to reorder' },
    zh: { heading: '小标题', hero: '大标题', features: '三列', metrics: '数字条', bignum: '巨型数字',
          quote: '引述', split: '两栏', cta: '行动号召', logos: 'Logo 行', spacer: '分隔线',
          added: '已添加区块', deleted: '已删除区块', up: '上移', down: '下移', del: '删除', drag: '拖动排序' }
  };
  function t(k) { return (T[lang] && T[lang][k]) || T.en[k] || k; }
  function toast(m) { if (window.__DM__ && window.__DM__.toast) window.__DM__.toast(m); }

  /* ---------- library ---------- */
  var MODULES = [
    { id: 'heading', make: function () { return sec('heading', '<span class="dmb-eb" contenteditable>Section</span><div class="dmb-h" contenteditable>A short, memorable heading.</div><p class="dmb-sub" contenteditable>One line of supporting text.</p>'); } },
    { id: 'hero', make: function () { return sec('hero', '<span class="dmb-eb" contenteditable>Intro</span><div class="dmb-hero" contenteditable>A big statement.</div><p class="dmb-sub" contenteditable>One line that explains it.</p><div class="dmb-row"><a class="dmb-btn dmb-fill" contenteditable>Primary</a><a class="dmb-btn" contenteditable>Secondary</a></div>'); } },
    { id: 'features', make: function () { return sec('features', '<span class="dmb-eb" contenteditable>Features</span><div class="dmb-h" contenteditable>Three things.</div><div class="dmb-3">' + card('First') + card('Second') + card('Third') + '</div>'); } },
    { id: 'metrics', make: function () { return sec('metrics', '<span class="dmb-eb" contenteditable>Numbers</span><div class="dmb-4">' + met('100%') + met('&lt;2%') + met('↓90%') + met('&lt;3s') + '</div>'); } },
    { id: 'bignum', make: function () { return sec('bignum', '<div class="dmb-big"><div class="dmb-bigN" contenteditable>70%</div><div><div class="dmb-h" contenteditable>What the number means.</div><p class="dmb-sub" contenteditable>A line of context.</p></div></div>'); } },
    { id: 'quote', make: function () { return sec('quote', '<div class="dmb-quote" contenteditable>“A short quote that lands.”</div><div class="dmb-cite" contenteditable>— Someone</div>'); } },
    { id: 'split', make: function () { return sec('split', '<div class="dmb-split"><div><span class="dmb-eb" contenteditable>About</span><div class="dmb-h" contenteditable>Two columns.</div><p class="dmb-sub" contenteditable>Text on one side, a list on the other.</p></div><ul class="dmb-list"><li contenteditable>First point</li><li contenteditable>Second point</li><li contenteditable>Third point</li></ul></div>'); } },
    { id: 'cta', make: function () { return sec('cta', '<div class="dmb-ctablk"><span class="dmb-eb" contenteditable>Next</span><div class="dmb-h" contenteditable>Ready to talk?</div><div class="dmb-row"><a class="dmb-btn dmb-fill" contenteditable>Get in touch</a></div></div>'); } },
    { id: 'logos', make: function () { var s = ''; for (var i = 0; i < 5; i++) s += '<span class="dmb-logo" contenteditable>Partner</span>'; return sec('logos', '<div class="dmb-eb" style="text-align:center" contenteditable>Trusted by</div><div class="dmb-logos">' + s + '</div>'); } },
    { id: 'spacer', make: function () { return sec('spacer', '<div class="dmb-rule"></div>'); } }
  ];
  function sec(t2, i) { return '<section class="dmb dmb-s-' + t2 + '"><div class="dmb-in">' + i + '</div></section>'; }
  function card(h) { return '<div class="dmb-card"><div class="dmb-ch" contenteditable>' + h + '</div><p contenteditable>A sentence about it.</p></div>'; }
  function met(v) { return '<div class="dmb-m"><div class="dmb-mv" contenteditable>' + v + '</div><div class="dmb-mc" contenteditable>What it measures</div></div>'; }

  /* ---------- styles (blocks inherit the host theme via var fallbacks) ---------- */
  var css = `
  .dmb{--_a:var(--accent,var(--amber,var(--claret,var(--red,var(--blue,#2a5bd7)))));
    --_ink:var(--ink,var(--text-hi,var(--text,#17181c)));--_dim:var(--ink-2,var(--dim,var(--ink-3,#6b7280)));
    --_panel:var(--panel,var(--card,var(--paper-2,rgba(128,128,128,.06))));
    --_line:var(--line,var(--rule,var(--hair,rgba(128,128,128,.22))));
    --_disp:var(--disp,var(--narrow,var(--sans,var(--body,inherit))));--_body:var(--body,var(--sans,inherit));--_mono:var(--mono,ui-monospace,monospace);
    padding:70px 0;color:var(--_ink);font-family:var(--_body);line-height:1.6;border-top:1px solid var(--_line)}
  .dmb .dmb-in{max-width:1080px;margin:0 auto;padding:0 32px}
  .dmb-eb{font-family:var(--_mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--_a);display:inline-block;outline:none}
  .dmb-h{font-family:var(--_disp);font-size:clamp(26px,3.4vw,40px);font-weight:700;letter-spacing:-.02em;line-height:1.12;margin:14px 0 0;outline:none}
  .dmb-hero{font-family:var(--_disp);font-size:clamp(40px,6.4vw,72px);font-weight:700;letter-spacing:-.03em;line-height:1.03;margin:20px 0 0;outline:none}
  .dmb-sub{color:var(--_dim);font-size:17px;margin-top:14px;max-width:56ch;outline:none}
  .dmb-row{display:flex;gap:12px;margin-top:28px;flex-wrap:wrap}
  .dmb-btn{font-size:14.5px;font-weight:500;padding:12px 22px;border:1px solid var(--_line);border-radius:8px;color:var(--_ink);cursor:text;outline:none}
  .dmb-btn.dmb-fill{background:var(--_a);color:#fff;border-color:var(--_a)}
  .dmb-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:36px}
  .dmb-card{border:1px solid var(--_line);background:var(--_panel);border-radius:12px;padding:24px 22px}
  .dmb-ch{font-family:var(--_disp);font-weight:600;font-size:19px;margin-bottom:9px;outline:none}
  .dmb-card p{color:var(--_dim);font-size:14px;outline:none}
  .dmb-4{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:36px}
  .dmb-mv{font-family:var(--_disp);font-weight:700;font-size:clamp(30px,4vw,46px);letter-spacing:-.02em;color:var(--_a);line-height:1;outline:none}
  .dmb-mc{font-size:13px;color:var(--_dim);margin-top:11px;outline:none}
  .dmb-big{display:grid;grid-template-columns:auto 1fr;gap:40px;align-items:center}
  .dmb-bigN{font-family:var(--_disp);font-weight:800;font-size:clamp(80px,16vw,200px);letter-spacing:-.04em;line-height:.85;color:var(--_a);outline:none}
  .dmb-quote{font-family:var(--_disp);font-size:clamp(22px,3vw,32px);font-weight:500;line-height:1.32;max-width:24ch;outline:none}
  .dmb-cite{font-family:var(--_mono);font-size:12px;color:var(--_dim);margin-top:18px;outline:none}
  .dmb-split{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}
  .dmb-list{list-style:none;margin:0;padding:0}
  .dmb-list li{font-size:15.5px;padding:12px 0 12px 22px;border-top:1px solid var(--_line);position:relative;outline:none}
  .dmb-list li::before{content:"—";position:absolute;left:0;color:var(--_a)}
  .dmb-ctablk{text-align:center}.dmb-ctablk .dmb-row{justify-content:center}.dmb-ctablk .dmb-h{max-width:22ch;margin:14px auto 0}
  .dmb-logos{display:flex;flex-wrap:wrap;gap:34px;justify-content:center;margin-top:22px}
  .dmb-logo{font-family:var(--_disp);font-size:18px;color:var(--_dim);opacity:.6;outline:none}
  .dmb-rule{height:1px;background:var(--_line)}
  @media(max-width:820px){.dmb-3,.dmb-4,.dmb-split{grid-template-columns:1fr}.dmb-big{grid-template-columns:1fr;gap:16px}}

  /* library cards inside the panel */
  #dm-blockhost{display:grid;grid-template-columns:1fr 1fr;gap:7px}
  .db-card{border:1px solid #262c36;background:#191d24;border-radius:9px;padding:9px;cursor:grab;user-select:none;transition:.15s;text-align:center}
  .db-card:hover{border-color:#fff;background:#20262f}
  .db-card:active{cursor:grabbing}
  .db-card .pv{height:34px;display:grid;place-items:center;color:#8b94a3;margin-bottom:5px}
  .db-card .pv svg{width:100%;height:100%;max-width:44px}
  .db-card .nm{font:500 11.5px ui-sans-serif,system-ui;color:#cdd4de}
  /* on-page section toolbar */
  section,footer,.dmb{position:relative}
  .dbtb{position:absolute;top:8px;right:8px;z-index:2147482990;display:none;gap:2px;background:#101216;border:1px solid #2b3340;border-radius:9px;padding:3px;box-shadow:0 6px 18px rgba(0,0,0,.4)}
  body.db-on .db-block:hover>.dbtb{display:flex}
  .dbtb button{background:none;border:0;color:#c9d3e0;width:27px;height:27px;border-radius:6px;cursor:pointer;display:grid;place-items:center}
  .dbtb button svg{width:14px;height:14px}
  .dbtb button:hover{background:#232a36;color:#fff}
  .dbtb .db-del:hover{background:#e2483a;color:#fff}
  .dbtb .db-handle{cursor:grab}
  body.db-on .db-block:hover{outline:1px dashed rgba(255,255,255,.4);outline-offset:-2px}
  .db-drag{opacity:.4}
  #db-ind{position:fixed;left:0;right:0;height:0;border-top:3px solid #63e6a8;z-index:2147482995;pointer-events:none;display:none;box-shadow:0 0 10px rgba(99,230,168,.7)}
  `;
  var st = doc.createElement('style'); st.textContent = css; doc.head.appendChild(st);
  var ind = doc.createElement('div'); ind.id = 'db-ind'; body.appendChild(ind);

  function ico(d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; }
  var PV = {
    heading: ico('<path d="M4 8h10M4 13h16M4 17h12"/>'), hero: ico('<path d="M4 7h16M4 12h9"/><rect x="4" y="16" width="6" height="4" rx="1"/>'),
    features: ico('<rect x="2" y="7" width="6" height="10" rx="1"/><rect x="9" y="7" width="6" height="10" rx="1"/><rect x="16" y="7" width="6" height="10" rx="1"/>'),
    metrics: ico('<path d="M3 16V9M9 16V6M15 16v-4M21 16V8"/>'), bignum: ico('<path d="M6 18V6h4a3 3 0 0 1 0 6H6M16 6v12"/>'),
    quote: ico('<path d="M8 11H5a3 3 0 0 1 3-3M18 11h-3a3 3 0 0 1 3-3M5 11v3a2 2 0 0 0 2 2M15 11v3a2 2 0 0 0 2 2"/>'),
    split: ico('<rect x="3" y="6" width="8" height="12" rx="1"/><path d="M14 8h7M14 12h7M14 16h5"/>'),
    cta: ico('<rect x="4" y="9" width="16" height="7" rx="3"/><path d="M10 12.5h4"/>'),
    logos: ico('<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>'),
    spacer: ico('<path d="M3 12h18"/>')
  };
  var I2 = { up: ico('<path d="m18 15-6-6-6 6"/>'), down: ico('<path d="m6 9 6 6 6-6"/>'), del: ico('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>'), grip: ico('<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>') };

  /* ---------- mount library into the panel's Layout tab ---------- */
  function mount() {
    var host = window.__DM__ && window.__DM__.blockHost && window.__DM__.blockHost();
    if (!host) return setTimeout(mount, 200);
    host.innerHTML = '';
    MODULES.forEach(function (m) {
      var c = doc.createElement('div'); c.className = 'db-card'; c.draggable = true;
      c.innerHTML = '<div class="pv">' + (PV[m.id] || '') + '</div><div class="nm">' + t(m.id) + '</div>';
      c.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/dm-mod', m.id); e.dataTransfer.effectAllowed = 'copy'; moving = null; setOn(true); });
      c.addEventListener('dragend', function () { hide(); });
      host.appendChild(c);
    });
  }
  mount();

  /* ---------- blocks on the page ---------- */
  function blocks() { return Array.prototype.filter.call(doc.querySelectorAll('section,footer'), function (n) { return !n.closest('#dm-panel'); }); }
  function mark(b) {
    if (b.__db) return; b.__db = 1; b.classList.add('db-block');
    var tb = doc.createElement('div'); tb.className = 'dbtb';
    tb.innerHTML = '<button class="db-handle" draggable="true" title="' + t('drag') + '">' + I2.grip + '</button>' +
      '<button class="db-up" title="' + t('up') + '">' + I2.up + '</button><button class="db-down" title="' + t('down') + '">' + I2.down + '</button>' +
      '<button class="db-del" title="' + t('del') + '">' + I2.del + '</button>';
    b.appendChild(tb);
    tb.querySelector('.db-up').onclick = function (e) { e.stopPropagation(); var p = sib(b, -1); if (p) { snap(); b.parentNode.insertBefore(b, p); persist(); } };
    tb.querySelector('.db-down').onclick = function (e) { e.stopPropagation(); var n = sib(b, 1); if (n) { snap(); b.parentNode.insertBefore(n, b); persist(); } };
    tb.querySelector('.db-del').onclick = function (e) { e.stopPropagation(); snap(); b.remove(); persist(); toast(t('deleted')); };
    var h = tb.querySelector('.db-handle');
    h.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/dm-move', '1'); e.dataTransfer.effectAllowed = 'move'; moving = b; b.classList.add('db-drag'); setOn(true); });
    h.addEventListener('dragend', function () { if (moving) moving.classList.remove('db-drag'); moving = null; hide(); });
  }
  function sib(b, d) { var n = d < 0 ? b.previousElementSibling : b.nextElementSibling; while (n && !n.classList.contains('db-block')) n = d < 0 ? n.previousElementSibling : n.nextElementSibling; return n; }
  function markAll() { blocks().forEach(mark); }
  function setOn(v) { body.classList.toggle('db-on', v); if (v) markAll(); }
  // section tools available whenever the panel's Layout tab is in use
  markAll(); setOn(true);

  doc.addEventListener('dragover', function (e) {
    var tgt = near(e.clientY); if (!tgt) { hide(); return; }
    e.preventDefault(); var r = tgt.getBoundingClientRect(); indB = e.clientY < r.top + r.height / 2; indT = tgt;
    ind.style.display = 'block'; ind.style.top = (indB ? r.top : r.bottom) - 1 + 'px'; ind.style.left = Math.max(0, r.left - 6) + 'px'; ind.style.right = Math.max(0, innerWidth - r.right - 6) + 'px';
  });
  doc.addEventListener('drop', function (e) {
    if (!indT) return; e.preventDefault();
    var id = e.dataTransfer.getData('text/dm-mod'), mv = e.dataTransfer.getData('text/dm-move'); snap();
    if (id) { var m = MODULES.filter(function (x) { return x.id === id; })[0]; if (m) { var n = frag(m.make()); ins(n, indT, indB); mark(n); toast(t('added')); } }
    else if (mv && moving) { ins(moving, indT, indB); moving.classList.remove('db-drag'); moving = null; }
    hide(); persist();
  });
  function near(y) { var b = blocks(), best = null, d = 1e9; b.forEach(function (x) { var r = x.getBoundingClientRect(); if (r.height < 4) return; var m = Math.abs(y - (r.top + r.height / 2)); if (m < d) { d = m; best = x; } }); return best; }
  function ins(n, tg, before) { if (before) tg.parentNode.insertBefore(n, tg); else tg.parentNode.insertBefore(n, tg.nextSibling); }
  function hide() { ind.style.display = 'none'; indT = null; }

  /* ---------- persistence ---------- */
  function content() { return Array.prototype.filter.call(body.children, function (n) { return n.nodeType === 1 && !/^(SCRIPT|STYLE)$/.test(n.tagName) && !/^(dm-|db-)/.test(n.id || ''); }); }
  function clean(exp) {
    return content().map(function (n) {
      var c = n.cloneNode(true);
      c.querySelectorAll('.dbtb').forEach(function (x) { x.remove(); });
      c.querySelectorAll('.db-block').forEach(function (x) { x.classList.remove('db-block', 'db-drag'); });
      if (c.classList) c.classList.remove('db-block', 'db-drag');
      if (exp) c.querySelectorAll('[contenteditable]').forEach(function (x) { x.removeAttribute('contenteditable'); });
      return c.outerHTML;
    }).join('\n');
  }
  function snap() { hist.push(clean(false)); if (hist.length > 30) hist.shift(); }
  function persist() { try { localStorage.setItem(STORE, clean(false)); } catch (e) {} }
  function restore(h) {
    content().forEach(function (n) { n.remove(); });
    var d = doc.createElement('div'); d.innerHTML = h; var ref = body.firstChild;
    while (d.firstChild) body.insertBefore(d.firstChild, ref);
    blocks().forEach(function (b) { b.__db = 0; mark(b); });
    doc.querySelectorAll('.rv').forEach(function (x) { x.classList.add('in'); });
  }
  window.__DM_BLOCKS__ = {
    setLang: function (l) { lang = l; mount(); doc.querySelectorAll('.dbtb').forEach(function (x) { x.remove(); }); blocks().forEach(function (b) { b.__db = 0; mark(b); }); },
    undo: function () { if (hist.length) { restore(hist.pop()); persist(); } },
    reset: function () { if (ORIGINAL != null) { snap(); restore(ORIGINAL); persist(); } },
    copyHTML: function () { return clean(true); }
  };
  addEventListener('load', function () {
    ORIGINAL = clean(false);
    var s = null; try { s = localStorage.getItem(STORE); } catch (e) {}
    if (s && s.trim() && s !== ORIGINAL) { try { restore(s); } catch (e) {} }
  });
  function frag(h) { var d = doc.createElement('div'); d.innerHTML = h.trim(); return d.firstElementChild; }
})();
