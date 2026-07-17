/* ============================================================
   领阅 · DEV BLOCKS — drag-in premade modules + reorder + delete
   Companion to dev-mode.js. Include AFTER it:
     <script src="dev-mode.js"></script>
     <script src="dev-blocks.js"></script>
   • Shift+B (or the 🧱 pill) toggles Build mode
   • Drag a module from the drawer into the page to add it
   • Hover any block for a toolbar: ⠿ drag · ↑ ↓ move · × delete
   • Undo / Reset / Copy HTML in the drawer
   Blocks inherit the page theme via CSS-variable fallback chains,
   so they adopt whatever direction they're dropped into.
   ============================================================ */
(function () {
  if (window.__DEVBLOCKS__) return; window.__DEVBLOCKS__ = true;
  var doc = document, body = doc.body;
  var STORE = 'devblocks:' + location.pathname;
  var active = false, hist = [], indTarget = null, indBefore = true, moving = null;

  /* ---------- module library (theme-adaptive via var fallbacks) ---------- */
  var MODULES = [
    { id: 'heading', name: '小标题', make: function () {
      return sec('heading', '<span class="dmb-eb" contenteditable>SECTION · 小节</span><div class="dmb-h" contenteditable>一句能记住的小标题。</div><p class="dmb-sub" contenteditable>一行支撑说明，讲清这段要说什么。</p>'); } },
    { id: 'hero', name: '主视觉 Hero', make: function () {
      return sec('hero', '<span class="dmb-eb" contenteditable>金融垂域 AI · 投研 OPT</span><div class="dmb-hero" contenteditable>专家级判断，可交付。</div><p class="dmb-sub" contenteditable>从信号到决策，可追溯、可沉淀、可自进化。</p><div class="dmb-row"><a class="dmb-btn dmb-fill" contenteditable>预约演示</a><a class="dmb-btn" contenteditable>查看能力</a></div>'); } },
    { id: 'features', name: '三列特性', make: function () {
      return sec('features', '<span class="dmb-eb" contenteditable>能力</span><div class="dmb-h" contenteditable>三个核心能力。</div><div class="dmb-3">' +
        card('研究员 Copilot', '分析框架沉淀为可追踪判断网络，关键信号实时映射到持仓假设。') +
        card('基金经理 Copilot', '团队判断与置信度聚合为统一视图，识别持仓与判断的偏离。') +
        card('风控 Copilot', '风险追溯到信号源，认知告警而非阈值告警，复盘几天到几分钟。') + '</div>'); } },
    { id: 'metrics', name: '数字条', make: function () {
      return sec('metrics', '<span class="dmb-eb" contenteditable>为何可信</span><div class="dmb-4">' +
        metric('&lt;2%', '关键事实错误率 · 基线 10–15%') + metric('100%', '结论可溯源') +
        metric('↓90%', '冷启动数据需求') + metric('&lt;3s', 'P95 · 百人级并发') + '</div>'); } },
    { id: 'bignum', name: '巨型数字', make: function () {
      return sec('bignum', '<div class="dmb-big"><div class="dmb-bigN" contenteditable>70%</div><div class="dmb-bigT"><div class="dmb-h" contenteditable>的关键信号就此漏失。</div><p class="dmb-sub" contenteditable>真正决定盈亏的那几条，从没有人把它们拼在一起看过。</p></div></div>'); } },
    { id: 'quote', name: '引述', make: function () {
      return sec('quote', '<div class="dmb-quote" contenteditable>「复盘时才发现每条信息都在，只是从没人把它们拼在一起看过。」</div><div class="dmb-cite" contenteditable>—— 某主观基金 · 基金经理</div>'); } },
    { id: 'split', name: '左右两栏', make: function () {
      return sec('split', '<div class="dmb-split"><div><span class="dmb-eb" contenteditable>平台</span><div class="dmb-h" contenteditable>一次建设，全业务线复用。</div><p class="dmb-sub" contenteditable>以 API / Model / Tools / Skills 交付，接入已有中台。</p></div><ul class="dmb-list"><li contenteditable>私有化部署，数据不出域</li><li contenteditable>端云协同，端侧本地推理</li><li contenteditable>分权限管理，全程可审计</li></ul></div>'); } },
    { id: 'cta', name: '行动号召 CTA', make: function () {
      return sec('cta', '<div class="dmb-ctablk"><span class="dmb-eb" contenteditable>Let\'s talk</span><div class="dmb-h" contenteditable>让 AI 以专家的标准，进入你的每一条业务线。</div><div class="dmb-row"><a class="dmb-btn dmb-fill" contenteditable>预约演示</a></div></div>'); } },
    { id: 'logos', name: 'Logo 墙', make: function () {
      var s = ''; for (var i = 0; i < 5; i++) s += '<span class="dmb-logo" contenteditable>合作机构</span>';
      return sec('logos', '<div class="dmb-eb" style="text-align:center" contenteditable>服务于证券 · 基金 · 财富管理机构</div><div class="dmb-logos">' + s + '</div>'); } },
    { id: 'spacer', name: '分隔 / 留白', make: function () {
      return sec('spacer', '<div class="dmb-rule"></div>'); } }
  ];
  function sec(t, inner) { return '<section class="dmb dmb-s-' + t + '"><div class="dmb-in">' + inner + '</div></section>'; }
  function card(h, p) { return '<div class="dmb-card"><div class="dmb-ch" contenteditable>' + h + '</div><p contenteditable>' + p + '</p></div>'; }
  function metric(v, c) { return '<div class="dmb-m"><div class="dmb-mv" contenteditable>' + v + '</div><div class="dmb-mc" contenteditable>' + c + '</div></div>'; }

  /* ---------- styles ---------- */
  var css = `
  .dmb{--_a:var(--accent,var(--amber,var(--claret,var(--red,var(--blue,#2a5bd7)))));
    --_ink:var(--ink,var(--text-hi,var(--text,#17181c)));--_dim:var(--ink-2,var(--dim,var(--ink-3,#6b7280)));
    --_bg:var(--paper,var(--bg,var(--sheet,#fff)));--_panel:var(--panel,var(--card,var(--paper-2,rgba(128,128,128,.06))));
    --_line:var(--line,var(--rule,var(--hair,rgba(128,128,128,.22))));
    --_disp:var(--disp,var(--narrow,var(--sans,var(--body,inherit))));--_body:var(--body,var(--sans,inherit));--_mono:var(--mono,ui-monospace,monospace);
    padding:70px 0;color:var(--_ink);font-family:var(--_body);line-height:1.6;border-top:1px solid var(--_line)}
  .dmb .dmb-in{max-width:1080px;margin:0 auto;padding:0 32px}
  .dmb-eb{font-family:var(--_mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--_a);display:inline-block;outline:none}
  .dmb-h{font-family:var(--_disp);font-size:clamp(26px,3.4vw,40px);font-weight:700;letter-spacing:-.02em;line-height:1.12;margin:14px 0 0;outline:none}
  .dmb-hero{font-family:var(--_disp);font-size:clamp(40px,6.4vw,72px);font-weight:700;letter-spacing:-.03em;line-height:1.03;margin:20px 0 0;outline:none}
  .dmb-sub{color:var(--_dim);font-size:17px;margin-top:14px;max-width:56ch;line-height:1.6;outline:none}
  .dmb-row{display:flex;gap:12px;margin-top:28px;flex-wrap:wrap}
  .dmb-btn{font-size:14.5px;font-weight:500;padding:12px 22px;border:1px solid var(--_line);border-radius:8px;color:var(--_ink);cursor:text;outline:none}
  .dmb-btn.dmb-fill{background:var(--_a);color:#fff;border-color:var(--_a)}
  .dmb-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:36px}
  .dmb-card{border:1px solid var(--_line);background:var(--_panel);border-radius:12px;padding:24px 22px}
  .dmb-ch{font-family:var(--_disp);font-weight:600;font-size:19px;margin-bottom:9px;outline:none}
  .dmb-card p{color:var(--_dim);font-size:14px;line-height:1.6;outline:none}
  .dmb-4{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:36px}
  .dmb-mv{font-family:var(--_disp);font-weight:700;font-size:clamp(30px,4vw,46px);letter-spacing:-.02em;color:var(--_a);line-height:1;outline:none}
  .dmb-mc{font-size:13px;color:var(--_dim);margin-top:11px;line-height:1.5;outline:none}
  .dmb-big{display:grid;grid-template-columns:auto 1fr;gap:40px;align-items:center}
  .dmb-bigN{font-family:var(--_disp);font-weight:800;font-size:clamp(80px,16vw,200px);letter-spacing:-.04em;line-height:.85;color:var(--_a);outline:none}
  .dmb-quote{font-family:var(--_disp);font-size:clamp(22px,3vw,32px);font-weight:500;line-height:1.32;letter-spacing:-.01em;max-width:24ch;outline:none}
  .dmb-cite{font-family:var(--_mono);font-size:12px;color:var(--_dim);margin-top:18px;outline:none}
  .dmb-split{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}
  .dmb-list{list-style:none;margin:0;padding:0}
  .dmb-list li{font-size:15.5px;color:var(--_ink);padding:12px 0 12px 22px;border-top:1px solid var(--_line);position:relative;outline:none}
  .dmb-list li::before{content:"—";position:absolute;left:0;color:var(--_a)}
  .dmb-ctablk{text-align:center}.dmb-ctablk .dmb-row{justify-content:center}.dmb-ctablk .dmb-h{max-width:22ch;margin:14px auto 0}
  .dmb-logos{display:flex;flex-wrap:wrap;gap:34px;justify-content:center;margin-top:22px}
  .dmb-logo{font-family:var(--_disp);font-size:18px;color:var(--_dim);opacity:.6;outline:none}
  .dmb-rule{height:1px;background:var(--_line)}
  @media(max-width:820px){.dmb-3,.dmb-4,.dmb-split{grid-template-columns:1fr}.dmb-big{grid-template-columns:1fr;gap:16px}}

  /* --- builder chrome --- */
  #db-fab{position:fixed;left:16px;bottom:62px;z-index:2147483000;display:inline-flex;align-items:center;gap:8px;font:600 12px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.1em;color:#e7ecf3;background:#161226;border:1px solid #3a2f56;border-radius:999px;padding:9px 14px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.35)}
  #db-fab:hover{background:#1e1833}
  #db-fab.on{background:#8b7bf0;color:#0a0a0a;border-color:#8b7bf0}
  body.db-active .dmb,body.db-active section,body.db-active footer{position:relative}
  .dbtb{position:absolute;top:8px;right:8px;z-index:2147482990;display:none;gap:2px;background:#12151c;border:1px solid #2b3444;border-radius:8px;padding:3px;box-shadow:0 6px 18px rgba(0,0,0,.35)}
  body.db-active .db-block:hover>.dbtb{display:flex}
  .dbtb button{background:none;border:none;color:#c9d3e0;width:26px;height:26px;border-radius:6px;cursor:pointer;font:600 13px ui-monospace,monospace;display:grid;place-items:center}
  .dbtb button:hover{background:#232a36;color:#fff}
  .dbtb button.db-del:hover{background:#e2483a;color:#fff}
  .dbtb .db-handle{cursor:grab}
  body.db-active .db-block{outline:1px dashed transparent;outline-offset:-2px;transition:outline-color .12s}
  body.db-active .db-block:hover{outline-color:rgba(139,123,240,.5)}
  .db-drag{opacity:.4}
  #db-ind{position:fixed;left:0;right:0;height:0;border-top:3px solid #8b7bf0;z-index:2147482995;pointer-events:none;display:none;box-shadow:0 0 8px rgba(139,123,240,.6)}
  #db-drawer{position:fixed;left:0;right:0;bottom:0;z-index:2147483001;background:#0f1218;border-top:1px solid #262f3d;box-shadow:0 -16px 40px rgba(0,0,0,.4);transform:translateY(100%);transition:transform .22s cubic-bezier(.2,.7,.3,1);font-family:ui-sans-serif,system-ui,"PingFang SC","Microsoft YaHei",sans-serif;color:#d7dde7}
  #db-drawer.open{transform:none}
  #db-drawer .dh{display:flex;align-items:center;justify-content:space-between;padding:11px 18px;border-bottom:1px solid #222a37}
  #db-drawer .dh b{font:700 12px ui-monospace,monospace;letter-spacing:.12em;color:#fff}
  #db-drawer .dh .hint{font:11px ui-monospace,monospace;color:#6b7688;margin-left:14px}
  #db-drawer .dh .acts{display:flex;gap:7px}
  #db-drawer .dh button{border:1px solid #2b3444;background:#161b23;color:#cdd5e0;border-radius:7px;padding:7px 12px;cursor:pointer;font:600 11px ui-monospace,monospace}
  #db-drawer .dh button:hover{background:#1c222c;color:#fff}
  #db-drawer .dh .primary{background:#8b7bf0;border-color:#8b7bf0;color:#0a0a0a}
  #db-lib{display:flex;gap:10px;overflow-x:auto;padding:14px 18px}
  .db-card{flex:0 0 auto;width:132px;border:1px solid #263041;background:#161b23;border-radius:10px;padding:12px;cursor:grab;transition:.12s;user-select:none}
  .db-card:hover{border-color:#8b7bf0;background:#1a2130}
  .db-card:active{cursor:grabbing}
  .db-card .pv{height:52px;border-radius:6px;background:#0e1219;border:1px solid #222a37;display:grid;place-items:center;color:#5c6a80;font:600 20px ui-monospace,monospace;margin-bottom:9px;overflow:hidden}
  .db-card .nm{font:600 12px ui-sans-serif,system-ui;color:#dbe2ec}
  .db-card .zh{font:10.5px ui-monospace,monospace;color:#6b7688;margin-top:2px}
  #db-toast{position:fixed;left:50%;bottom:210px;transform:translate(-50%,10px);z-index:2147483002;background:#12151c;color:#e7ecf3;border:1px solid #2b3444;border-radius:8px;padding:9px 15px;font:12px ui-monospace,monospace;opacity:0;pointer-events:none;transition:.2s}
  #db-toast.show{opacity:1;transform:translate(-50%,0)}
  @media(prefers-reduced-motion:reduce){#db-drawer,#db-fab,#db-toast{transition:none}}
  `;
  var st = doc.createElement('style'); st.id = 'db-style'; st.textContent = css; doc.head.appendChild(st);

  /* ---------- chrome ---------- */
  var fab = el('button', { id: 'db-fab', title: 'Build mode (Shift+B)' }); fab.innerHTML = '🧱 布局';
  var drawer = el('div', { id: 'db-drawer' });
  drawer.innerHTML = '<div class="dh"><div><b>模块 · BLOCKS</b><span class="hint">拖模块到页面 · 悬停区块可 ⠿移动 / ×删除</span></div>' +
    '<div class="acts"><button id="db-undo">↶ 撤销</button><button id="db-reset">重置</button><button id="db-copy" class="primary">复制 HTML</button><button id="db-close">完成</button></div></div>' +
    '<div id="db-lib"></div>';
  var ind = el('div', { id: 'db-ind' });
  var toast = el('div', { id: 'db-toast' });
  body.appendChild(fab); body.appendChild(drawer); body.appendChild(ind); body.appendChild(toast);

  var lib = drawer.querySelector('#db-lib');
  MODULES.forEach(function (m) {
    var c = el('div', { class: 'db-card', draggable: 'true', title: '拖到页面添加' });
    c.innerHTML = '<div class="pv">' + iconFor(m.id) + '</div><div class="nm">' + m.name.split(' ')[0] + '</div><div class="zh">' + m.id + '</div>';
    c.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/dm-module', m.id); e.dataTransfer.effectAllowed = 'copy'; moving = null; });
    lib.appendChild(c);
  });
  function iconFor(id) { return ({ heading: 'H', hero: '★', features: '▦', metrics: '№', bignum: '70', quote: '“', split: '◧', cta: '→', logos: '⬚', spacer: '—' })[id] || '▢'; }

  /* ---------- blocks: toolbar / reorder / delete ---------- */
  function blockEls() { return Array.prototype.filter.call(doc.querySelectorAll('section, footer'), function (n) { return !n.closest('#db-drawer') && !n.closest('#dm-panel'); }); }
  function markAll() { blockEls().forEach(markBlock); }
  function markBlock(b) {
    if (b.__db) return; b.__db = 1; b.classList.add('db-block');
    var tb = el('div', { class: 'dbtb' });
    tb.innerHTML = '<button class="db-handle" draggable="true" title="拖动排序">⠿</button><button class="db-up" title="上移">↑</button><button class="db-down" title="下移">↓</button><button class="db-del" title="删除">×</button>';
    b.appendChild(tb);
    tb.querySelector('.db-up').addEventListener('click', function (e) { e.stopPropagation(); var p = prevBlock(b); if (p) { snap(); b.parentNode.insertBefore(b, p); persist(); } });
    tb.querySelector('.db-down').addEventListener('click', function (e) { e.stopPropagation(); var n = nextBlock(b); if (n) { snap(); b.parentNode.insertBefore(n, b); persist(); } });
    tb.querySelector('.db-del').addEventListener('click', function (e) { e.stopPropagation(); snap(); b.remove(); persist(); toastMsg('已删除区块'); });
    var h = tb.querySelector('.db-handle');
    h.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/dm-move', '1'); e.dataTransfer.effectAllowed = 'move'; moving = b; b.classList.add('db-drag'); });
    h.addEventListener('dragend', function () { if (moving) moving.classList.remove('db-drag'); moving = null; hideInd(); });
  }
  function prevBlock(b) { var p = b.previousElementSibling; while (p && !p.classList.contains('db-block')) p = p.previousElementSibling; return p; }
  function nextBlock(b) { var n = b.nextElementSibling; while (n && !n.classList.contains('db-block')) n = n.nextElementSibling; return n; }

  /* ---------- drag insert / reorder over the page ---------- */
  doc.addEventListener('dragover', function (e) {
    if (!active) return;
    var t = nearestBlock(e.clientY); if (!t) { hideInd(); return; }
    e.preventDefault();
    var r = t.getBoundingClientRect(); var before = e.clientY < r.top + r.height / 2;
    indTarget = t; indBefore = before; showInd(t, before);
  });
  doc.addEventListener('drop', function (e) {
    if (!active || !indTarget) return;
    e.preventDefault();
    var modId = e.dataTransfer.getData('text/dm-module');
    var isMove = e.dataTransfer.getData('text/dm-move');
    snap();
    if (modId) {
      var m = find(MODULES, function (x) { return x.id === modId; }); if (!m) return;
      var node = fromHTML(m.make()); insertRel(node, indTarget, indBefore); markBlock(node); flash(node); toastMsg('已添加「' + m.name + '」');
    } else if (isMove && moving) {
      insertRel(moving, indTarget, indBefore); moving.classList.remove('db-drag'); moving = null;
    }
    hideInd(); persist();
  });
  function nearestBlock(y) {
    var bs = blockEls(), best = null, bestD = 1e9;
    bs.forEach(function (b) { var r = b.getBoundingClientRect(); if (r.height < 4) return; var mid = r.top + r.height / 2; var d = Math.abs(y - mid); if (d < bestD) { bestD = d; best = b; } });
    return best;
  }
  function insertRel(node, target, before) { if (before) target.parentNode.insertBefore(node, target); else target.parentNode.insertBefore(node, target.nextSibling); }
  function showInd(t, before) { var r = t.getBoundingClientRect(); ind.style.display = 'block'; ind.style.top = (before ? r.top : r.bottom) - 1 + 'px'; ind.style.left = Math.max(0, r.left - 6) + 'px'; ind.style.right = Math.max(0, window.innerWidth - r.right - 6) + 'px'; }
  function hideInd() { ind.style.display = 'none'; indTarget = null; }

  /* ---------- history / persistence ---------- */
  function contentNodes() { return Array.prototype.filter.call(body.children, function (n) { return n.nodeType === 1 && !/^(SCRIPT|STYLE)$/.test(n.tagName) && !isDev(n); }); }
  function isDev(n) { var id = n.id || ''; return /^(dm-|db-)/.test(id) || n.classList.contains('dm-obox'); }
  function cleanHTML(forExport) {
    return contentNodes().map(function (n) {
      var c = n.cloneNode(true);
      Array.prototype.forEach.call(c.querySelectorAll('.dbtb'), function (x) { x.remove(); });
      Array.prototype.forEach.call(c.querySelectorAll('.db-block'), function (x) { x.classList.remove('db-block', 'db-drag'); });
      if (c.classList) c.classList.remove('db-block', 'db-drag');
      if (forExport) Array.prototype.forEach.call(c.querySelectorAll('[contenteditable]'), function (x) { x.removeAttribute('contenteditable'); });
      return c.outerHTML;
    }).join('\n');
  }
  function snap() { hist.push(cleanHTML(false)); if (hist.length > 40) hist.shift(); }
  function persist() { try { localStorage.setItem(STORE, cleanHTML(false)); } catch (e) {} }
  function restore(html) {
    contentNodes().forEach(function (n) { n.remove(); });
    var tmp = el('div'); tmp.innerHTML = html;
    var ref = body.firstChild;
    while (tmp.firstChild) body.insertBefore(tmp.firstChild, ref);
    reinit();
  }
  function reinit() {
    blockEls().forEach(function (b) { b.__db = 0; markBlock(b); });
    Array.prototype.forEach.call(doc.querySelectorAll('.rv'), function (x) { x.classList.add('in'); });
    var burger = doc.getElementById('burger'); // pages use #burger; re-bind if present
    if (burger && !burger.__b) { burger.__b = 1; burger.addEventListener('click', function () { var n = doc.querySelector('nav'); if (n) n.style.display = 'flex'; }); }
  }

  /* ---------- toolbar actions ---------- */
  drawer.querySelector('#db-undo').addEventListener('click', function () { if (!hist.length) { toastMsg('无可撤销'); return; } restore(hist.pop()); persist(); toastMsg('已撤销'); });
  var ORIGINAL = null;
  drawer.querySelector('#db-reset').addEventListener('click', function () { if (ORIGINAL == null) return; snap(); restore(ORIGINAL); persist(); toastMsg('已还原初始布局'); });
  drawer.querySelector('#db-copy').addEventListener('click', function () { copy(cleanHTML(true)); toastMsg('已复制页面 HTML（去除编辑标记）'); });
  drawer.querySelector('#db-close').addEventListener('click', function () { setBuild(false); });

  /* ---------- toggle ---------- */
  function setBuild(on) {
    active = on; body.classList.toggle('db-active', on); drawer.classList.toggle('open', on); fab.classList.toggle('on', on);
    if (on) { markAll(); toastMsg('布局模式 · 拖模块到页面'); } else { hideInd(); }
  }
  fab.addEventListener('click', function () { setBuild(!active); });
  doc.addEventListener('keydown', function (e) {
    var t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (!typing && e.shiftKey && (e.key === 'B' || e.key === 'b')) { e.preventDefault(); setBuild(!active); }
    if (e.key === 'Escape' && active) setBuild(false);
  });

  /* ---------- boot ---------- */
  function boot() {
    ORIGINAL = cleanHTML(false);
    var saved = null; try { saved = localStorage.getItem(STORE); } catch (e) {}
    if (saved && saved.trim() && saved !== ORIGINAL) { try { restore(saved); } catch (e) {} }
    console.log('%c[dev-blocks] ready', 'color:#8b7bf0', '· Shift+B · ' + MODULES.length + ' modules');
  }
  if (doc.readyState === 'complete') boot(); else window.addEventListener('load', boot);

  /* ---------- utils ---------- */
  function el(tag, attrs) { var n = doc.createElement(tag); if (attrs) for (var a in attrs) n.setAttribute(a, attrs[a]); return n; }
  function fromHTML(h) { var d = el('div'); d.innerHTML = h.trim(); return d.firstElementChild; }
  function find(a, f) { for (var i = 0; i < a.length; i++) if (f(a[i])) return a[i]; return null; }
  function flash(node) { node.animate ? node.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 350, easing: 'ease' }) : 0; }
  function copy(s) { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).catch(fb); else fb(); function fb() { var ta = el('textarea'); ta.value = s; ta.style.cssText = 'position:fixed;opacity:0'; body.appendChild(ta); ta.select(); try { doc.execCommand('copy'); } catch (e) {} body.removeChild(ta); } }
  var tt; function toastMsg(m) { toast.textContent = m; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('show'); }, 1700); }
})();
