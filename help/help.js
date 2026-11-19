// ヘルプの検索（トップのページ）。help-search.js の HELP_INDEX から探す
(function () {
  var q = document.getElementById('help-q'), box = document.getElementById('help-results');
  if (!q || !box || !window.HELP_INDEX) return;
  var norm = function (s) { return String(s || '').toLowerCase().normalize('NFKC').replace(/[\u30a1-\u30f6]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); }).replace(/\s+/g, ''); };
  var idx = window.HELP_INDEX.map(function (x) { return { x: x, n: norm(x.n), t: norm(x.t + x.c) }; });
  function show() {
    var words = q.value.trim().split(/\s+/).filter(Boolean).map(norm);
    if (!words.length) { box.hidden = true; box.textContent = ''; return; }
    var hit = idx.map(function (i) { var s = 0; for (var k = 0; k < words.length; k++) { var w = words[k]; if (i.n.indexOf(w) >= 0) s += 3; else if (i.t.indexOf(w) >= 0) s += 1; else return null; } return { i: i, s: s }; }).filter(Boolean).sort(function (a, b) { return b.s - a.s; }).slice(0, 12);
    box.textContent = '';
    if (!hit.length) { var d = document.createElement('div'); d.className = 'none'; d.textContent = '見つかりませんでした。言葉を短くして、もう一度お試しください。'; box.appendChild(d); }
    hit.forEach(function (h) {
      var a = document.createElement('a'); a.href = h.i.x.u;
      var b = document.createElement('b'); b.textContent = h.i.x.n; a.appendChild(b);
      if (h.i.x.p) { var p = document.createElement('span'); p.className = 'help-pro'; p.textContent = 'PRO'; a.appendChild(document.createTextNode(' ')); a.appendChild(p); }
      var s = document.createElement('small'); s.textContent = h.i.x.c + (h.i.x.v ? '・動く画像あり' : '') + ' — ' + h.i.x.t.slice(0, 60); a.appendChild(s);
      box.appendChild(a);
    });
    box.hidden = false;
  }
  q.addEventListener('input', show);
})();
