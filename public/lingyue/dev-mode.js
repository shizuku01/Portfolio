/* ============================================================
   领阅 · DEV MODE — live theme editor
   Drop-in: <script src="dev-mode.js"></script> before </body>
   Tabs: Colors · Type · Space
   • Auto-discovers CSS custom properties from the page's :root
   • Presets (per direction) · Undo/Redo · Save/Load backups
   • Global type scale via --fs · optional system-font loading
   Remove the single <script> include to ship production.
   ============================================================ */
(function () {
  if (window.__DEVMODE__) return;
  window.__DEVMODE__ = true;

  var doc = document, root = doc.documentElement, docBody = doc.body;
  var STORE = 'devmode:' + location.pathname;
  var BK = 'devmode:backups';

  /* ---------- read authored :root custom properties ---------- */
  function readRootVars() {
    var out = [], seen = {};
    for (var i = 0; i < doc.styleSheets.length; i++) {
      var rules; try { rules = doc.styleSheets[i].cssRules; } catch (e) { continue; }
      if (!rules) continue;
      for (var j = 0; j < rules.length; j++) {
        var r = rules[j];
        if (r.type === 1 && r.selectorText && /(^|,)\s*:root\s*(,|$)/.test(r.selectorText)) {
          var st = r.style;
          for (var k = 0; k < st.length; k++) {
            var p = st[k];
            if (p.indexOf('--') === 0 && !seen[p]) { seen[p] = 1; out.push({ name: p, orig: st.getPropertyValue(p).trim() }); }
          }
        }
      }
    }
    return out;
  }
  var VARS = readRootVars();

  /* ---------- classification ---------- */
  var HEX6 = /^#[0-9a-f]{6}$/i, HEX3 = /^#[0-9a-f]{3}$/i;
  function isColor(v) { return /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v) || /^(?:rgb|hsl)a?\(/i.test(v); }
  function isLen(v) { return /^-?\d*\.?\d+(?:px|rem|em|%|vw|vh)$/i.test(v); }
  function isFontName(n) { return /(?:^|-)(?:font|serif|sans|mono|disp|display|body|narrow|num|type)(?:-|$)/i.test(n.replace(/^--/, '')); }
  function isFontVal(v) { return /,/.test(v) && /[A-Za-z]/.test(v) && !/gradient|rgb|hsl|#|px|em|%|vw/.test(v); }
  function pickable(v) { return HEX6.test(v) || HEX3.test(v); }
  function expand6(v) { return HEX3.test(v) ? '#' + v.slice(1).split('').map(function (c) { return c + c; }).join('') : (HEX6.test(v) ? v.toLowerCase() : '#888888'); }
  function classify(v) {
    if (isColor(v.orig)) return 'color';
    if (isFontName(v.name) || isFontVal(v.orig)) return 'font';
    if (isLen(v.orig) || /maxw|col|width|radius|gap|space|size|height/.test(v.name)) return 'size';
    return 'other';
  }
  var COLORS = [], FONTS = [], SIZES = [];
  VARS.forEach(function (v) { var c = classify(v); (c === 'color' ? COLORS : c === 'font' ? FONTS : SIZES).push(v); });
  var hasFS = VARS.some(function (v) { return v.name === '--fs'; });
  SIZES = SIZES.filter(function (v) { return v.name !== '--fs'; });
  var SYS_FONTS = [], fontRepop = [], loadedFams = {};

  /* ---------- preset palettes (per direction) ---------- */
  var PRESETS = {
    '1-the-desk.html': [
      { name: '绿相 Green', accent: '#3DDC84', vars: { '--amber': '#3DDC84', '--amber-soft': 'rgba(61,220,132,.12)' } },
      { name: '冰蓝 Ice', accent: '#4CC5FF', vars: { '--amber': '#4CC5FF', '--amber-soft': 'rgba(76,197,255,.12)' } },
      { name: '朱红 Vermilion', accent: '#FF6A3D', vars: { '--amber': '#FF6A3D', '--amber-soft': 'rgba(255,106,61,.12)' } },
      { name: '石墨 Slate', accent: '#9FB2C9', vars: { '--amber': '#9FB2C9', '--amber-soft': 'rgba(159,178,201,.12)' } }
    ],
    '2-the-blueprint.html': [
      { name: '群青 Ultramarine', accent: '#2438E0', vars: { '--blue': '#2438E0', '--blue-deep': '#1526B0', '--annot': '#E0662C' } },
      { name: '青蓝 Teal', accent: '#0E8C9E', vars: { '--blue': '#0E8C9E', '--blue-deep': '#0A6B78', '--annot': '#C24A2C' } },
      { name: '石墨 Graphite', accent: '#465A70', vars: { '--blue': '#465A70', '--blue-deep': '#33465A', '--annot': '#7A6A55' } },
      { name: '铁锈 Oxide', accent: '#B4532E', vars: { '--blue': '#8A5A3C', '--blue-deep': '#6E4530', '--annot': '#B4532E' } }
    ],
    '3-the-memo.html': [
      { name: '墨青 Teal', accent: '#146A6A', vars: { '--claret': '#146A6A', '--claret-2': '#1C8A8A', '--claret-soft': 'rgba(20,106,106,.08)', '--gold': '#3E7C7C' } },
      { name: '松绿 Forest', accent: '#2E6B3E', vars: { '--claret': '#2E6B3E', '--claret-2': '#3C8A50', '--claret-soft': 'rgba(46,107,62,.08)', '--gold': '#5C7A3E' } },
      { name: '藏青 Navy', accent: '#243A6B', vars: { '--claret': '#243A6B', '--claret-2': '#30508A', '--claret-soft': 'rgba(36,58,107,.08)', '--gold': '#3E5C7C' } }
    ],
    '4-the-ledger.html': [
      { name: '克莱因蓝 Klein', accent: '#1E34E0', vars: { '--red': '#1E34E0', '--red-deep': '#1526B0' } },
      { name: '交易绿 Green', accent: '#1E8A4A', vars: { '--red': '#1E8A4A', '--red-deep': '#146638' } },
      { name: '纯墨 Mono', accent: '#111110', vars: { '--red': '#111110', '--red-deep': '#111110' } },
      { name: '琥珀 Amber', accent: '#E08A1E', vars: { '--red': '#E08A1E', '--red-deep': '#B76E14' } }
    ]
  };
  var ACCENT_VAR = { '1-the-desk.html': '--amber', '2-the-blueprint.html': '--blue', '3-the-memo.html': '--claret', '4-the-ledger.html': '--red' };
  var TYPE_PRESETS = {
    '1-the-desk.html': [
      { name: 'IBM Plex', map: { '--mono': 'IBM Plex Mono', '--sans': 'IBM Plex Sans' } },
      { name: 'JetBrains', map: { '--mono': 'JetBrains Mono', '--sans': 'Inter' } },
      { name: 'Space', map: { '--mono': 'Space Mono', '--sans': 'Space Grotesk' } },
      { name: 'Fira × Archivo', map: { '--mono': 'Fira Code', '--sans': 'Archivo' } }
    ],
    '2-the-blueprint.html': [
      { name: 'Grotesk', map: { '--disp': 'Space Grotesk', '--body': 'Inter', '--mono': 'IBM Plex Mono' } },
      { name: 'Archivo', map: { '--disp': 'Archivo', '--body': 'Archivo', '--mono': 'Spline Sans Mono' } },
      { name: 'Humanist', map: { '--disp': 'Sora', '--body': 'Public Sans', '--mono': 'IBM Plex Mono' } },
      { name: 'JetBrains', map: { '--disp': 'Space Grotesk', '--body': 'IBM Plex Sans', '--mono': 'JetBrains Mono' } }
    ],
    '3-the-memo.html': [
      { name: 'Fraunces', map: { '--disp': 'Fraunces', '--body': 'Newsreader', '--mono': 'IBM Plex Mono' } },
      { name: 'Playfair', map: { '--disp': 'Playfair Display', '--body': 'Source Serif 4', '--mono': 'IBM Plex Mono' } },
      { name: 'Lora', map: { '--disp': 'Lora', '--body': 'Lora', '--mono': 'IBM Plex Mono' } },
      { name: 'Serif × Sans', map: { '--disp': 'Fraunces', '--body': 'Inter', '--mono': 'IBM Plex Mono' } }
    ],
    '4-the-ledger.html': [
      { name: 'Archivo', map: { '--sans': 'Archivo', '--narrow': 'Archivo Narrow', '--mono': 'IBM Plex Mono', '--num': 'Archivo' } },
      { name: 'Space', map: { '--sans': 'Space Grotesk', '--narrow': 'Archivo Narrow', '--mono': 'Space Mono', '--num': 'Space Grotesk' } },
      { name: 'Inter × Oswald', map: { '--sans': 'Inter', '--narrow': 'Oswald', '--mono': 'IBM Plex Mono', '--num': 'Inter' } },
      { name: 'JetBrains', map: { '--sans': 'Archivo', '--narrow': 'Archivo Narrow', '--mono': 'JetBrains Mono', '--num': 'Archivo' } }
    ]
  };

  /* ---------- state model ---------- */
  var ex = { base: null, lh: null, ls: null, zoom: null };   // injected (non-variable) settings
  var scope = ':root';        // active edit scope selector
  var scopeOv = {};           // { selector: { --var: value } }
  var injScoped = doc.createElement('style'); injScoped.id = 'dm-scoped'; doc.head.appendChild(injScoped);
  function renderScoped() { var out = ''; for (var s in scopeOv) { var o = scopeOv[s], k = Object.keys(o); if (k.length) out += s + '{' + k.map(function (x) { return x + ':' + o[x]; }).join(';') + '}\n'; } injScoped.textContent = out; }
  function qEl(sel) { try { return sel === ':root' ? root : doc.querySelector(sel); } catch (e) { return null; } }
  function putVar(name, val) { if (scope === ':root') root.style.setProperty(name, val); else (scopeOv[scope] || (scopeOv[scope] = {}))[name] = val; }
  function dropVar(name) { if (scope === ':root') root.style.removeProperty(name); else { var o = scopeOv[scope]; if (o) { delete o[name]; if (!Object.keys(o).length) delete scopeOv[scope]; } } }
  function isChanged(name) { if (scope === ':root') return root.style.getPropertyValue(name).trim() !== origOf(name); var o = scopeOv[scope]; return !!(o && o[name] != null); }
  function scopeTag() { return scope === ':root' ? '' : ' @ ' + scope; }
  function origOf(n) { for (var i = 0; i < VARS.length; i++) if (VARS[i].name === n) return VARS[i].orig; return ''; }
  function curVal(n) {
    if (scope === ':root') { var v = root.style.getPropertyValue(n).trim(); return v || origOf(n); }
    var o = scopeOv[scope]; if (o && o[n] != null) return o[n];
    var e = qEl(scope); if (e) { var cv = getComputedStyle(e).getPropertyValue(n).trim(); if (cv) return cv; }
    return origOf(n);
  }
  function curVars() { var o = {}; VARS.forEach(function (v) { var c = root.style.getPropertyValue(v.name).trim(); if (c && c !== v.orig) o[v.name] = c; }); return o; }
  function readState() { return { ov: curVars(), ex: { base: ex.base, lh: ex.lh, ls: ex.ls, zoom: ex.zoom }, scopes: JSON.parse(JSON.stringify(scopeOv)) }; }
  function sameState(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

  var injEl = doc.createElement('style'); injEl.id = 'dm-inject'; doc.head.appendChild(injEl);
  function injCSS(e) {
    var b = [], h = [];
    if (e.base != null) b.push('font-size:' + e.base + 'px');
    if (e.lh != null) b.push('line-height:' + e.lh);
    if (e.ls != null) b.push('letter-spacing:' + e.ls + 'em');
    if (e.zoom != null) h.push('zoom:' + e.zoom);
    return (b.length ? 'body{' + b.join(';') + '}\n' : '') + (h.length ? 'html{' + h.join(';') + '}' : '');
  }
  function writeInject() { injEl.textContent = injCSS(ex); }

  function applyState(s) {
    VARS.forEach(function (v) { root.style.removeProperty(v.name); });
    for (var n in s.ov) if (s.ov.hasOwnProperty(n)) root.style.setProperty(n, s.ov[n]);
    ex = { base: null, lh: null, ls: null, zoom: null };
    if (s.ex) for (var k in ex) if (s.ex[k] != null) ex[k] = s.ex[k];
    scopeOv = s.scopes ? JSON.parse(JSON.stringify(s.scopes)) : {}; renderScoped();
    writeInject(); saveMain(); syncUI(); updateUndoUI(); if (typeof updateScopeUI === 'function') updateScopeUI();
  }

  /* ---------- persistence ---------- */
  function loadMain() { try { return JSON.parse(localStorage.getItem(STORE)); } catch (e) { return null; } }
  function saveMain() { try { localStorage.setItem(STORE, JSON.stringify(readState())); } catch (e) {} }
  function loadBackups() { try { return JSON.parse(localStorage.getItem(BK)) || {}; } catch (e) { return {}; } }
  function saveBackups(o) { try { localStorage.setItem(BK, JSON.stringify(o)); } catch (e) {} }

  /* ---------- history ---------- */
  var hist = [], ptr = -1, cT;
  function commit() {
    var s = readState();
    if (ptr >= 0 && sameState(hist[ptr], s)) return;
    hist = hist.slice(0, ptr + 1); hist.push(s); ptr = hist.length - 1;
    if (hist.length > 120) { hist.shift(); ptr--; }
    updateUndoUI(); if (typeof refreshOutline === 'function') refreshOutline();
  }
  function schedule() { clearTimeout(cT); cT = setTimeout(commit, 350); }
  function undo() { if (ptr <= 0) return; clearTimeout(cT); ptr--; applyState(hist[ptr]); toast('撤销'); }
  function redo() { if (ptr >= hist.length - 1) return; clearTimeout(cT); ptr++; applyState(hist[ptr]); toast('重做'); }

  /* ---------- live edit ---------- */
  function edit(name, val) { putVar(name, val); if (scope !== ':root') renderScoped(); if (controls[name]) controls[name].mark(); saveMain(); schedule(); }
  function editEx(key, val) { ex[key] = val; writeInject(); saveMain(); schedule(); }

  /* ---------- init from saved ---------- */
  (function () {
    var s = loadMain();
    if (s) { if (s.ov) for (var n in s.ov) root.style.setProperty(n, s.ov[n]); if (s.ex) for (var k in ex) if (s.ex[k] != null) ex[k] = s.ex[k]; if (s.scopes) { scopeOv = s.scopes; renderScoped(); } writeInject(); }
    hist = [readState()]; ptr = 0;
  })();

  /* ---------- styles ---------- */
  var css = `
  #dm-fab{position:fixed;left:16px;bottom:16px;z-index:2147483000;display:inline-flex;align-items:center;gap:8px;font:600 12px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.12em;color:#e7ecf3;background:#12151c;border:1px solid #2b3444;border-radius:999px;padding:9px 14px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.35);transition:transform .15s,background .15s}
  #dm-fab:hover{transform:translateY(-1px);background:#191d26}
  #dm-fab .dot{width:8px;height:8px;border-radius:50%;background:#63e6a8;box-shadow:0 0 0 3px rgba(99,230,168,.18)}
  #dm-panel{position:fixed;top:0;right:0;height:100%;width:352px;max-width:90vw;z-index:2147483001;background:#0f1218;color:#d7dde7;border-left:1px solid #262f3d;box-shadow:-18px 0 50px rgba(0,0,0,.4);font:13px/1.5 ui-sans-serif,system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .22s cubic-bezier(.2,.7,.3,1)}
  #dm-panel.open{transform:none}
  #dm-panel *{box-sizing:border-box}
  #dm-head{display:flex;align-items:center;justify-content:space-between;padding:15px 16px 12px;border-bottom:1px solid #222a37}
  #dm-head h3{margin:0;font:700 13px/1.2 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.14em;color:#fff}
  #dm-head .sub{font:400 10.5px/1.4 ui-monospace,monospace;color:#6b7688;margin-top:5px;letter-spacing:.04em;max-width:210px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #dm-x{background:none;border:1px solid #2b3444;color:#aeb7c6;width:28px;height:28px;border-radius:7px;cursor:pointer;font-size:15px}
  #dm-x:hover{background:#1a1f29;color:#fff}
  #dm-bar{display:flex;gap:6px;padding:10px 16px;border-bottom:1px solid #222a37}
  #dm-bar button{flex:1;border:1px solid #2b3444;background:#161b23;color:#cdd5e0;border-radius:7px;padding:8px 4px;cursor:pointer;font:600 11px ui-monospace,monospace;letter-spacing:.02em;transition:.12s;display:flex;align-items:center;justify-content:center;gap:5px}
  #dm-bar button:hover:not(:disabled){background:#1c222c;border-color:#3a4657;color:#fff}
  #dm-bar button:disabled{opacity:.38;cursor:default}
  #dm-tabs{display:flex;padding:10px 16px 0;gap:6px}
  #dm-tabs button{flex:1;background:none;border:none;border-bottom:2px solid transparent;color:#7b8698;padding:8px 4px;cursor:pointer;font:600 11.5px ui-monospace,monospace;letter-spacing:.08em}
  #dm-tabs button.on{color:#fff;border-color:#2b60d8}
  #dm-search{margin:10px 16px 2px;display:block;width:calc(100% - 32px);background:#161b23;border:1px solid #263041;color:#dbe2ec;border-radius:8px;padding:8px 11px;font:12px ui-monospace,monospace;outline:none}
  #dm-search:focus{border-color:#3a597f}
  #dm-body{flex:1;overflow-y:auto;padding:6px 16px 14px}
  .dm-pane{display:none}.dm-pane.on{display:block}
  .dm-grp{font:600 10px/1 ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:#6b7688;display:flex;align-items:center;gap:8px;margin:16px 0 8px}
  .dm-grp::after{content:"";flex:1;height:1px;background:#222a37}
  .dm-presets{display:flex;flex-wrap:wrap;gap:7px;margin:2px 0 4px}
  .dm-chip{display:inline-flex;align-items:center;gap:7px;border:1px solid #2b3444;background:#161b23;color:#cdd5e0;border-radius:999px;padding:6px 11px 6px 9px;cursor:pointer;font:600 11px ui-monospace,monospace;transition:.12s}
  .dm-chip:hover{background:#1c222c;border-color:#3a4657;color:#fff}
  .dm-chip i{width:11px;height:11px;border-radius:50%;flex:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}
  .dm-load{width:100%;border:1px dashed #3a4657;background:#12161d;color:#aeb7c6;border-radius:8px;padding:9px;cursor:pointer;font:600 11px ui-monospace,monospace;margin:0 0 6px;transition:.12s}
  .dm-load:hover:not(:disabled){background:#1a1f28;color:#fff;border-color:#4a5a70}
  .dm-load:disabled{opacity:.6;cursor:default}
  .dm-row{display:flex;align-items:center;gap:10px;padding:6px 0}
  .dm-row .nm{flex:1;min-width:0;font:11.5px ui-monospace,Menlo,monospace;color:#aeb7c6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dm-row.changed .nm{color:#63e6a8}
  .dm-sw{width:30px;height:30px;border-radius:7px;border:1px solid #33405280;flex:none;position:relative;overflow:hidden;cursor:pointer;background-image:linear-gradient(45deg,#2a2f38 25%,transparent 25%,transparent 75%,#2a2f38 75%),linear-gradient(45deg,#2a2f38 25%,#1a1f27 25%,#1a1f27 75%,#2a2f38 75%);background-size:10px 10px;background-position:0 0,5px 5px}
  .dm-sw i{position:absolute;inset:0}
  .dm-sw input[type=color]{position:absolute;inset:-6px;width:150%;height:150%;border:none;padding:0;background:none;cursor:pointer;opacity:0}
  .dm-hex{width:100px;flex:none;background:#161b23;border:1px solid #263041;color:#dbe2ec;border-radius:6px;padding:6px 8px;font:11.5px ui-monospace,monospace;outline:none}
  .dm-txt{flex:1;background:#161b23;border:1px solid #263041;color:#dbe2ec;border-radius:6px;padding:6px 8px;font:11px ui-monospace,monospace;outline:none;min-width:0}
  .dm-txt:focus,.dm-hex:focus{border-color:#3a597f}
  .dm-sel{flex:1;background:#161b23;border:1px solid #263041;color:#dbe2ec;border-radius:6px;padding:6px 8px;font:11.5px ui-monospace,monospace;outline:none;min-width:0}
  .dm-frow{display:block;padding:8px 0;border-bottom:1px solid #1a2029}
  .dm-frow .nm{margin-bottom:6px}
  .dm-frow .cw{display:flex;gap:8px}
  .dm-frow .prev{font-size:15px;color:#e7ecf3;margin-top:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .dm-slider{display:block;padding:9px 0}
  .dm-slider .top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px}
  .dm-slider .top .nm{font:11.5px ui-monospace,monospace;color:#aeb7c6}
  .dm-slider .top .val{font:600 12px ui-monospace,monospace;color:#e7ecf3}
  .dm-slider .top .val.set{color:#63e6a8}
  .dm-slider input[type=range]{width:100%;accent-color:#2b60d8;cursor:pointer}
  .dm-slider .rr{background:none;border:none;color:#6b7688;font:10px ui-monospace,monospace;cursor:pointer;padding:0;margin-left:8px}
  .dm-slider .rr:hover{color:#fff}
  .dm-note{font:11px ui-monospace,monospace;color:#5a6472;white-space:normal;line-height:1.5;padding:8px 0 2px}
  #dm-bk{border-top:1px solid #222a37;padding:12px 16px;background:#0c0f14}
  #dm-bk .r{display:flex;gap:7px;margin-bottom:8px}
  #dm-bk .r:last-child{margin-bottom:0}
  #dm-bk input,#dm-bk select{flex:1;background:#161b23;border:1px solid #263041;color:#dbe2ec;border-radius:7px;padding:8px 9px;font:11px ui-monospace,monospace;outline:none;min-width:0}
  #dm-bk button{border:1px solid #2b3444;background:#161b23;color:#cdd5e0;border-radius:7px;padding:8px 11px;cursor:pointer;font:600 11px ui-monospace,monospace;white-space:nowrap;transition:.12s}
  #dm-bk button:hover{background:#1c222c;color:#fff}
  #dm-bk .lbl{font:600 10px ui-monospace,monospace;letter-spacing:.14em;color:#6b7688;text-transform:uppercase;margin-bottom:9px;display:flex;align-items:center;gap:8px}
  #dm-bk .lbl::after{content:"";flex:1;height:1px;background:#222a37}
  #dm-foot{border-top:1px solid #222a37;padding:11px 16px;display:flex;gap:8px}
  #dm-foot button{flex:1;border:1px solid #2b3444;background:#161b23;color:#d7dde7;border-radius:8px;padding:10px;cursor:pointer;font:600 11.5px ui-monospace,monospace;letter-spacing:.06em;transition:.15s}
  #dm-foot button:hover{background:#1c222c;border-color:#3a4657}
  #dm-foot .primary{background:#2b60d8;border-color:#2b60d8;color:#fff}
  #dm-foot .primary:hover{background:#2453be}
  #dm-toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);z-index:2147483002;background:#12151c;color:#e7ecf3;border:1px solid #2b3444;border-radius:8px;padding:10px 16px;font:12px ui-monospace,monospace;opacity:0;pointer-events:none;transition:.2s}
  #dm-toast.show{opacity:1;transform:translate(-50%,0)}
  #dm-scope{display:flex;gap:6px;padding:9px 16px;border-bottom:1px solid #222a37;background:#0c0f14;align-items:center}
  #dm-scope select{flex:1;background:#161b23;border:1px solid #263041;color:#dbe2ec;border-radius:7px;padding:7px 8px;font:11px ui-monospace,monospace;outline:none;min-width:0}
  #dm-scope select.scoped{border-color:#c8842c;color:#f0b366;background:#1c150a}
  #dm-scope button{border:1px solid #2b3444;background:#161b23;color:#cdd5e0;border-radius:7px;padding:7px 9px;cursor:pointer;font:600 11px ui-monospace,monospace;transition:.12s}
  #dm-scope button:hover{background:#1c222c;color:#fff}
  #dm-scope #dm-pick.on{background:#f5a623;border-color:#f5a623;color:#0a0a0a}
  #dm-hi{position:fixed;z-index:2147482999;pointer-events:none;border:2px solid #f5a623;background:rgba(245,166,35,.1);border-radius:3px;display:none}
  #dm-hi .lab{position:absolute;top:-19px;left:-2px;background:#f5a623;color:#0a0a0a;font:600 10px/1 ui-monospace,monospace;padding:3px 6px;border-radius:3px;white-space:nowrap}
  #dm-outline{position:fixed;inset:0;z-index:2147482998;pointer-events:none}
  .dm-obox{position:fixed;border:1px dashed rgba(120,150,230,.5);border-radius:3px;pointer-events:none}
  .dm-obox.has{border-color:rgba(245,166,35,.75);background:rgba(245,166,35,.06)}
  .dm-obox.active{border:2px solid #4c8dff;background:rgba(76,141,255,.09)}
  .dm-olab{position:absolute;top:0;left:0;transform:translateY(-100%);background:rgba(15,18,24,.94);color:#c9d3e0;font:600 10px/1.4 ui-monospace,monospace;padding:3px 7px;border-radius:4px 4px 4px 0;white-space:nowrap;pointer-events:auto;cursor:pointer;max-width:60vw;overflow:hidden;text-overflow:ellipsis}
  .dm-olab:hover{background:#2b60d8;color:#fff}
  .dm-obox.has .dm-olab{background:#c8842c;color:#0a0a0a}
  .dm-obox.active .dm-olab{background:#4c8dff;color:#fff}
  .dm-obox.hover{border:2px solid #63e6a8;background:rgba(99,230,168,.16);z-index:2}
  .dm-obox.hover .dm-olab{background:#63e6a8;color:#0a0a0a}
  #dm-scope #dm-obtn.on{background:#4c8dff;border-color:#4c8dff;color:#fff}
  @media(max-width:560px){#dm-panel{width:100%;max-width:100%}}
  @media(prefers-reduced-motion:reduce){#dm-panel,#dm-fab,#dm-toast{transition:none}}
  `;
  var styleEl = doc.createElement('style'); styleEl.id = 'dm-style'; styleEl.textContent = css; doc.head.appendChild(styleEl);

  /* ---------- shell ---------- */
  var fab = el('button', { id: 'dm-fab', title: 'Dev mode (Shift+D)' }); fab.innerHTML = '<span class="dot"></span>DEV';
  var panel = el('aside', { id: 'dm-panel', role: 'dialog', 'aria-label': 'Dev mode' });
  panel.innerHTML =
    '<div id="dm-head"><div><h3>DEV · 主题编辑</h3><div class="sub">' + fileName() + '</div></div><button id="dm-x" aria-label="关闭">&times;</button></div>' +
    '<div id="dm-bar"><button id="dm-undo" title="撤销 (Ctrl+Z)">↶ 撤销</button><button id="dm-redo" title="重做 (Ctrl+Shift+Z)">↷ 重做</button><button id="dm-copy" title="复制为 CSS">⧉ CSS</button></div>' +
    '<div id="dm-scope"><select id="dm-scopesel" title="编辑作用域"></select><button id="dm-obtn" title="显示所有区块范围">▦</button><button id="dm-pick" title="在页面点选区块">🎯</button><button id="dm-scopeclr" title="清除本区块改动">清除</button></div>' +
    '<div id="dm-tabs"><button data-t="color" class="on">颜色</button><button data-t="type">字体</button><button data-t="space">间距</button></div>' +
    '<input id="dm-search" placeholder="筛选颜色变量…" />' +
    '<div id="dm-body"><div class="dm-pane on" data-p="color"></div><div class="dm-pane" data-p="type"></div><div class="dm-pane" data-p="space"></div></div>' +
    '<div id="dm-bk"><div class="lbl">备份 · Backups</div>' +
      '<div class="r"><input id="dm-bkname" placeholder="备份名称…" /><button id="dm-bksave">保存</button></div>' +
      '<div class="r"><select id="dm-bklist"></select><button id="dm-bkload">载入</button><button id="dm-bkdel">删除</button></div>' +
      '<div class="r"><button id="dm-export" style="flex:1">⬇ 导出 .json</button><button id="dm-import" style="flex:1">⬆ 导入 .json</button></div></div>' +
    '<div id="dm-foot"><button id="dm-reset">重置全部</button><button id="dm-close" class="primary">完成</button></div>';
  var toastEl = el('div', { id: 'dm-toast' });
  var fileInput = el('input', { type: 'file', accept: '.json,application/json' }); fileInput.style.display = 'none';
  docBody.appendChild(fab); docBody.appendChild(panel); docBody.appendChild(toastEl); docBody.appendChild(fileInput);

  var panes = {};
  panel.querySelectorAll('.dm-pane').forEach(function (p) { panes[p.dataset.p] = p; });

  /* ---------- controls registry ---------- */
  var controls = {}; // varName -> {set(v), mark()}
  var exCtl = {};    // key -> {set()}

  /* ===== presets (color + type · built-in + user) ===== */
  var colorPresetBox, typePresetBox;
  var UP = 'devmode:userpresets';   // { page: { color:[...], type:[...] } }

  function presetChip(label, accent, onApply, onDelete) {
    var c = el('button', { class: 'dm-chip' });
    if (accent) { var i = el('i'); i.style.background = accent; c.appendChild(i); }
    var s = el('span'); s.textContent = label; c.appendChild(s);
    c.addEventListener('click', onApply);
    if (onDelete) { var x = el('span', { title: '删除预设' }); x.textContent = '×'; x.style.cssText = 'margin-left:3px;color:#7b8698;font-weight:700'; x.addEventListener('click', function (e) { e.stopPropagation(); onDelete(); }); c.appendChild(x); }
    return c;
  }
  function loadUP() { try { return JSON.parse(localStorage.getItem(UP)) || {}; } catch (e) { return {}; } }
  function saveUP(o) { try { localStorage.setItem(UP, JSON.stringify(o)); } catch (e) {} }
  function userPresets(kind) { var o = loadUP(), p = o[fileName()]; return (p && p[kind]) || []; }
  function addUserPreset(kind, entry) { var o = loadUP(), p = o[fileName()] || (o[fileName()] = {}); (p[kind] || (p[kind] = [])).push(entry); saveUP(o); }
  function delUserPreset(kind, name) { var o = loadUP(), p = o[fileName()]; if (!p || !p[kind]) return; p[kind] = p[kind].filter(function (e) { return e.name !== name; }); saveUP(o); }
  function varExists(n) { for (var i = 0; i < VARS.length; i++) if (VARS[i].name === n) return true; return false; }
  function currentColorVars() { var o = {}; COLORS.forEach(function (v) { var c = root.style.getPropertyValue(v.name).trim(); if (c && c !== v.orig) o[v.name] = c; }); return o; }
  function currentFontMap() { var m = {}; FONTS.forEach(function (v) { m[v.name] = firstFamily(curVal(v.name)); }); return m; }
  function askName(msg, def) { var n = (typeof prompt === 'function') ? prompt(msg, def) : def; return n ? n.trim() : ''; }

  function applyColorPreset(p) { COLORS.forEach(function (v) { dropVar(v.name); }); for (var n in p.vars) if (varExists(n)) putVar(n, p.vars[n]); renderScoped(); syncUI(); saveMain(); commit(); toast('已应用配色「' + p.name + '」' + scopeTag()); }
  function applyTypePreset(p) {
    var fams = []; for (var r in p.map) if (p.map[r]) fams.push(p.map[r]);
    ensureFonts(fams);
    FONTS.forEach(function (v) { dropVar(v.name); });
    for (var role in p.map) if (varExists(role) && p.map[role]) putVar(role, stackFor(p.map[role]));
    if (p.fs != null && varExists('--fs')) putVar('--fs', String(p.fs));
    renderScoped();
    fams.forEach(function (f) { if (FONT_OPTS.indexOf(f) < 0) FONT_OPTS.push(f); });
    fontRepop.forEach(function (fn) { fn(); });
    syncUI(); saveMain(); commit(); toast('已应用字体「' + p.name + '」' + scopeTag());
  }
  function ensureFonts(families) {
    var need = [];
    families.forEach(function (f) {
      if (!f || loadedFams[f]) return;
      if (/^(system-ui|ui-monospace|Georgia|Arial|Times New Roman|Helvetica Neue|Courier New|serif|sans-serif|monospace)$/i.test(f)) return;
      need.push(f);
    });
    need = uniq(need); if (!need.length) return;
    need.forEach(function (f) { loadedFams[f] = 1; });
    var q = need.map(function (f) { return 'family=' + f.replace(/ /g, '+') + ':wght@400;700'; }).join('&');
    var link = el('link'); link.rel = 'stylesheet'; link.href = 'https://fonts.googleapis.com/css2?' + q + '&display=swap'; doc.head.appendChild(link);
  }

  function renderColorPresets() {
    if (!colorPresetBox) return; colorPresetBox.innerHTML = '';
    colorPresetBox.appendChild(presetChip('原始 Original', null, function () { COLORS.forEach(function (v) { dropVar(v.name); }); renderScoped(); syncUI(); saveMain(); commit(); toast('已还原配色' + scopeTag()); }));
    (PRESETS[fileName()] || []).forEach(function (p) { colorPresetBox.appendChild(presetChip(p.name, p.accent, function () { applyColorPreset(p); })); });
    userPresets('color').forEach(function (p) { colorPresetBox.appendChild(presetChip(p.name, p.accent, function () { applyColorPreset(p); }, function () { delUserPreset('color', p.name); renderColorPresets(); toast('已删除「' + p.name + '」'); })); });
    colorPresetBox.appendChild(presetChip('＋ 存当前配色', null, saveColorPreset));
  }
  function saveColorPreset() {
    var vars = currentColorVars(); if (!Object.keys(vars).length) { toast('当前配色无改动，无需保存'); return; }
    var name = askName('配色预设名称：', '我的配色'); if (!name) return;
    var av = ACCENT_VAR[fileName()], accent = av ? (vars[av] || curVal(av)) : null;
    addUserPreset('color', { name: name, accent: accent, vars: vars }); renderColorPresets(); toast('已存为配色预设「' + name + '」');
  }
  function renderTypePresets() {
    if (!typePresetBox) return; typePresetBox.innerHTML = '';
    (TYPE_PRESETS[fileName()] || []).forEach(function (p) { typePresetBox.appendChild(presetChip(p.name, null, function () { applyTypePreset(p); })); });
    userPresets('type').forEach(function (p) { typePresetBox.appendChild(presetChip(p.name, null, function () { applyTypePreset(p); }, function () { delUserPreset('type', p.name); renderTypePresets(); toast('已删除「' + p.name + '」'); })); });
    typePresetBox.appendChild(presetChip('＋ 存当前字体', null, saveTypePreset));
  }
  function saveTypePreset() {
    var name = askName('字体预设名称：', '我的字体'); if (!name) return;
    var entry = { name: name, map: currentFontMap() }; if (varExists('--fs')) entry.fs = curVal('--fs');
    addUserPreset('type', entry); renderTypePresets(); toast('已存为字体预设「' + name + '」');
  }

  /* ===== COLORS ===== */
  buildColorPane();
  function buildColorPane() {
    var gp = el('div', { class: 'dm-grp' }); gp.textContent = '预设配色 · COLOR PRESETS'; panes.color.appendChild(gp);
    colorPresetBox = el('div', { class: 'dm-presets' }); panes.color.appendChild(colorPresetBox); renderColorPresets();
    var g = el('div', { class: 'dm-grp' }); g.textContent = '颜色变量 (' + COLORS.length + ')'; panes.color.appendChild(g);
    if (!COLORS.length) { var e = el('div', { class: 'dm-row' }); e.innerHTML = '<div class="nm">无颜色变量</div>'; panes.color.appendChild(e); return; }
    COLORS.forEach(function (v) { panes.color.appendChild(colorRow(v)); });
  }
  function colorRow(v) {
    var cur = curVal(v.name), row = el('div', { class: 'dm-row' }); row.dataset.name = v.name; row.dataset.search = v.name.toLowerCase();
    var nm = el('div', { class: 'nm', title: v.name }); nm.textContent = v.name;
    var sw = el('label', { class: 'dm-sw' }), swi = el('i'); sw.appendChild(swi); swi.style.background = cur;
    var color = el('input', { type: 'color' }); color.value = expand6(pickable(cur) ? cur : v.orig); sw.appendChild(color);
    var hex = el('input', { class: 'dm-hex', type: 'text', spellcheck: 'false' }); hex.value = cur;
    color.addEventListener('input', function () { hex.value = color.value; swi.style.background = color.value; edit(v.name, color.value); });
    hex.addEventListener('input', function () { var val = hex.value.trim(); swi.style.background = val; if (pickable(val)) color.value = expand6(val); edit(v.name, val); });
    row.appendChild(nm); row.appendChild(sw); row.appendChild(hex);
    controls[v.name] = {
      set: function (val) { swi.style.background = val; hex.value = val; if (pickable(val)) color.value = expand6(val); this.mark(); },
      mark: function () { row.classList.toggle('changed', isChanged(v.name)); }
    };
    controls[v.name].mark();
    return row;
  }

  /* ===== TYPE ===== */
  var FONT_OPTS = buildFontOptions();
  buildTypePane();
  function buildTypePane() {
    var gtp = el('div', { class: 'dm-grp' }); gtp.textContent = '字体预设 · TYPE PRESETS'; panes.type.appendChild(gtp);
    typePresetBox = el('div', { class: 'dm-presets' }); panes.type.appendChild(typePresetBox); renderTypePresets();
    if (hasFS) {
      var gs = el('div', { class: 'dm-grp' }); gs.textContent = '全局字号 · TYPE SCALE'; panes.type.appendChild(gs);
      panes.type.appendChild(numVarSlider('--fs', '全局字号 Type scale (--fs)', '×', 0.8, 1.5, 0.02));
      var n0 = el('div', { class: 'dm-note' }); n0.textContent = '--fs 等比缩放全站所有字号（含标题、clamp），真正的全局字号控制。'; panes.type.appendChild(n0);
    }
    var fam = el('div', { class: 'dm-grp' }); fam.textContent = '字体族 · FONT FAMILIES'; panes.type.appendChild(fam);
    var loadBtn = el('button', { class: 'dm-load' }); loadBtn.textContent = '⊕ 载入系统字体';
    loadBtn.addEventListener('click', function () { loadSystemFonts(loadBtn); }); panes.type.appendChild(loadBtn);
    if (!FONTS.length) { var e = el('div', { class: 'dm-row' }); e.innerHTML = '<div class="nm">（此方向未用字体变量）</div>'; panes.type.appendChild(e); }
    FONTS.forEach(function (v) { panes.type.appendChild(fontRow(v)); });
    var txt = el('div', { class: 'dm-grp' }); txt.textContent = '正文文本 · BASE TEXT'; panes.type.appendChild(txt);
    panes.type.appendChild(exSlider('base', '字号 Base size', 'px', 12, 22, 0.5, function () { return px(getComputedStyle(docBody).fontSize); }));
    panes.type.appendChild(exSlider('lh', '行高 Line-height', '', 1.2, 2.1, 0.02, function () { var cs = getComputedStyle(docBody); var r = px(cs.lineHeight) / px(cs.fontSize); return r ? round(r, 2) : 1.6; }));
    panes.type.appendChild(exSlider('ls', '字间距 Letter-spacing', 'em', -0.03, 0.14, 0.005, function () { var cs = getComputedStyle(docBody); return cs.letterSpacing === 'normal' ? 0 : round(px(cs.letterSpacing) / px(cs.fontSize), 3); }));
    var note = el('div', { class: 'dm-note' }); note.textContent = '字号/行高/字间距作用于正文基线（继承文本）；全站缩放请用上方 --fs。'; panes.type.appendChild(note);
  }
  function buildFontOptions() {
    var g = [];
    doc.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(function (l) {
      (l.href.match(/family=([^&]+)/g) || []).forEach(function (m) {
        var name = decodeURIComponent(m.slice(7).split(':')[0]).replace(/\+/g, ' ');
        loadedFams[name] = 1;
        if (g.indexOf(name) < 0) g.push(name);
      });
    });
    return g.concat(['system-ui', 'Georgia', 'Times New Roman', 'Arial', 'Helvetica Neue', 'Courier New', 'ui-monospace']);
  }
  function stackFor(name) {
    var serif = /Fraunces|Newsreader|Georgia|Times|Song|Noto Serif|Playfair|Lora|Source Serif|Spectral|Merriweather|Bitter|Libre Baskerville|serif/i.test(name);
    var mono = /Mono|Consolas|Courier|Code|ui-monospace/i.test(name);
    var fb = mono ? 'ui-monospace,Consolas,monospace' : serif ? 'Georgia,"Songti SC","Microsoft YaHei",serif' : 'system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
    return /^(system-ui|ui-monospace)$/.test(name) ? name + ',' + fb : '"' + name + '",' + fb;
  }
  function firstFamily(stack) { var m = stack.match(/^\s*(?:"([^"]+)"|'([^']+)'|([^,]+))/); return m ? (m[1] || m[2] || m[3]).trim() : ''; }
  function fontRow(v) {
    var cur = curVal(v.name), row = el('div', { class: 'dm-frow' }); row.dataset.name = v.name;
    var nm = el('div', { class: 'nm', title: v.name }); nm.textContent = v.name;
    var cw = el('div', { class: 'cw' });
    var sel = el('select', { class: 'dm-sel' });
    var txt = el('input', { class: 'dm-txt', type: 'text', spellcheck: 'false' }); txt.value = cur;
    var prev = el('div', { class: 'prev' }); prev.textContent = '投研 OPT · AaBbGg 0123'; prev.style.fontFamily = cur;
    function selFromStack(stack) { var f = firstFamily(stack); sel.value = FONT_OPTS.indexOf(f) >= 0 ? f : '__custom'; }
    function repop() {
      var currentStack = curVal(v.name); sel.innerHTML = '';
      FONT_OPTS.forEach(function (o) { var op = el('option'); op.value = o; op.textContent = o; sel.appendChild(op); });
      var opc = el('option'); opc.value = '__custom'; opc.textContent = '自定义…'; sel.appendChild(opc);
      selFromStack(currentStack);
    }
    fontRepop.push(repop); repop();
    sel.addEventListener('change', function () { if (sel.value === '__custom') { txt.focus(); return; } var st = stackFor(sel.value); txt.value = st; prev.style.fontFamily = st; edit(v.name, st); mark(); });
    txt.addEventListener('input', function () { var val = txt.value.trim(); prev.style.fontFamily = val; selFromStack(val); edit(v.name, val); mark(); });
    cw.appendChild(sel); cw.appendChild(txt); row.appendChild(nm); row.appendChild(cw); row.appendChild(prev);
    function mark() { nm.style.color = isChanged(v.name) ? '#63e6a8' : '#aeb7c6'; }
    controls[v.name] = { set: function (val) { txt.value = val; prev.style.fontFamily = val; selFromStack(val); mark(); }, mark: mark };
    mark();
    return row;
  }
  function loadSystemFonts(btn) {
    if (!window.queryLocalFonts) { toast('此浏览器不支持系统字体枚举；可在自定义框直接输入已安装字体名'); return; }
    btn.disabled = true; btn.textContent = '读取中…';
    window.queryLocalFonts().then(function (fonts) {
      var seen = {}, list = [];
      fonts.forEach(function (f) { var fam = f.family; if (fam && !seen[fam]) { seen[fam] = 1; list.push(fam); } });
      list.sort(function (a, b) { return a.localeCompare(b); });
      SYS_FONTS = list; FONT_OPTS = uniq(list.concat(FONT_OPTS));
      fontRepop.forEach(function (fn) { fn(); });
      toast('已载入 ' + list.length + ' 个系统字体');
    }).catch(function () { toast('无法读取系统字体（权限被拒或不支持）'); })
      .then(function () { btn.disabled = false; btn.textContent = '⊕ 载入系统字体 (' + (SYS_FONTS.length || 0) + ')'; });
  }

  /* ===== SPACE ===== */
  buildSpacePane();
  function buildSpacePane() {
    var g1 = el('div', { class: 'dm-grp' }); g1.textContent = '页面缩放 · ZOOM'; panes.space.appendChild(g1);
    panes.space.appendChild(exSlider('zoom', '整体缩放 Zoom', '×', 0.75, 1.3, 0.01, function () { return 1; }));
    var note = el('div', { class: 'dm-note' }); note.textContent = 'Zoom 等比缩放整页（布局+文字）；只改字号请用「字体」页的 --fs。'; panes.space.appendChild(note);
    if (SIZES.length) {
      var g2 = el('div', { class: 'dm-grp' }); g2.textContent = '尺寸变量 · SIZE TOKENS (' + SIZES.length + ')'; panes.space.appendChild(g2);
      SIZES.forEach(function (v) { panes.space.appendChild(sizeRow(v)); });
    }
  }
  function sizeRow(v) {
    var cur = curVal(v.name);
    if (!isLen(cur)) {
      var row0 = el('div', { class: 'dm-row' }); var nm0 = el('div', { class: 'nm', title: v.name }); nm0.textContent = v.name;
      var t0 = el('input', { class: 'dm-txt', type: 'text', spellcheck: 'false' }); t0.value = cur;
      t0.addEventListener('input', function () { edit(v.name, t0.value.trim()); });
      row0.appendChild(nm0); row0.appendChild(t0);
      controls[v.name] = { set: function (val) { t0.value = val; }, mark: function () {} };
      return row0;
    }
    var num = parseFloat(cur), unit = cur.replace(/^-?\d*\.?\d+/, '') || 'px';
    var min = num >= 300 ? Math.round(num * 0.5) : Math.max(0, Math.round(num * 0.4));
    var max = Math.round(num * 1.6) || 100, step = num >= 200 ? 10 : num >= 20 ? 1 : 0.5;
    var wrap = el('div', { class: 'dm-slider' }), top = el('div', { class: 'top' });
    var nm = el('span', { class: 'nm' }); nm.textContent = v.name;
    var val = el('span', { class: 'val' }); val.textContent = cur;
    var rr = el('button', { class: 'rr', title: '重置' }); rr.textContent = 'reset';
    top.appendChild(nm); top.appendChild(val); top.appendChild(rr);
    var rng = el('input', { type: 'range', min: min, max: max, step: step }); rng.value = num;
    rng.addEventListener('input', function () { var nv = rng.value + unit; val.textContent = nv; val.classList.add('set'); edit(v.name, nv); });
    rr.addEventListener('click', function () { dropVar(v.name); renderScoped(); val.textContent = v.orig; val.classList.remove('set'); rng.value = parseFloat(v.orig); saveMain(); schedule(); });
    wrap.appendChild(top); wrap.appendChild(rng);
    controls[v.name] = { set: function (value) { val.textContent = value; rng.value = parseFloat(value); val.classList.toggle('set', isChanged(v.name)); }, mark: function () {} };
    return wrap;
  }

  /* ===== slider that drives a real CSS var numerically (e.g. --fs) ===== */
  function numVarSlider(name, label, unit, min, max, step) {
    var orig = origOf(name) || '1';
    var wrap = el('div', { class: 'dm-slider' }), top = el('div', { class: 'top' });
    var nm = el('span', { class: 'nm' }); nm.textContent = label;
    var val = el('span', { class: 'val' });
    var rr = el('button', { class: 'rr', title: '重置' }); rr.textContent = 'reset';
    top.appendChild(nm); top.appendChild(val); top.appendChild(rr);
    var rng = el('input', { type: 'range', min: min, max: max, step: step });
    function show() { var c = curVal(name), n = parseFloat(c); if (isNaN(n)) n = parseFloat(orig) || 1; rng.value = n; val.textContent = round(n, 2) + unit; val.classList.toggle('set', isChanged(name)); }
    rng.addEventListener('input', function () { edit(name, String(rng.value)); val.textContent = round(parseFloat(rng.value), 2) + unit; val.classList.add('set'); });
    rr.addEventListener('click', function () { dropVar(name); renderScoped(); saveMain(); schedule(); show(); });
    wrap.appendChild(top); wrap.appendChild(rng);
    controls[name] = { set: function () { show(); }, mark: function () {} };
    show(); return wrap;
  }

  /* ===== extra-slider (injected settings) ===== */
  function exSlider(key, label, unit, min, max, step, defFn) {
    var wrap = el('div', { class: 'dm-slider' }), top = el('div', { class: 'top' });
    var nm = el('span', { class: 'nm' }); nm.textContent = label;
    var val = el('span', { class: 'val' });
    var rr = el('button', { class: 'rr', title: '重置' }); rr.textContent = 'reset';
    top.appendChild(nm); top.appendChild(val); top.appendChild(rr);
    var rng = el('input', { type: 'range', min: min, max: max, step: step });
    function disp() { var active = ex[key] != null; var value = active ? ex[key] : defFn(); rng.value = value; val.textContent = round(value, 3) + unit; val.classList.toggle('set', active); }
    rng.addEventListener('input', function () { editEx(key, parseFloat(rng.value)); val.textContent = round(parseFloat(rng.value), 3) + unit; val.classList.add('set'); });
    rr.addEventListener('click', function () { editEx(key, null); disp(); });
    wrap.appendChild(top); wrap.appendChild(rng); disp();
    exCtl[key] = { set: disp };
    return wrap;
  }

  /* ---------- sync all controls ---------- */
  function syncUI() {
    VARS.forEach(function (v) { if (controls[v.name]) controls[v.name].set(curVal(v.name)); });
    for (var k in exCtl) exCtl[k].set();
  }

  /* ---------- tabs / search ---------- */
  panel.querySelectorAll('#dm-tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      panel.querySelectorAll('#dm-tabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
      for (var p in panes) panes[p].classList.toggle('on', p === b.dataset.t);
      panel.querySelector('#dm-search').style.display = b.dataset.t === 'color' ? '' : 'none';
    });
  });
  panel.querySelector('#dm-search').addEventListener('input', function (e) {
    var q = e.target.value.trim().toLowerCase();
    panes.color.querySelectorAll('.dm-row').forEach(function (r) { if (!r.dataset.search) return; r.style.display = (!q || r.dataset.search.indexOf(q) >= 0) ? '' : 'none'; });
  });

  /* ---------- scope: section-targeted editing ---------- */
  var scopeSel = panel.querySelector('#dm-scopesel');
  var pickBtn = panel.querySelector('#dm-pick');
  var clrBtn = panel.querySelector('#dm-scopeclr');
  var hi = el('div', { id: 'dm-hi' }); var hiLab = el('div', { class: 'lab' }); hi.appendChild(hiLab); docBody.appendChild(hi);
  var SCOPE_SEL = 'section,header.nav,footer,.hero,.cta,[id]';
  function selectorFor(e) {
    if (e === root) return ':root';
    if (e.id) return '#' + e.id;
    var tag = e.tagName.toLowerCase();
    for (var i = 0; i < e.classList.length; i++) { var s = tag + '.' + e.classList[i]; try { if (doc.querySelectorAll(s).length === 1) return s; } catch (x) {} }
    try { if (doc.querySelectorAll(tag).length === 1) return tag; } catch (x) {}
    return null;
  }
  function labelFor(e, sel) { var h = e.querySelector && e.querySelector('h1,h2,h3,h4'); var t = h ? h.textContent.trim().replace(/\s+/g, ' ').slice(0, 16) : ''; return sel + (t ? ' · ' + t : ''); }
  function collectScopes() {
    var list = [{ sel: ':root', label: '🌐 全站 Global' }], seen = { ':root': 1 };
    docBody.querySelectorAll(SCOPE_SEL).forEach(function (e) {
      if (e.closest('#dm-panel,#dm-fab,#dm-toast,#dm-hi')) return;
      var sel = selectorFor(e); if (!sel || seen[sel]) return; seen[sel] = 1; list.push({ sel: sel, label: labelFor(e, sel) });
    });
    return list;
  }
  function fillScopeSel() {
    scopeSel.innerHTML = '';
    collectScopes().forEach(function (o) { var op = el('option'); op.value = o.sel; op.textContent = o.label; scopeSel.appendChild(op); });
    if (!Array.prototype.some.call(scopeSel.options, function (o) { return o.value === scope; })) { var op = el('option'); op.value = scope; op.textContent = scope; scopeSel.appendChild(op); }
    scopeSel.value = scope;
  }
  function updateScopeUI() { scopeSel.classList.toggle('scoped', scope !== ':root'); clrBtn.style.display = scope === ':root' ? 'none' : ''; var o = scopeOv[scope]; clrBtn.textContent = '清除 (' + (o ? Object.keys(o).length : 0) + ')'; if (typeof refreshOutline === 'function') refreshOutline(); }
  function setScope(sel) { scope = sel || ':root'; fillScopeSel(); updateScopeUI(); syncUI(); }
  scopeSel.addEventListener('change', function () { setScope(scopeSel.value); });
  clrBtn.addEventListener('click', function () { if (scope === ':root') return; delete scopeOv[scope]; renderScoped(); updateScopeUI(); syncUI(); saveMain(); commit(); toast('已清除本区块改动'); });
  var picking = false;
  function setHi(e) { if (!e) { hi.style.display = 'none'; return; } var r = e.getBoundingClientRect(); hi.style.display = 'block'; hi.style.left = r.left + 'px'; hi.style.top = r.top + 'px'; hi.style.width = r.width + 'px'; hi.style.height = r.height + 'px'; hiLab.textContent = selectorFor(e) || e.tagName.toLowerCase(); }
  function pickTarget(t) { if (!t || t.closest('#dm-panel,#dm-fab,#dm-toast,#dm-hi')) return null; return t.closest(SCOPE_SEL); }
  function onMove(ev) { setHi(pickTarget(ev.target)); }
  function onPick(ev) { var t = pickTarget(ev.target); if (t) { ev.preventDefault(); ev.stopPropagation(); var sel = selectorFor(t); if (sel) { setScope(sel); toast('作用域 → ' + sel); } } stopPick(); }
  function startPick() { picking = true; pickBtn.classList.add('on'); docBody.style.cursor = 'crosshair'; doc.addEventListener('mousemove', onMove, true); doc.addEventListener('click', onPick, true); toast('点选一个区块…'); }
  function stopPick() { picking = false; pickBtn.classList.remove('on'); docBody.style.cursor = ''; hi.style.display = 'none'; doc.removeEventListener('mousemove', onMove, true); doc.removeEventListener('click', onPick, true); }
  pickBtn.addEventListener('click', function () { picking ? stopPick() : startPick(); });

  /* section outline overlay — boxes every editable scope */
  var obtn = panel.querySelector('#dm-obtn');
  var outline = el('div', { id: 'dm-outline' }); docBody.appendChild(outline);
  var outlineOn = false, oboxes = [], oTick = false;
  function buildOutline() {
    outline.innerHTML = ''; oboxes = [];
    collectScopes().forEach(function (o) {
      if (o.sel === ':root') return;
      var e = qEl(o.sel); if (!e) return; var r = e.getBoundingClientRect(); if (r.width < 8 || r.height < 8) return;
      var box = el('div', { class: 'dm-obox' });
      var lab = el('div', { class: 'dm-olab' }); lab.textContent = o.label;
      lab.addEventListener('click', function (ev) { ev.stopPropagation(); setScope(o.sel); });
      box.appendChild(lab); outline.appendChild(box); oboxes.push({ el: e, box: box, sel: o.sel });
    });
    positionOutline(); refreshOutlineStyles();
  }
  function positionOutline() { oboxes.forEach(function (b) { var r = b.el.getBoundingClientRect(); b.box.style.left = r.left + 'px'; b.box.style.top = r.top + 'px'; b.box.style.width = r.width + 'px'; b.box.style.height = r.height + 'px'; }); }
  function refreshOutlineStyles() { oboxes.forEach(function (b) { var o = scopeOv[b.sel]; b.box.classList.toggle('has', !!(o && Object.keys(o).length)); b.box.classList.toggle('active', b.sel === scope); }); }
  function refreshOutline() { if (!outlineOn) return; positionOutline(); refreshOutlineStyles(); }
  function onOScroll() { if (oTick) return; oTick = true; requestAnimationFrame(function () { positionOutline(); oTick = false; }); }
  var hoverBox = null;
  function boxForTarget(t) {
    if (!t || (t.closest && t.closest('#dm-panel,#dm-fab,#dm-toast,#dm-hi'))) return null;
    for (var i = 0; i < oboxes.length; i++) { if (oboxes[i].box.contains(t)) return oboxes[i]; }   // hovering a label
    var e = t.closest && t.closest(SCOPE_SEL);
    while (e) { for (var j = 0; j < oboxes.length; j++) { if (oboxes[j].el === e) return oboxes[j]; } e = e.parentElement && e.parentElement.closest(SCOPE_SEL); }
    return null;
  }
  function setHoverBox(b) { if (hoverBox === b) return; if (hoverBox) hoverBox.box.classList.remove('hover'); hoverBox = b; if (b) b.box.classList.add('hover'); }
  function onOutlineMove(ev) { setHoverBox(boxForTarget(ev.target)); }
  function onOutlineClick(ev) { var b = boxForTarget(ev.target); if (b) { ev.preventDefault(); ev.stopPropagation(); setScope(b.sel); } }
  function startOutline() {
    outlineOn = true; obtn.classList.add('on'); buildOutline();
    window.addEventListener('scroll', onOScroll, true); window.addEventListener('resize', onOScroll);
    doc.addEventListener('mousemove', onOutlineMove, true); doc.addEventListener('click', onOutlineClick, true);
    docBody.style.cursor = 'crosshair'; toast('悬停高亮 · 点击任意区块即可选中编辑');
  }
  function stopOutline() {
    outlineOn = false; obtn.classList.remove('on'); outline.innerHTML = ''; oboxes = []; setHoverBox(null);
    window.removeEventListener('scroll', onOScroll, true); window.removeEventListener('resize', onOScroll);
    doc.removeEventListener('mousemove', onOutlineMove, true); doc.removeEventListener('click', onOutlineClick, true);
    docBody.style.cursor = '';
  }
  obtn.addEventListener('click', function () { outlineOn ? stopOutline() : startOutline(); });

  fillScopeSel(); updateScopeUI();

  /* ---------- toolbar / footer ---------- */
  var bUndo = panel.querySelector('#dm-undo'), bRedo = panel.querySelector('#dm-redo');
  bUndo.addEventListener('click', undo); bRedo.addEventListener('click', redo);
  function updateUndoUI() { bUndo.disabled = ptr <= 0; bRedo.disabled = ptr >= hist.length - 1; }
  panel.querySelector('#dm-copy').addEventListener('click', function () {
    var o = curVars(), keys = Object.keys(o), out = '';
    if (keys.length) out += ':root{\n' + keys.map(function (k) { return '  ' + k + ': ' + o[k] + ';'; }).join('\n') + '\n}\n';
    for (var sel in scopeOv) { var so = scopeOv[sel], sk = Object.keys(so); if (sk.length) out += (out ? '\n' : '') + sel + '{\n' + sk.map(function (k) { return '  ' + k + ': ' + so[k] + ';'; }).join('\n') + '\n}\n'; }
    var inj = injCSS(ex); if (inj) out += (out ? '\n' : '') + inj;
    if (!out) { toast('暂无改动可复制'); return; }
    copy(out.trim()); toast('已复制 CSS 到剪贴板');
  });
  panel.querySelector('#dm-reset').addEventListener('click', function () {
    VARS.forEach(function (v) { root.style.removeProperty(v.name); });
    scopeOv = {}; renderScoped(); scope = ':root'; fillScopeSel(); updateScopeUI();
    ex = { base: null, lh: null, ls: null, zoom: null }; writeInject(); saveMain(); syncUI(); commit(); toast('已重置为原始主题');
  });
  panel.querySelector('#dm-close').addEventListener('click', close);
  panel.querySelector('#dm-x').addEventListener('click', close);

  /* ---------- backups ---------- */
  var bkList = panel.querySelector('#dm-bklist');
  function refreshBk() {
    var b = loadBackups(); bkList.innerHTML = '';
    var names = Object.keys(b);
    if (!names.length) { var o = el('option'); o.textContent = '（暂无备份）'; o.value = ''; bkList.appendChild(o); return; }
    names.sort().forEach(function (n) { var e = b[n]; var o = el('option'); o.value = n; o.textContent = n + ' · ' + (e.page || '') + ' · ' + (e.time || ''); bkList.appendChild(o); });
  }
  refreshBk();
  panel.querySelector('#dm-bksave').addEventListener('click', function () {
    var inp = panel.querySelector('#dm-bkname'), name = inp.value.trim();
    if (!name) { inp.focus(); toast('请先输入备份名称'); return; }
    var b = loadBackups(); b[name] = { page: fileName(), time: stamp(), state: readState() }; saveBackups(b); refreshBk(); inp.value = ''; toast('已保存备份「' + name + '」');
  });
  panel.querySelector('#dm-bkload').addEventListener('click', function () {
    var n = bkList.value; if (!n) return; var b = loadBackups(); if (!b[n]) return; applyState(b[n].state); commit(); toast('已载入「' + n + '」');
  });
  panel.querySelector('#dm-bkdel').addEventListener('click', function () {
    var n = bkList.value; if (!n) return; var b = loadBackups(); delete b[n]; saveBackups(b); refreshBk(); toast('已删除「' + n + '」');
  });
  panel.querySelector('#dm-export').addEventListener('click', function () {
    var data = { app: 'lingyue-devmode', v: 1, page: fileName(), savedAt: stamp(), state: readState() };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var a = el('a'); a.href = URL.createObjectURL(blob); a.download = 'theme-' + fileName().replace(/\.html?$/, '') + '.json';
    docBody.appendChild(a); a.click(); docBody.removeChild(a); setTimeout(function () { URL.revokeObjectURL(a.href); }, 500); toast('已导出主题文件');
  });
  panel.querySelector('#dm-import').addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function () {
    var f = fileInput.files && fileInput.files[0]; if (!f) return;
    var rd = new FileReader();
    rd.onload = function () { try { var d = JSON.parse(rd.result); var s = d.state || d; if (!s.ov && !s.ex) throw 0; applyState(s); commit(); toast('已导入主题'); } catch (e) { toast('文件无法解析'); } fileInput.value = ''; };
    rd.readAsText(f);
  });

  /* ---------- open / close / keys ---------- */
  function open() { panel.classList.add('open'); fab.style.display = 'none'; updateUndoUI(); }
  function close() { panel.classList.remove('open'); fab.style.display = ''; if (typeof stopOutline === 'function' && outlineOn) stopOutline(); }
  fab.addEventListener('click', open);
  doc.addEventListener('keydown', function (e) {
    var t = e.target, typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    var isOpen = panel.classList.contains('open');
    if (!typing && e.shiftKey && (e.key === 'D' || e.key === 'd')) { e.preventDefault(); isOpen ? close() : open(); return; }
    if (e.key === 'Escape' && isOpen) { close(); return; }
    if (isOpen && (e.ctrlKey || e.metaKey)) {
      if (e.key === 'z' || e.key === 'Z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (e.key === 'y' || e.key === 'Y') { e.preventDefault(); redo(); }
    }
  });
  if (/[?&]dev\b/.test(location.search)) open();
  updateUndoUI();

  /* ---------- utils ---------- */
  function el(tag, attrs) { var n = doc.createElement(tag); if (attrs) for (var a in attrs) n.setAttribute(a, attrs[a]); return n; }
  function fileName() { return location.pathname.split('/').pop() || 'index.html'; }
  function px(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function round(n, d) { var p = Math.pow(10, d || 0); return Math.round(n * p) / p; }
  function uniq(a) { var s = {}, o = []; a.forEach(function (x) { if (!s[x]) { s[x] = 1; o.push(x); } }); return o; }
  function injLines(e) { return (e.base != null ? 1 : 0) + (e.lh != null ? 1 : 0) + (e.ls != null ? 1 : 0) + (e.zoom != null ? 1 : 0); }
  function stamp() { var d = new Date(); function z(x) { return (x < 10 ? '0' : '') + x; } return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + ' ' + z(d.getHours()) + ':' + z(d.getMinutes()); }
  function copy(str) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(str).catch(fb); else fb();
    function fb() { var ta = el('textarea'); ta.value = str; ta.style.position = 'fixed'; ta.style.opacity = '0'; docBody.appendChild(ta); ta.select(); try { doc.execCommand('copy'); } catch (e) {} docBody.removeChild(ta); }
  }
  var toastT; function toast(m) { toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 1700); }

  console.log('%c[dev-mode] ready', 'color:#63e6a8', '· Shift+D ·', VARS.length, 'vars ·', COLORS.length, 'colors', FONTS.length, 'fonts', SIZES.length, 'sizes', hasFS ? '· --fs' : '');
})();
