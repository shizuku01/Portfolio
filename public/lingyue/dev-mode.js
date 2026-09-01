/* ============================================================
   Design editor — one panel, plain language, EN / 中文
   Drop-in:  <script src="dev-mode.js"></script>
             <script src="dev-blocks.js"></script>   (optional: Layout tab)
   Shift+E opens it.  Everything is stored in the visitor's own
   browser — nothing is published.
   ============================================================ */
(function () {
  if (window.__DEVMODE__) return; window.__DEVMODE__ = true;
  var doc = document, root = doc.documentElement, docBody = doc.body;
  var STORE = 'devmode:' + location.pathname, BK = 'devmode:backups', UP = 'devmode:userpresets', LANG = 'devmode:lang';

  /* ---------------- i18n ---------------- */
  var T = {
    en: {
      open: 'Edit design', title: 'Edit design', editing: 'Editing', whole: 'Whole page',
      pick: 'Pick a section on the page', outline: 'Outline every section', clearSec: 'Clear this section',
      tColour: 'Colour', tText: 'Text', tLayout: 'Layout', tSave: 'Save',
      presets: 'Ready-made palettes', original: 'Original', savePal: '+ Save current',
      mainC: 'Main colours', moreC: 'More colours', accent: 'Accent', background: 'Background', textc: 'Text', lines: 'Lines',
      fontSets: 'Ready-made font pairings', textSize: 'Text size', fontsFor: 'Fonts', heading: 'Headings', bodyf: 'Body text', monof: 'Labels & numbers',
      sysFonts: 'Use fonts from my computer', saveFonts: '+ Save current', fine: 'Fine tuning',
      bSize: 'Body size', bLine: 'Line spacing', bTrack: 'Letter spacing',
      addBlock: 'Add a section', dragHint: 'Drag one onto the page', pageW: 'Page width', zoom: 'Zoom whole page',
      copyCss: 'Copy the CSS', copyCssD: 'Paste into the page to keep your colours & fonts',
      backups: 'Saved looks', nameHint: 'Name this look…', save: 'Save', load: 'Load', del: 'Delete',
      expo: 'Download as file', impo: 'Open a file',
      undo: 'Undo', redo: 'Redo', reset: 'Reset all', done: 'Done',
      custom: 'Custom…', none: 'This design has no colours to edit', noFonts: 'This design has no fonts to edit',
      tip: 'Nothing here is public — it only changes what you see.',
      okCopy: 'CSS copied', okReset: 'Everything reset', okPreset: 'Applied', okSaved: 'Saved', okLoaded: 'Loaded', okDeleted: 'Deleted',
      noChange: 'Nothing changed yet', needName: 'Give it a name first', sysOk: 'fonts loaded', sysNo: 'Your browser cannot list fonts — type a font name instead',
      cleared: 'Section cleared', scopeTo: 'Now editing'
    },
    zh: {
      open: '编辑设计', title: '编辑设计', editing: '正在编辑', whole: '整个页面',
      pick: '在页面上点选区块', outline: '框出所有区块', clearSec: '清除这个区块',
      tColour: '颜色', tText: '文字', tLayout: '版面', tSave: '保存',
      presets: '现成配色', original: '原始', savePal: '＋ 存当前',
      mainC: '主要颜色', moreC: '更多颜色', accent: '强调色', background: '背景', textc: '文字', lines: '线条',
      fontSets: '现成字体搭配', textSize: '文字大小', fontsFor: '字体', heading: '标题', bodyf: '正文', monof: '标签与数字',
      sysFonts: '使用我电脑里的字体', saveFonts: '＋ 存当前', fine: '微调',
      bSize: '正文字号', bLine: '行距', bTrack: '字距',
      addBlock: '添加区块', dragHint: '拖到页面上', pageW: '页面宽度', zoom: '整页缩放',
      copyCss: '复制 CSS', copyCssD: '粘回页面即可永久保留颜色与字体',
      backups: '保存的样式', nameHint: '给这个样式起名…', save: '保存', load: '载入', del: '删除',
      expo: '下载为文件', impo: '打开文件',
      undo: '撤销', redo: '重做', reset: '全部重置', done: '完成',
      custom: '自定义…', none: '这个设计没有可改的颜色', noFonts: '这个设计没有可改的字体',
      tip: '这些改动不会公开——只影响你自己看到的页面。',
      okCopy: '已复制 CSS', okReset: '已全部重置', okPreset: '已应用', okSaved: '已保存', okLoaded: '已载入', okDeleted: '已删除',
      noChange: '还没有任何改动', needName: '请先起个名字', sysOk: '个字体已载入', sysNo: '此浏览器无法列出字体——请直接输入字体名',
      cleared: '已清除该区块', scopeTo: '正在编辑'
    }
  };
  var lang = (function () { try { return localStorage.getItem(LANG) || (navigator.language || '').toLowerCase().indexOf('zh') === 0 ? (localStorage.getItem(LANG) || 'zh') : 'en'; } catch (e) { return 'en'; } })();
  if (lang !== 'zh' && lang !== 'en') lang = 'en';
  function t(k) { return (T[lang] && T[lang][k]) || T.en[k] || k; }

  /* ---------------- read the page's variables ---------------- */
  function readRootVars() {
    var out = [], seen = {};
    for (var i = 0; i < doc.styleSheets.length; i++) {
      var rules; try { rules = doc.styleSheets[i].cssRules; } catch (e) { continue; }
      if (!rules) continue;
      for (var j = 0; j < rules.length; j++) {
        var r = rules[j];
        if (r.type === 1 && r.selectorText && /(^|,)\s*:root\s*(,|$)/.test(r.selectorText)) {
          var st = r.style;
          for (var k = 0; k < st.length; k++) { var p = st[k]; if (p.indexOf('--') === 0 && !seen[p]) { seen[p] = 1; out.push({ name: p, orig: st.getPropertyValue(p).trim() }); } }
        }
      }
    }
    return out;
  }
  var VARS = readRootVars();
  var HEX6 = /^#[0-9a-f]{6}$/i, HEX3 = /^#[0-9a-f]{3}$/i;
  function isColor(v) { return /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v) || /^(?:rgb|hsl)a?\(/i.test(v); }
  function isLen(v) { return /^-?\d*\.?\d+(?:px|rem|em|%|vw|vh)$/i.test(v); }
  function isFontName(n) { return /(?:^|-)(?:font|serif|sans|mono|disp|display|body|narrow|num|type)(?:-|$)/i.test(n.replace(/^--/, '')); }
  function isFontVal(v) { return /,/.test(v) && /[A-Za-z]/.test(v) && !/gradient|rgb|hsl|#|px|em|%|vw/.test(v); }
  function pickable(v) { return HEX6.test(v) || HEX3.test(v); }
  function expand6(v) { return HEX3.test(v) ? '#' + v.slice(1).split('').map(function (c) { return c + c; }).join('') : (HEX6.test(v) ? v.toLowerCase() : '#888888'); }

  var COLORS = [], FONTS = [], SIZES = [];
  VARS.forEach(function (v) {
    if (isColor(v.orig)) COLORS.push(v);
    else if (isFontName(v.name) || isFontVal(v.orig)) FONTS.push(v);
    else if (isLen(v.orig) || /maxw|col|width/.test(v.name)) SIZES.push(v);
  });
  var hasFS = VARS.some(function (v) { return v.name === '--fs'; });
  SIZES = SIZES.filter(function (v) { return v.name !== '--fs'; });

  /* plain-language roles: show these 4 first, hide the rest under "More" */
  var C_ROLES = [
    { key: 'accent', re: /^--(accent|amber|claret|red|blue|gold|cyan|annot)$/ },
    { key: 'background', re: /^--(paper|bg|sheet|surface)$/ },
    { key: 'textc', re: /^--(ink|text|text-hi)$/ },
    { key: 'lines', re: /^--(line|rule|hair)$/ }
  ];
  var F_ROLES = [
    { key: 'heading', re: /^--(disp|narrow)$/ }, { key: 'bodyf', re: /^--(body|sans)$/ }, { key: 'monof', re: /^--(mono|num)$/ }
  ];
  function roleOf(list, name) { for (var i = 0; i < list.length; i++) if (list[i].re.test(name)) return list[i].key; return null; }
  var mainC = [], restC = [], usedRole = {};
  COLORS.forEach(function (v) { var r = roleOf(C_ROLES, v.name); if (r && !usedRole[r]) { usedRole[r] = 1; v.role = r; mainC.push(v); } else restC.push(v); });
  var mainF = [], restF = [], usedF = {};
  FONTS.forEach(function (v) { var r = roleOf(F_ROLES, v.name); if (r && !usedF[r]) { usedF[r] = 1; v.role = r; mainF.push(v); } else restF.push(v); });

  var SYS_FONTS = [], fontRepop = [], loadedFams = {};
  var ACCENT_VAR = { '1-the-desk.html': '--amber', '2-the-blueprint.html': '--blue', '3-the-memo.html': '--claret', '4-the-ledger.html': '--red' };
  var PRESETS = {
    '1-the-desk.html': [{ name: 'Green', accent: '#3DDC84', vars: { '--amber': '#3DDC84', '--amber-soft': 'rgba(61,220,132,.12)' } }, { name: 'Ice', accent: '#4CC5FF', vars: { '--amber': '#4CC5FF', '--amber-soft': 'rgba(76,197,255,.12)' } }, { name: 'Vermilion', accent: '#FF6A3D', vars: { '--amber': '#FF6A3D', '--amber-soft': 'rgba(255,106,61,.12)' } }, { name: 'Slate', accent: '#9FB2C9', vars: { '--amber': '#9FB2C9', '--amber-soft': 'rgba(159,178,201,.12)' } }],
    '2-the-blueprint.html': [{ name: 'Ultramarine', accent: '#2438E0', vars: { '--blue': '#2438E0', '--blue-deep': '#1526B0', '--annot': '#E0662C' } }, { name: 'Teal', accent: '#0E8C9E', vars: { '--blue': '#0E8C9E', '--blue-deep': '#0A6B78', '--annot': '#C24A2C' } }, { name: 'Graphite', accent: '#465A70', vars: { '--blue': '#465A70', '--blue-deep': '#33465A', '--annot': '#7A6A55' } }],
    '3-the-memo.html': [{ name: 'Teal', accent: '#146A6A', vars: { '--claret': '#146A6A', '--claret-2': '#1C8A8A', '--claret-soft': 'rgba(20,106,106,.08)', '--gold': '#3E7C7C' } }, { name: 'Forest', accent: '#2E6B3E', vars: { '--claret': '#2E6B3E', '--claret-2': '#3C8A50', '--claret-soft': 'rgba(46,107,62,.08)', '--gold': '#5C7A3E' } }, { name: 'Navy', accent: '#243A6B', vars: { '--claret': '#243A6B', '--claret-2': '#30508A', '--claret-soft': 'rgba(36,58,107,.08)', '--gold': '#3E5C7C' } }],
    '4-the-ledger.html': [{ name: 'Klein', accent: '#1E34E0', vars: { '--red': '#1E34E0', '--red-deep': '#1526B0' } }, { name: 'Green', accent: '#1E8A4A', vars: { '--red': '#1E8A4A', '--red-deep': '#146638' } }, { name: 'Mono', accent: '#111110', vars: { '--red': '#111110', '--red-deep': '#111110' } }, { name: 'Amber', accent: '#E08A1E', vars: { '--red': '#E08A1E', '--red-deep': '#B76E14' } }]
  };
  var TYPE_PRESETS = {
    '1-the-desk.html': [{ name: 'IBM Plex', map: { '--mono': 'IBM Plex Mono', '--sans': 'IBM Plex Sans' } }, { name: 'JetBrains', map: { '--mono': 'JetBrains Mono', '--sans': 'Inter' } }, { name: 'Space', map: { '--mono': 'Space Mono', '--sans': 'Space Grotesk' } }],
    '2-the-blueprint.html': [{ name: 'Grotesk', map: { '--disp': 'Space Grotesk', '--body': 'Inter', '--mono': 'IBM Plex Mono' } }, { name: 'Archivo', map: { '--disp': 'Archivo', '--body': 'Archivo', '--mono': 'Spline Sans Mono' } }, { name: 'Humanist', map: { '--disp': 'Sora', '--body': 'Public Sans', '--mono': 'IBM Plex Mono' } }],
    '3-the-memo.html': [{ name: 'Fraunces', map: { '--disp': 'Fraunces', '--body': 'Newsreader', '--mono': 'IBM Plex Mono' } }, { name: 'Playfair', map: { '--disp': 'Playfair Display', '--body': 'Source Serif 4', '--mono': 'IBM Plex Mono' } }, { name: 'Lora', map: { '--disp': 'Lora', '--body': 'Lora', '--mono': 'IBM Plex Mono' } }],
    '4-the-ledger.html': [{ name: 'Archivo', map: { '--sans': 'Archivo', '--narrow': 'Archivo Narrow', '--mono': 'IBM Plex Mono', '--num': 'Archivo' } }, { name: 'Space', map: { '--sans': 'Space Grotesk', '--narrow': 'Archivo Narrow', '--mono': 'Space Mono', '--num': 'Space Grotesk' } }, { name: 'Inter × Oswald', map: { '--sans': 'Inter', '--narrow': 'Oswald', '--mono': 'IBM Plex Mono', '--num': 'Inter' } }]
  };

  /* ---------------- state ---------------- */
  var ex = { base: null, lh: null, ls: null, zoom: null }, scope = ':root', scopeOv = {};
  var injEl = mk('style', { id: 'dm-inject' }); doc.head.appendChild(injEl);
  var injScoped = mk('style', { id: 'dm-scoped' }); doc.head.appendChild(injScoped);
  function renderScoped() { var o = ''; for (var s in scopeOv) { var d = scopeOv[s], k = Object.keys(d); if (k.length) o += s + '{' + k.map(function (x) { return x + ':' + d[x]; }).join(';') + '}\n'; } injScoped.textContent = o; }
  function qEl(s) { try { return s === ':root' ? root : doc.querySelector(s); } catch (e) { return null; } }
  function origOf(n) { for (var i = 0; i < VARS.length; i++) if (VARS[i].name === n) return VARS[i].orig; return ''; }
  function putVar(n, v) { if (scope === ':root') root.style.setProperty(n, v); else (scopeOv[scope] || (scopeOv[scope] = {}))[n] = v; }
  function dropVar(n) { if (scope === ':root') root.style.removeProperty(n); else { var o = scopeOv[scope]; if (o) { delete o[n]; if (!Object.keys(o).length) delete scopeOv[scope]; } } }
  function isChanged(n) { if (scope === ':root') return root.style.getPropertyValue(n).trim() !== origOf(n); var o = scopeOv[scope]; return !!(o && o[n] != null); }
  function curVal(n) {
    if (scope === ':root') { var v = root.style.getPropertyValue(n).trim(); return v || origOf(n); }
    var o = scopeOv[scope]; if (o && o[n] != null) return o[n];
    var e = qEl(scope); if (e) { var cv = getComputedStyle(e).getPropertyValue(n).trim(); if (cv) return cv; }
    return origOf(n);
  }
  function curVars() { var o = {}; VARS.forEach(function (v) { var c = root.style.getPropertyValue(v.name).trim(); if (c && c !== v.orig) o[v.name] = c; }); return o; }
  function injCSS(e) { var b = [], h = []; if (e.base != null) b.push('font-size:' + e.base + 'px'); if (e.lh != null) b.push('line-height:' + e.lh); if (e.ls != null) b.push('letter-spacing:' + e.ls + 'em'); if (e.zoom != null) h.push('zoom:' + e.zoom); return (b.length ? 'body{' + b.join(';') + '}\n' : '') + (h.length ? 'html{' + h.join(';') + '}' : ''); }
  function writeInject() { injEl.textContent = injCSS(ex); }
  function readState() { return { ov: curVars(), ex: { base: ex.base, lh: ex.lh, ls: ex.ls, zoom: ex.zoom }, scopes: JSON.parse(JSON.stringify(scopeOv)) }; }
  function applyState(s) {
    VARS.forEach(function (v) { root.style.removeProperty(v.name); });
    for (var n in s.ov) root.style.setProperty(n, s.ov[n]);
    ex = { base: null, lh: null, ls: null, zoom: null }; if (s.ex) for (var k in ex) if (s.ex[k] != null) ex[k] = s.ex[k];
    scopeOv = s.scopes ? JSON.parse(JSON.stringify(s.scopes)) : {}; renderScoped(); writeInject(); saveMain(); syncUI(); updateBar();
  }
  function loadMain() { try { return JSON.parse(localStorage.getItem(STORE)); } catch (e) { return null; } }
  function saveMain() { try { localStorage.setItem(STORE, JSON.stringify(readState())); } catch (e) {} }
  var hist = [], ptr = -1, cT;
  function commit() { var s = readState(); if (ptr >= 0 && JSON.stringify(hist[ptr]) === JSON.stringify(s)) return; hist = hist.slice(0, ptr + 1); hist.push(s); ptr = hist.length - 1; if (hist.length > 100) { hist.shift(); ptr--; } updateBar(); }
  function schedule() { clearTimeout(cT); cT = setTimeout(commit, 350); }
  function undo() { if (ptr <= 0) return; clearTimeout(cT); ptr--; applyState(hist[ptr]); }
  function redo() { if (ptr >= hist.length - 1) return; clearTimeout(cT); ptr++; applyState(hist[ptr]); }
  function edit(n, v) { putVar(n, v); if (scope !== ':root') renderScoped(); if (ctl[n]) ctl[n].mark(); saveMain(); schedule(); }
  function editEx(k, v) { ex[k] = v; writeInject(); saveMain(); schedule(); }
  (function () { var s = loadMain(); if (s) { if (s.ov) for (var n in s.ov) root.style.setProperty(n, s.ov[n]); if (s.ex) for (var k in ex) if (s.ex[k] != null) ex[k] = s.ex[k]; if (s.scopes) { scopeOv = s.scopes; renderScoped(); } writeInject(); } hist = [readState()]; ptr = 0; })();

  /* ---------------- icons (one consistent stroke set) ---------------- */
  function ico(d, extra) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + (extra || '') + '</svg>'; }
  var I = {
    colour: ico('<path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H13a2 2 0 0 1 0-4h4a4 4 0 0 0 4-4c0-3.9-4-6-9-6Z"/><circle cx="7.5" cy="10.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="7.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="16.5" cy="10.5" r="1.2" fill="currentColor" stroke="none"/>'),
    text: ico('<path d="M4 6V5h16v1M12 5v14M9 19h6"/>'),
    layout: ico('<rect x="3" y="3" width="18" height="6" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="14" y="13" width="7" height="8" rx="1.5"/>'),
    save: ico('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h7"/>'),
    undo: ico('<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-4"/>'),
    redo: ico('<path d="m15 14 5-5-5-5"/><path d="M20 9H9a5 5 0 0 0 0 10h4"/>'),
    pick: ico('<path d="m3 3 7.5 18 2.5-7.5L21 11 3 3Z"/>'),
    frame: ico('<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>'),
    close: ico('<path d="M18 6 6 18M6 6l12 12"/>'),
    chev: ico('<path d="m6 9 6 6 6-6"/>'),
    trash: ico('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>')
  };

  /* ---------------- styles ---------------- */
  var css = `
  #dm-fab{position:fixed;left:18px;bottom:18px;z-index:2147483000;display:inline-flex;align-items:center;gap:9px;
    font:600 13px/1 ui-sans-serif,system-ui,"PingFang SC","Microsoft YaHei",sans-serif;color:#0b0b0c;background:#fff;
    border:0;border-radius:999px;padding:12px 18px;cursor:pointer;box-shadow:0 6px 26px rgba(0,0,0,.28);transition:transform .35s cubic-bezier(.22,1,.36,1)}
  #dm-fab:hover{transform:translateY(-2px)}
  #dm-fab svg{width:16px;height:16px}
  #dm-panel{position:fixed;top:0;right:0;height:100%;width:368px;max-width:92vw;z-index:2147483001;background:#101216;color:#dfe3ea;
    border-left:1px solid #232830;box-shadow:-20px 0 60px rgba(0,0,0,.45);display:flex;flex-direction:column;
    font:14px/1.55 ui-sans-serif,system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;
    transform:translateX(100%);transition:transform .34s cubic-bezier(.22,1,.36,1)}
  #dm-panel.open{transform:none}
  #dm-panel *{box-sizing:border-box}
  #dm-panel h4{font-size:12px;font-weight:600;letter-spacing:.04em;color:#7d8694;text-transform:uppercase;margin:22px 0 10px}
  #dm-panel h4:first-child{margin-top:4px}
  /* header */
  #dm-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:15px 16px;border-bottom:1px solid #1e232b}
  #dm-hd b{font-size:15px;font-weight:600;color:#fff}
  .dm-lang{display:flex;background:#191d24;border:1px solid #262c36;border-radius:999px;padding:2px}
  .dm-lang button{border:0;background:none;color:#8b94a3;font:600 11px ui-sans-serif,system-ui;padding:5px 10px;border-radius:999px;cursor:pointer}
  .dm-lang button.on{background:#fff;color:#0b0b0c}
  .dm-x{border:0;background:none;color:#8b94a3;cursor:pointer;padding:6px;border-radius:8px;display:grid;place-items:center}
  .dm-x:hover{background:#1d222a;color:#fff}.dm-x svg{width:17px;height:17px}
  /* scope */
  #dm-scope{display:flex;gap:7px;align-items:center;padding:11px 16px;border-bottom:1px solid #1e232b;background:#0c0e12}
  #dm-scope .lb{font-size:11px;color:#7d8694;white-space:nowrap}
  #dm-scope select{flex:1;min-width:0;background:#191d24;border:1px solid #262c36;color:#dfe3ea;border-radius:8px;padding:7px 8px;font:12px ui-sans-serif,system-ui;outline:none}
  #dm-scope select.on{border-color:#f5a623;color:#f7c46c}
  .dm-ib{border:1px solid #262c36;background:#191d24;color:#a9b2c0;border-radius:8px;padding:6px;cursor:pointer;display:grid;place-items:center}
  .dm-ib:hover{background:#222833;color:#fff}.dm-ib.on{background:#fff;color:#0b0b0c;border-color:#fff}
  .dm-ib svg{width:15px;height:15px}
  /* tabs */
  #dm-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:8px;border-bottom:1px solid #1e232b}
  #dm-tabs button{display:flex;flex-direction:column;align-items:center;gap:5px;background:none;border:0;color:#8b94a3;
    padding:9px 2px;border-radius:9px;cursor:pointer;font:600 11px ui-sans-serif,system-ui;transition:background .2s,color .2s}
  #dm-tabs button svg{width:18px;height:18px}
  #dm-tabs button:hover{background:#181c23;color:#cdd4de}
  #dm-tabs button.on{background:#fff;color:#0b0b0c}
  /* body */
  #dm-body{flex:1;overflow-y:auto;padding:6px 16px 16px}
  .dm-pane{display:none}.dm-pane.on{display:block}
  .dm-tip{font-size:11.5px;color:#6b7482;background:#0c0e12;border:1px solid #1e232b;border-radius:9px;padding:9px 11px;margin:10px 0 2px;line-height:1.5}
  /* swatch chips */
  .dm-chips{display:flex;flex-wrap:wrap;gap:7px}
  .dm-chip{display:inline-flex;align-items:center;gap:7px;border:1px solid #262c36;background:#191d24;color:#cdd4de;border-radius:999px;
    padding:6px 12px 6px 8px;cursor:pointer;font:500 12px ui-sans-serif,system-ui;transition:.15s}
  .dm-chip:hover{border-color:#fff;color:#fff}
  .dm-chip i{width:12px;height:12px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}
  .dm-chip .kill{color:#6b7482;font-weight:700;margin-left:1px}
  /* rows */
  .dm-row{display:flex;align-items:center;gap:11px;padding:8px 0}
  .dm-row .nm{flex:1;min-width:0;font-size:13px;color:#c3cad4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .dm-row.chg .nm{color:#fff;font-weight:500}
  .dm-row .var{font:10.5px ui-monospace,monospace;color:#5b6472;margin-left:6px}
  .dm-sw{width:32px;height:32px;border-radius:9px;border:1px solid rgba(255,255,255,.14);flex:none;position:relative;overflow:hidden;cursor:pointer;
    background-image:linear-gradient(45deg,#2a2f38 25%,transparent 25%,transparent 75%,#2a2f38 75%),linear-gradient(45deg,#2a2f38 25%,#1a1f27 25%,#1a1f27 75%,#2a2f38 75%);background-size:10px 10px;background-position:0 0,5px 5px}
  .dm-sw i{position:absolute;inset:0}
  .dm-sw input{position:absolute;inset:-6px;width:150%;height:150%;border:0;padding:0;background:none;cursor:pointer;opacity:0}
  .dm-hex{width:96px;flex:none;background:#191d24;border:1px solid #262c36;color:#dfe3ea;border-radius:8px;padding:7px 8px;font:11.5px ui-monospace,monospace;outline:none}
  .dm-hex:focus,.dm-sel:focus,.dm-txt:focus{border-color:#5a6472}
  .dm-sel,.dm-txt{background:#191d24;border:1px solid #262c36;color:#dfe3ea;border-radius:8px;padding:7px 8px;font:12px ui-sans-serif,system-ui;outline:none;min-width:0}
  /* disclosure */
  .dm-more{margin-top:14px;border-top:1px solid #1e232b;padding-top:6px}
  .dm-more>summary{list-style:none;cursor:pointer;font-size:12px;color:#7d8694;padding:8px 0;display:flex;align-items:center;gap:7px}
  .dm-more>summary::-webkit-details-marker{display:none}
  .dm-more>summary svg{width:13px;height:13px;transition:transform .25s}
  .dm-more[open]>summary svg{transform:rotate(180deg)}
  .dm-more>summary:hover{color:#cdd4de}
  /* sliders */
  .dm-sl{padding:9px 0}
  .dm-sl .top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}
  .dm-sl .nm{font-size:13px;color:#c3cad4}
  .dm-sl .val{font:600 12px ui-monospace,monospace;color:#fff}
  .dm-sl input[type=range]{width:100%;accent-color:#fff;cursor:pointer}
  .dm-sl .rr{background:none;border:0;color:#5b6472;font-size:11px;cursor:pointer;padding:0 0 0 8px}
  .dm-sl .rr:hover{color:#fff}
  .dm-fnt{padding:9px 0;border-bottom:1px solid #1a1f26}
  .dm-fnt .nm{font-size:13px;color:#c3cad4;margin-bottom:7px}
  .dm-fnt .cw{display:flex;gap:7px}.dm-fnt .cw select{flex:1}.dm-fnt .cw input{flex:1}
  .dm-fnt .pv{margin-top:8px;font-size:16px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dm-btn{width:100%;border:1px dashed #39414f;background:#12161d;color:#a9b2c0;border-radius:9px;padding:10px;cursor:pointer;font:500 12px ui-sans-serif,system-ui;margin-top:8px}
  .dm-btn:hover:not(:disabled){background:#181d25;color:#fff;border-color:#4d576a}
  .dm-btn:disabled{opacity:.55;cursor:default}
  .dm-solid{border:1px solid #262c36;background:#191d24;border-style:solid}
  .dm-bk .r{display:flex;gap:7px;margin-top:8px}
  .dm-bk .r>*{min-width:0}.dm-bk input,.dm-bk select{flex:1}
  .dm-bk button{border:1px solid #262c36;background:#191d24;color:#cdd4de;border-radius:8px;padding:8px 11px;cursor:pointer;font:500 12px ui-sans-serif,system-ui;white-space:nowrap}
  .dm-bk button:hover{background:#222833;color:#fff}
  /* footer action bar */
  #dm-ft{border-top:1px solid #1e232b;padding:10px;display:grid;grid-template-columns:auto auto 1fr auto;gap:7px;align-items:center;background:#0c0e12}
  #dm-ft .dm-ib{padding:9px}
  #dm-ft .txt{border:1px solid #262c36;background:#191d24;color:#a9b2c0;border-radius:9px;padding:9px 12px;cursor:pointer;font:500 12px ui-sans-serif,system-ui}
  #dm-ft .txt:hover{background:#222833;color:#fff}
  #dm-ft .done{background:#fff;color:#0b0b0c;border:0;border-radius:9px;padding:10px 18px;cursor:pointer;font:600 12.5px ui-sans-serif,system-ui}
  #dm-toast{position:fixed;left:50%;bottom:26px;transform:translate(-50%,10px);z-index:2147483002;background:#fff;color:#0b0b0c;
    border-radius:999px;padding:10px 18px;font:600 12.5px ui-sans-serif,system-ui;opacity:0;pointer-events:none;transition:.22s;box-shadow:0 8px 30px rgba(0,0,0,.3)}
  #dm-toast.show{opacity:1;transform:translate(-50%,0)}
  /* on-page section outlines */
  #dm-out{position:fixed;inset:0;z-index:2147482998;pointer-events:none}
  .dm-ob{position:fixed;border:1px dashed rgba(255,255,255,.35);border-radius:3px}
  .dm-ob.has{border-color:#f5a623;background:rgba(245,166,35,.06)}
  .dm-ob.act{border:2px solid #fff;background:rgba(255,255,255,.07)}
  .dm-ob.hv{border:2px solid #63e6a8;background:rgba(99,230,168,.14);z-index:2}
  .dm-ol{position:absolute;top:0;left:0;transform:translateY(-100%);background:#fff;color:#0b0b0c;font:600 10px ui-sans-serif,system-ui;
    padding:3px 7px;border-radius:4px 4px 4px 0;white-space:nowrap;pointer-events:auto;cursor:pointer;max-width:60vw;overflow:hidden;text-overflow:ellipsis}
  .dm-ob.hv .dm-ol{background:#63e6a8}
  @media(max-width:560px){#dm-panel{width:100%;max-width:100%}}
  @media(prefers-reduced-motion:reduce){#dm-panel,#dm-fab,#dm-toast{transition:none}}
  `;
  var styleEl = mk('style', { id: 'dm-style' }); styleEl.textContent = css; doc.head.appendChild(styleEl);

  /* ---------------- shell ---------------- */
  var fab = mk('button', { id: 'dm-fab' });
  var panel = mk('aside', { id: 'dm-panel', role: 'dialog' });
  var toast = mk('div', { id: 'dm-toast' });
  var outWrap = mk('div', { id: 'dm-out' }); outWrap.style.display = 'none';
  var fileIn = mk('input', { type: 'file', accept: '.json' }); fileIn.style.display = 'none';
  docBody.appendChild(fab); docBody.appendChild(panel); docBody.appendChild(toast); docBody.appendChild(outWrap); docBody.appendChild(fileIn);

  panel.innerHTML =
    '<div id="dm-hd"><b data-i="title"></b><div style="display:flex;gap:8px;align-items:center">' +
      '<div class="dm-lang"><button data-l="en">EN</button><button data-l="zh">中</button></div>' +
      '<button class="dm-x" id="dm-close2">' + I.close + '</button></div></div>' +
    '<div id="dm-scope"><span class="lb" data-i="editing"></span><select id="dm-sel"></select>' +
      '<button class="dm-ib" id="dm-pick" title="">' + I.pick + '</button>' +
      '<button class="dm-ib" id="dm-frame" title="">' + I.frame + '</button></div>' +
    '<div id="dm-tabs">' +
      '<button data-t="c" class="on">' + I.colour + '<span data-i="tColour"></span></button>' +
      '<button data-t="t">' + I.text + '<span data-i="tText"></span></button>' +
      '<button data-t="l">' + I.layout + '<span data-i="tLayout"></span></button>' +
      '<button data-t="s">' + I.save + '<span data-i="tSave"></span></button></div>' +
    '<div id="dm-body">' +
      '<div class="dm-pane on" data-p="c"></div><div class="dm-pane" data-p="t"></div>' +
      '<div class="dm-pane" data-p="l"></div><div class="dm-pane" data-p="s"></div></div>' +
    '<div id="dm-ft"><button class="dm-ib" id="dm-undo">' + I.undo + '</button><button class="dm-ib" id="dm-redo">' + I.redo + '</button>' +
      '<button class="txt" id="dm-reset" data-i="reset"></button><button class="done" id="dm-done" data-i="done"></button></div>';

  var panes = {}; panel.querySelectorAll('.dm-pane').forEach(function (p) { panes[p.dataset.p] = p; });
  var ctl = {}, exCtl = {}, i18nNodes = [];

  /* ---------------- COLOUR ---------------- */
  var palBox, typBox;
  (function build() {
    var p = panes.c;
    p.appendChild(h4('presets')); palBox = mk('div', { class: 'dm-chips' }); p.appendChild(palBox); renderPal();
    if (!COLORS.length) { p.appendChild(note('none')); return; }
    p.appendChild(h4('mainC'));
    mainC.forEach(function (v) { p.appendChild(colorRow(v, t(v.role))); });
    if (restC.length) {
      var d = mk('details', { class: 'dm-more' }); var s = mk('summary'); s.innerHTML = I.chev + '<span data-i="moreC"></span>'; i18nNodes.push(s.querySelector('[data-i]'));
      d.appendChild(s); restC.forEach(function (v) { d.appendChild(colorRow(v, pretty(v.name), true)); }); p.appendChild(d);
    }
  })();
  function colorRow(v, label, showVar) {
    var cur = curVal(v.name), row = mk('div', { class: 'dm-row' });
    var nm = mk('div', { class: 'nm' }); nm.textContent = label; if (showVar) { var s = mk('span', { class: 'var' }); s.textContent = v.name; nm.appendChild(s); }
    var sw = mk('label', { class: 'dm-sw' }), si = mk('i'); sw.appendChild(si); si.style.background = cur;
    var ci = mk('input', { type: 'color' }); ci.value = expand6(pickable(cur) ? cur : v.orig); sw.appendChild(ci);
    var hx = mk('input', { class: 'dm-hex', type: 'text', spellcheck: 'false' }); hx.value = cur;
    ci.addEventListener('input', function () { hx.value = ci.value; si.style.background = ci.value; edit(v.name, ci.value); });
    hx.addEventListener('input', function () { var x = hx.value.trim(); si.style.background = x; if (pickable(x)) ci.value = expand6(x); edit(v.name, x); });
    row.appendChild(nm); row.appendChild(sw); row.appendChild(hx);
    ctl[v.name] = { set: function (x) { si.style.background = x; hx.value = x; if (pickable(x)) ci.value = expand6(x); this.mark(); }, mark: function () { row.classList.toggle('chg', isChanged(v.name)); } };
    ctl[v.name].mark(); return row;
  }
  function renderPal() {
    palBox.innerHTML = '';
    palBox.appendChild(chip(t('original'), null, function () { COLORS.forEach(function (v) { dropVar(v.name); }); renderScoped(); syncUI(); saveMain(); commit(); toastMsg(t('okReset')); }));
    (PRESETS[file()] || []).forEach(function (pr) { palBox.appendChild(chip(pr.name, pr.accent, function () { applyPal(pr); })); });
    userP('color').forEach(function (pr) { palBox.appendChild(chip(pr.name, pr.accent, function () { applyPal(pr); }, function () { delUserP('color', pr.name); renderPal(); })); });
    palBox.appendChild(chip(t('savePal'), null, savePal));
  }
  function applyPal(p) { COLORS.forEach(function (v) { dropVar(v.name); }); for (var n in p.vars) putVar(n, p.vars[n]); renderScoped(); syncUI(); saveMain(); commit(); toastMsg(t('okPreset') + ' · ' + p.name); }
  function savePal() {
    var o = {}; COLORS.forEach(function (v) { var c = root.style.getPropertyValue(v.name).trim(); if (c && c !== v.orig) o[v.name] = c; });
    if (!Object.keys(o).length) { toastMsg(t('noChange')); return; }
    var n = ask(t('nameHint')); if (!n) return;
    var av = ACCENT_VAR[file()]; addUserP('color', { name: n, accent: av ? (o[av] || curVal(av)) : null, vars: o }); renderPal(); toastMsg(t('okSaved'));
  }

  /* ---------------- TEXT ---------------- */
  var FONT_OPTS = buildFontOpts();
  (function build() {
    var p = panes.t;
    p.appendChild(h4('fontSets')); typBox = mk('div', { class: 'dm-chips' }); p.appendChild(typBox); renderTyp();
    if (hasFS) { p.appendChild(h4('textSize')); p.appendChild(varSlider('--fs', 'textSize', '×', .8, 1.5, .02)); }
    p.appendChild(h4('fontsFor'));
    var sys = mk('button', { class: 'dm-btn' }); sys.setAttribute('data-i', 'sysFonts'); i18nNodes.push(sys);
    sys.addEventListener('click', function () { loadSys(sys); }); p.appendChild(sys);
    if (!FONTS.length) p.appendChild(note('noFonts'));
    mainF.forEach(function (v) { p.appendChild(fontRow(v, t(v.role))); });
    restF.forEach(function (v) { p.appendChild(fontRow(v, pretty(v.name))); });
    var d = mk('details', { class: 'dm-more' }); var s = mk('summary'); s.innerHTML = I.chev + '<span data-i="fine"></span>'; i18nNodes.push(s.querySelector('[data-i]'));
    d.appendChild(s);
    d.appendChild(exSlider('base', 'bSize', 'px', 12, 22, .5, function () { return px(getComputedStyle(docBody).fontSize); }));
    d.appendChild(exSlider('lh', 'bLine', '', 1.2, 2.1, .02, function () { var c = getComputedStyle(docBody); var r = px(c.lineHeight) / px(c.fontSize); return r ? rnd(r, 2) : 1.6; }));
    d.appendChild(exSlider('ls', 'bTrack', 'em', -.03, .14, .005, function () { var c = getComputedStyle(docBody); return c.letterSpacing === 'normal' ? 0 : rnd(px(c.letterSpacing) / px(c.fontSize), 3); }));
    p.appendChild(d);
  })();
  function buildFontOpts() { var g = []; doc.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(function (l) { (l.href.match(/family=([^&]+)/g) || []).forEach(function (m) { var n = decodeURIComponent(m.slice(7).split(':')[0]).replace(/\+/g, ' '); loadedFams[n] = 1; if (g.indexOf(n) < 0) g.push(n); }); }); return g.concat(['system-ui', 'Georgia', 'Times New Roman', 'Arial', 'Courier New']); }
  function stackFor(n) { var se = /Fraunces|Newsreader|Georgia|Times|Song|Playfair|Lora|Source Serif|serif/i.test(n), mo = /Mono|Consolas|Courier|Code/i.test(n); var fb = mo ? 'ui-monospace,monospace' : se ? 'Georgia,"Songti SC",serif' : 'system-ui,"PingFang SC","Microsoft YaHei",sans-serif'; return /^system-ui$/.test(n) ? n + ',' + fb : '"' + n + '",' + fb; }
  function firstFam(s) { var m = s.match(/^\s*(?:"([^"]+)"|'([^']+)'|([^,]+))/); return m ? (m[1] || m[2] || m[3]).trim() : ''; }
  function fontRow(v, label) {
    var cur = curVal(v.name), row = mk('div', { class: 'dm-fnt' });
    var nm = mk('div', { class: 'nm' }); nm.textContent = label;
    var cw = mk('div', { class: 'cw' }), sel = mk('select', { class: 'dm-sel' }), txt = mk('input', { class: 'dm-txt', type: 'text', spellcheck: 'false' });
    txt.value = cur; var pv = mk('div', { class: 'pv' }); pv.textContent = 'Aa Bb Cc  123  中文'; pv.style.fontFamily = cur;
    function selFrom(s) { var f = firstFam(s); sel.value = FONT_OPTS.indexOf(f) >= 0 ? f : '__c'; }
    function repop() { var c = curVal(v.name); sel.innerHTML = ''; FONT_OPTS.forEach(function (o) { var op = mk('option'); op.value = o; op.textContent = o; sel.appendChild(op); }); var oc = mk('option'); oc.value = '__c'; oc.textContent = t('custom'); sel.appendChild(oc); selFrom(c); }
    fontRepop.push(repop); repop();
    sel.addEventListener('change', function () { if (sel.value === '__c') { txt.focus(); return; } var s = stackFor(sel.value); txt.value = s; pv.style.fontFamily = s; edit(v.name, s); mark(); });
    txt.addEventListener('input', function () { var x = txt.value.trim(); pv.style.fontFamily = x; selFrom(x); edit(v.name, x); mark(); });
    cw.appendChild(sel); cw.appendChild(txt); row.appendChild(nm); row.appendChild(cw); row.appendChild(pv);
    function mark() { nm.style.color = isChanged(v.name) ? '#fff' : '#c3cad4'; }
    ctl[v.name] = { set: function (x) { txt.value = x; pv.style.fontFamily = x; selFrom(x); mark(); }, mark: mark }; mark(); return row;
  }
  function renderTyp() {
    typBox.innerHTML = '';
    (TYPE_PRESETS[file()] || []).forEach(function (p) { typBox.appendChild(chip(p.name, null, function () { applyTyp(p); })); });
    userP('type').forEach(function (p) { typBox.appendChild(chip(p.name, null, function () { applyTyp(p); }, function () { delUserP('type', p.name); renderTyp(); })); });
    typBox.appendChild(chip(t('saveFonts'), null, function () {
      var n = ask(t('nameHint')); if (!n) return; var m = {}; FONTS.forEach(function (v) { m[v.name] = firstFam(curVal(v.name)); });
      var e = { name: n, map: m }; if (hasFS) e.fs = curVal('--fs'); addUserP('type', e); renderTyp(); toastMsg(t('okSaved'));
    }));
  }
  function applyTyp(p) {
    var fams = []; for (var r in p.map) if (p.map[r]) fams.push(p.map[r]);
    ensureFonts(fams); FONTS.forEach(function (v) { dropVar(v.name); });
    for (var role in p.map) if (varExists(role) && p.map[role]) putVar(role, stackFor(p.map[role]));
    if (p.fs != null && hasFS) putVar('--fs', String(p.fs));
    renderScoped(); fams.forEach(function (f) { if (FONT_OPTS.indexOf(f) < 0) FONT_OPTS.push(f); }); fontRepop.forEach(function (f) { f(); });
    syncUI(); saveMain(); commit(); toastMsg(t('okPreset') + ' · ' + p.name);
  }
  function ensureFonts(fams) {
    var need = []; fams.forEach(function (f) { if (f && !loadedFams[f] && !/^(system-ui|Georgia|Arial|Times New Roman|Courier New)$/.test(f)) need.push(f); });
    need = uniq(need); if (!need.length) return; need.forEach(function (f) { loadedFams[f] = 1; });
    var l = mk('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?' + need.map(function (f) { return 'family=' + f.replace(/ /g, '+') + ':wght@400;700'; }).join('&') + '&display=swap'; doc.head.appendChild(l);
  }
  function loadSys(btn) {
    if (!window.queryLocalFonts) { toastMsg(t('sysNo')); return; }
    btn.disabled = true;
    window.queryLocalFonts().then(function (fs) {
      var s = {}, l = []; fs.forEach(function (f) { if (f.family && !s[f.family]) { s[f.family] = 1; l.push(f.family); } });
      l.sort(); SYS_FONTS = l; FONT_OPTS = uniq(l.concat(FONT_OPTS)); fontRepop.forEach(function (f) { f(); });
      toastMsg(lang === 'zh' ? l.length + t('sysOk') : l.length + ' ' + t('sysOk'));
    }).catch(function () { toastMsg(t('sysNo')); }).then(function () { btn.disabled = false; });
  }

  /* ---------------- LAYOUT ---------------- */
  (function build() {
    var p = panes.l;
    p.appendChild(h4('addBlock'));
    var host = mk('div', { id: 'dm-blockhost' }); p.appendChild(host);
    var hint = mk('div', { class: 'dm-tip' }); hint.setAttribute('data-i', 'dragHint'); i18nNodes.push(hint); p.appendChild(hint);
    if (SIZES.length) { p.appendChild(h4('pageW')); SIZES.forEach(function (v) { p.appendChild(sizeSlider(v)); }); }
    p.appendChild(h4('zoom')); p.appendChild(exSlider('zoom', 'zoom', '×', .75, 1.3, .01, function () { return 1; }));
  })();

  /* ---------------- SAVE ---------------- */
  (function build() {
    var p = panes.s;
    p.appendChild(h4('copyCss'));
    var b = mk('button', { class: 'dm-btn dm-solid' }); b.setAttribute('data-i', 'copyCss'); i18nNodes.push(b);
    b.addEventListener('click', copyCSS); p.appendChild(b);
    var d = mk('div', { class: 'dm-tip' }); d.setAttribute('data-i', 'copyCssD'); i18nNodes.push(d); p.appendChild(d);
    p.appendChild(h4('backups'));
    var w = mk('div', { class: 'dm-bk' });
    w.innerHTML = '<div class="r"><input class="dm-txt" id="dm-bkn"><button id="dm-bks" data-i="save"></button></div>' +
      '<div class="r"><select class="dm-sel" id="dm-bkl"></select><button id="dm-bkld" data-i="load"></button><button id="dm-bkd" data-i="del"></button></div>' +
      '<div class="r"><button id="dm-exp" style="flex:1" data-i="expo"></button><button id="dm-imp" style="flex:1" data-i="impo"></button></div>';
    p.appendChild(w); w.querySelectorAll('[data-i]').forEach(function (n) { i18nNodes.push(n); });
    var tip = mk('div', { class: 'dm-tip' }); tip.setAttribute('data-i', 'tip'); i18nNodes.push(tip); p.appendChild(tip);
  })();
  function copyCSS() {
    var o = curVars(), k = Object.keys(o), out = '';
    if (k.length) out += ':root{\n' + k.map(function (x) { return '  ' + x + ': ' + o[x] + ';'; }).join('\n') + '\n}\n';
    for (var s in scopeOv) { var d = scopeOv[s], sk = Object.keys(d); if (sk.length) out += (out ? '\n' : '') + s + '{\n' + sk.map(function (x) { return '  ' + x + ': ' + d[x] + ';'; }).join('\n') + '\n}\n'; }
    var inj = injCSS(ex); if (inj) out += (out ? '\n' : '') + inj;
    if (!out) { toastMsg(t('noChange')); return; } copy(out.trim()); toastMsg(t('okCopy'));
  }

  /* ---------------- generic controls ---------------- */
  function varSlider(name, key, unit, mn, mx, st) {
    var orig = origOf(name) || '1', w = mk('div', { class: 'dm-sl' }), top = mk('div', { class: 'top' });
    var nm = mk('span', { class: 'nm' }); nm.setAttribute('data-i', key); i18nNodes.push(nm);
    var val = mk('span', { class: 'val' }), rr = mk('button', { class: 'rr' }); rr.textContent = '↺';
    top.appendChild(nm); top.appendChild(mk('span')); top.lastChild.append(val, rr);
    var r = mk('input', { type: 'range', min: mn, max: mx, step: st });
    function show() { var c = curVal(name), n = parseFloat(c); if (isNaN(n)) n = parseFloat(orig) || 1; r.value = n; val.textContent = rnd(n, 2) + unit; }
    r.addEventListener('input', function () { edit(name, String(r.value)); val.textContent = rnd(parseFloat(r.value), 2) + unit; });
    rr.addEventListener('click', function () { dropVar(name); renderScoped(); saveMain(); schedule(); show(); });
    w.appendChild(top); w.appendChild(r); ctl[name] = { set: show, mark: function () {} }; show(); return w;
  }
  function sizeSlider(v) {
    var cur = curVal(v.name); if (!isLen(cur)) return mk('span');
    var n = parseFloat(cur), u = cur.replace(/^-?\d*\.?\d+/, '') || 'px';
    var w = mk('div', { class: 'dm-sl' }), top = mk('div', { class: 'top' });
    var nm = mk('span', { class: 'nm' }); nm.textContent = pretty(v.name);
    var val = mk('span', { class: 'val' }); val.textContent = cur;
    var rr = mk('button', { class: 'rr' }); rr.textContent = '↺';
    top.appendChild(nm); var g = mk('span'); g.append(val, rr); top.appendChild(g);
    var r = mk('input', { type: 'range', min: Math.round(n * .5), max: Math.round(n * 1.6), step: n >= 200 ? 10 : 1 }); r.value = n;
    r.addEventListener('input', function () { var nv = r.value + u; val.textContent = nv; edit(v.name, nv); });
    rr.addEventListener('click', function () { dropVar(v.name); renderScoped(); val.textContent = v.orig; r.value = parseFloat(v.orig); saveMain(); schedule(); });
    w.appendChild(top); w.appendChild(r); ctl[v.name] = { set: function (x) { val.textContent = x; r.value = parseFloat(x); }, mark: function () {} }; return w;
  }
  function exSlider(key, label, unit, mn, mx, st, def) {
    var w = mk('div', { class: 'dm-sl' }), top = mk('div', { class: 'top' });
    var nm = mk('span', { class: 'nm' }); nm.setAttribute('data-i', label); i18nNodes.push(nm);
    var val = mk('span', { class: 'val' }), rr = mk('button', { class: 'rr' }); rr.textContent = '↺';
    top.appendChild(nm); var g = mk('span'); g.append(val, rr); top.appendChild(g);
    var r = mk('input', { type: 'range', min: mn, max: mx, step: st });
    function disp() { var a = ex[key] != null, v = a ? ex[key] : def(); r.value = v; val.textContent = rnd(v, 3) + unit; }
    r.addEventListener('input', function () { editEx(key, parseFloat(r.value)); val.textContent = rnd(parseFloat(r.value), 3) + unit; });
    rr.addEventListener('click', function () { editEx(key, null); disp(); });
    w.appendChild(top); w.appendChild(r); disp(); exCtl[key] = { set: disp }; return w;
  }
  function syncUI() { VARS.forEach(function (v) { if (ctl[v.name]) ctl[v.name].set(curVal(v.name)); }); for (var k in exCtl) exCtl[k].set(); }

  /* ---------------- scope ---------------- */
  var sel = panel.querySelector('#dm-sel'), pickB = panel.querySelector('#dm-pick'), frameB = panel.querySelector('#dm-frame');
  var SCOPE_SEL = 'section,header.nav,header,footer,.hero,.cta,[id]';
  function selectorFor(e) {
    if (e === root) return ':root'; if (e.id) return '#' + e.id;
    var tg = e.tagName.toLowerCase();
    for (var i = 0; i < e.classList.length; i++) { var s = tg + '.' + e.classList[i]; try { if (doc.querySelectorAll(s).length === 1) return s; } catch (x) {} }
    try { if (doc.querySelectorAll(tg).length === 1) return tg; } catch (x) {} return null;
  }
  function scopes() {
    var l = [{ sel: ':root', label: '🌐 ' + t('whole') }], seen = { ':root': 1 };
    docBody.querySelectorAll(SCOPE_SEL).forEach(function (e) {
      if (e.closest('#dm-panel,#dm-fab,#dm-toast,#dm-out')) return;
      var r = e.getBoundingClientRect(); if (r.height < 24) return;
      var s = selectorFor(e); if (!s || seen[s]) return; seen[s] = 1;
      var h = e.querySelector('h1,h2,h3'); var txt = h ? h.textContent.trim().replace(/\s+/g, ' ').slice(0, 22) : s;
      l.push({ sel: s, label: txt });
    });
    return l;
  }
  function fillSel() { sel.innerHTML = ''; scopes().forEach(function (o) { var op = mk('option'); op.value = o.sel; op.textContent = o.label; sel.appendChild(op); }); sel.value = scope; }
  function setScope(s) { scope = s || ':root'; fillSel(); sel.classList.toggle('on', scope !== ':root'); syncUI(); drawOutlines(); }
  sel.addEventListener('change', function () { setScope(sel.value); });

  /* outlines + hover pick */
  var outOn = false, boxes = [], hoverBox = null, picking = false;
  function drawOutlines() {
    outWrap.innerHTML = ''; boxes = [];
    if (!outOn) { outWrap.style.display = 'none'; return; }
    outWrap.style.display = 'block';
    scopes().forEach(function (o) {
      if (o.sel === ':root') return; var e = qEl(o.sel); if (!e) return;
      var b = mk('div', { class: 'dm-ob' }); var lb = mk('div', { class: 'dm-ol' }); lb.textContent = o.label;
      lb.addEventListener('click', function (ev) { ev.stopPropagation(); setScope(o.sel); });
      b.appendChild(lb); outWrap.appendChild(b); boxes.push({ el: e, box: b, sel: o.sel });
    });
    posOutlines(); styleOutlines();
  }
  function posOutlines() { boxes.forEach(function (b) { var r = b.el.getBoundingClientRect(); b.box.style.cssText += ''; b.box.style.left = r.left + 'px'; b.box.style.top = r.top + 'px'; b.box.style.width = r.width + 'px'; b.box.style.height = r.height + 'px'; }); }
  function styleOutlines() { boxes.forEach(function (b) { var o = scopeOv[b.sel]; b.box.classList.toggle('has', !!(o && Object.keys(o).length)); b.box.classList.toggle('act', b.sel === scope); }); }
  function boxFor(t2) { if (!t2 || t2.closest('#dm-panel,#dm-fab,#dm-toast')) return null; for (var i = 0; i < boxes.length; i++) if (boxes[i].box.contains(t2)) return boxes[i]; var e = t2.closest && t2.closest(SCOPE_SEL); while (e) { for (var j = 0; j < boxes.length; j++) if (boxes[j].el === e) return boxes[j]; e = e.parentElement && e.parentElement.closest(SCOPE_SEL); } return null; }
  function onMove(ev) { var b = boxFor(ev.target); if (hoverBox === b) return; if (hoverBox) hoverBox.box.classList.remove('hv'); hoverBox = b; if (b) b.box.classList.add('hv'); }
  function onClick(ev) { var b = boxFor(ev.target); if (b) { ev.preventDefault(); ev.stopPropagation(); setScope(b.sel); toastMsg(t('scopeTo') + ': ' + b.box.firstChild.textContent); } }
  function setOutline(on) {
    outOn = on; frameB.classList.toggle('on', on); drawOutlines();
    if (on) { addEventListener('scroll', posOutlines, true); addEventListener('resize', posOutlines); doc.addEventListener('mousemove', onMove, true); doc.addEventListener('click', onClick, true); docBody.style.cursor = 'crosshair'; }
    else { removeEventListener('scroll', posOutlines, true); removeEventListener('resize', posOutlines); doc.removeEventListener('mousemove', onMove, true); doc.removeEventListener('click', onClick, true); docBody.style.cursor = ''; if (hoverBox) hoverBox.box.classList.remove('hv'); hoverBox = null; }
  }
  frameB.addEventListener('click', function () { setOutline(!outOn); });
  pickB.addEventListener('click', function () { setOutline(true); toastMsg(t('pick')); });

  /* ---------------- backups / presets storage ---------------- */
  function loadBK() { try { return JSON.parse(localStorage.getItem(BK)) || {}; } catch (e) { return {}; } }
  function saveBK(o) { try { localStorage.setItem(BK, JSON.stringify(o)); } catch (e) {} }
  function loadUP() { try { return JSON.parse(localStorage.getItem(UP)) || {}; } catch (e) { return {}; } }
  function userP(k) { var o = loadUP(), p = o[file()]; return (p && p[k]) || []; }
  function addUserP(k, e) { var o = loadUP(), p = o[file()] || (o[file()] = {}); (p[k] || (p[k] = [])).push(e); try { localStorage.setItem(UP, JSON.stringify(o)); } catch (x) {} }
  function delUserP(k, n) { var o = loadUP(), p = o[file()]; if (!p || !p[k]) return; p[k] = p[k].filter(function (e) { return e.name !== n; }); try { localStorage.setItem(UP, JSON.stringify(o)); } catch (x) {} }
  var bkl = panel.querySelector('#dm-bkl');
  function refreshBK() { var b = loadBK(); bkl.innerHTML = ''; var n = Object.keys(b); if (!n.length) { var o = mk('option'); o.value = ''; o.textContent = '—'; bkl.appendChild(o); return; } n.sort().forEach(function (x) { var o = mk('option'); o.value = x; o.textContent = x + ' · ' + (b[x].page || ''); bkl.appendChild(o); }); }
  panel.querySelector('#dm-bks').addEventListener('click', function () { var i = panel.querySelector('#dm-bkn'), n = i.value.trim(); if (!n) { i.focus(); toastMsg(t('needName')); return; } var b = loadBK(); b[n] = { page: file(), state: readState() }; saveBK(b); refreshBK(); i.value = ''; toastMsg(t('okSaved')); });
  panel.querySelector('#dm-bkld').addEventListener('click', function () { var n = bkl.value; if (!n) return; var b = loadBK(); if (b[n]) { applyState(b[n].state); commit(); toastMsg(t('okLoaded')); } });
  panel.querySelector('#dm-bkd').addEventListener('click', function () { var n = bkl.value; if (!n) return; var b = loadBK(); delete b[n]; saveBK(b); refreshBK(); toastMsg(t('okDeleted')); });
  panel.querySelector('#dm-exp').addEventListener('click', function () { var d = { app: 'design-editor', page: file(), state: readState() }; var bl = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }); var a = mk('a'); a.href = URL.createObjectURL(bl); a.download = 'look-' + file().replace(/\.html?$/, '') + '.json'; docBody.appendChild(a); a.click(); docBody.removeChild(a); toastMsg(t('okSaved')); });
  panel.querySelector('#dm-imp').addEventListener('click', function () { fileIn.click(); });
  fileIn.addEventListener('change', function () { var f = fileIn.files && fileIn.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { try { var d = JSON.parse(r.result), s = d.state || d; applyState(s); commit(); toastMsg(t('okLoaded')); } catch (e) { toastMsg('✗'); } fileIn.value = ''; }; r.readAsText(f); });

  /* ---------------- footer / tabs / lang ---------------- */
  var uB = panel.querySelector('#dm-undo'), rB = panel.querySelector('#dm-redo');
  uB.addEventListener('click', undo); rB.addEventListener('click', redo);
  function updateBar() { uB.disabled = ptr <= 0; rB.disabled = ptr >= hist.length - 1; uB.style.opacity = uB.disabled ? .4 : 1; rB.style.opacity = rB.disabled ? .4 : 1; if (outOn) styleOutlines(); }
  panel.querySelector('#dm-reset').addEventListener('click', function () { VARS.forEach(function (v) { root.style.removeProperty(v.name); }); scopeOv = {}; renderScoped(); scope = ':root'; fillSel(); sel.classList.remove('on'); ex = { base: null, lh: null, ls: null, zoom: null }; writeInject(); saveMain(); syncUI(); commit(); toastMsg(t('okReset')); });
  panel.querySelector('#dm-done').addEventListener('click', close);
  panel.querySelector('#dm-close2').addEventListener('click', close);
  panel.querySelectorAll('#dm-tabs button').forEach(function (b) { b.addEventListener('click', function () { panel.querySelectorAll('#dm-tabs button').forEach(function (x) { x.classList.toggle('on', x === b); }); for (var p in panes) panes[p].classList.toggle('on', p === b.dataset.t); }); });
  panel.querySelectorAll('.dm-lang button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.l); }); });
  function setLang(l) {
    lang = l; try { localStorage.setItem(LANG, l); } catch (e) {}
    panel.querySelectorAll('.dm-lang button').forEach(function (b) { b.classList.toggle('on', b.dataset.l === l); });
    applyI18n(); if (window.__DM_BLOCKS__ && window.__DM_BLOCKS__.setLang) window.__DM_BLOCKS__.setLang(l);
    fillSel(); renderPal(); renderTyp(); fontRepop.forEach(function (f) { f(); });
  }
  function applyI18n() {
    panel.querySelectorAll('[data-i]').forEach(function (n) { n.textContent = t(n.getAttribute('data-i')); });
    i18nNodes.forEach(function (n) { if (n && n.getAttribute) { var k = n.getAttribute('data-i'); if (k) n.textContent = t(k); } });
    fab.innerHTML = I.text + '<span>' + t('open') + '</span>';
    pickB.title = t('pick'); frameB.title = t('outline');
    var bn = panel.querySelector('#dm-bkn'); if (bn) bn.placeholder = t('nameHint');
  }

  /* ---------------- open/close ---------------- */
  function open() { panel.classList.add('open'); fab.style.display = 'none'; fillSel(); updateBar(); }
  function close() { panel.classList.remove('open'); fab.style.display = ''; if (outOn) setOutline(false); }
  fab.addEventListener('click', open);
  doc.addEventListener('keydown', function (e) {
    var tg = e.target, typing = tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable);
    if (!typing && e.shiftKey && (e.key === 'E' || e.key === 'e')) { e.preventDefault(); panel.classList.contains('open') ? close() : open(); }
    if (e.key === 'Escape' && panel.classList.contains('open')) close();
    if (panel.classList.contains('open') && (e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) { e.preventDefault(); e.shiftKey ? redo() : undo(); }
  });
  window.__DM__ = { blockHost: function () { return panel.querySelector('#dm-blockhost'); }, lang: function () { return lang; }, toast: toastMsg, openTab: function (id) { var b = panel.querySelector('#dm-tabs button[data-t="' + id + '"]'); if (b) b.click(); } };

  setLang(lang); refreshBK(); fillSel(); updateBar();
  if (/[?&]edit\b/.test(location.search)) open();
  console.log('%c[editor] ready', 'color:#63e6a8', '· Shift+E ·', VARS.length, 'vars');

  /* ---------------- utils ---------------- */
  function mk(tag, a) { var n = doc.createElement(tag); if (a) for (var k in a) n.setAttribute(k, a[k]); return n; }
  function h4(key) { var n = mk('h4'); n.setAttribute('data-i', key); i18nNodes.push(n); n.textContent = t(key); return n; }
  function note(key) { var n = mk('div', { class: 'dm-tip' }); n.setAttribute('data-i', key); i18nNodes.push(n); n.textContent = t(key); return n; }
  function chip(label, accent, fn, del) {
    var c = mk('button', { class: 'dm-chip' }); if (accent) { var i = mk('i'); i.style.background = accent; c.appendChild(i); }
    var s = mk('span'); s.textContent = label; c.appendChild(s); c.addEventListener('click', fn);
    if (del) { var x = mk('span', { class: 'kill' }); x.textContent = '×'; x.addEventListener('click', function (e) { e.stopPropagation(); del(); }); c.appendChild(x); }
    return c;
  }
  function pretty(n) { return n.replace(/^--/, '').replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }
  function varExists(n) { for (var i = 0; i < VARS.length; i++) if (VARS[i].name === n) return true; return false; }
  function file() { return location.pathname.split('/').pop() || 'index.html'; }
  function px(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function rnd(n, d) { var p = Math.pow(10, d || 0); return Math.round(n * p) / p; }
  function uniq(a) { var s = {}, o = []; a.forEach(function (x) { if (!s[x]) { s[x] = 1; o.push(x); } }); return o; }
  function ask(m) { var n = (typeof prompt === 'function') ? prompt(m) : ''; return n ? n.trim() : ''; }
  function copy(s) { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).catch(fb); else fb(); function fb() { var a = mk('textarea'); a.value = s; a.style.cssText = 'position:fixed;opacity:0'; docBody.appendChild(a); a.select(); try { doc.execCommand('copy'); } catch (e) {} docBody.removeChild(a); } }
  var tt; function toastMsg(m) { toast.textContent = m; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('show'); }, 1700); }
})();
