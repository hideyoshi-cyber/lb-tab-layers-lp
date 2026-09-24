/* LB TAB Layers Blog — ブログ内検索とシェアボタン
 * - 一覧ページ（#blog-search がある）では search-index.json を読み込んでカードを絞り込む
 * - 記事ページではシェアの「リンクをコピー」と、端末の共有シート（対応ブラウザのみ）を有効にする
 * 外部ライブラリなし・外部への送信なし。
 */
(function () {
  'use strict';

  // ---------- 日本語の表記ゆれを吸収する正規化 ----------
  // 全角→半角(NFKC)・大文字→小文字・カタカナ→ひらがな・長音記号と空白を除去
  function norm(s) {
    return String(s || '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[ァ-ヶ]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0x60); })
      .replace(/[ーーｰ\-]/g, '')
      .replace(/\s+/g, '');
  }

  // ---------- シェアボタン ----------
  function initShare() {
    document.querySelectorAll('.bshare-copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var url = btn.getAttribute('data-url') || location.href;
        var done = function () {
          var label = btn.querySelector('.bshare-label') || btn;
          var original = label.textContent;
          label.textContent = 'コピーしました';
          btn.classList.add('copied');
          setTimeout(function () { label.textContent = original; btn.classList.remove('copied'); }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done, function () { window.prompt('このURLをコピーしてください', url); });
        } else {
          window.prompt('このURLをコピーしてください', url);
        }
      });
    });
    if (navigator.share) {
      document.querySelectorAll('.bshare-native').forEach(function (btn) {
        btn.hidden = false;
        btn.addEventListener('click', function () {
          navigator.share({ title: btn.getAttribute('data-title') || document.title, url: btn.getAttribute('data-url') || location.href }).catch(function () {});
        });
      });
    }
  }

  // ---------- ブログ内検索（一覧ページ） ----------
  function initSearch() {
    var input = document.getElementById('blog-search');
    if (!input) return;
    var grid = document.querySelector('.blog-grid');
    var status = document.getElementById('blog-search-status');
    var tagWrap = document.getElementById('blog-tags');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.blog-card'));
    var originalOrder = cards.slice();
    var entries = {};   // href -> { t, g, k, d, x }（正規化済み）
    var activeTag = '';

    // カード自体の文字も検索対象にする（インデックスが読めない環境でも動くように）
    cards.forEach(function (c) {
      var href = c.getAttribute('href');
      var tagEl = c.querySelector('.blog-card-tag');
      entries[href] = {
        t: norm((c.querySelector('h2') || {}).textContent),
        g: tagEl ? tagEl.textContent.trim() : '',
        k: '',
        d: norm((c.querySelector('p') || {}).textContent),
        x: '',
      };
    });

    function buildTags() {
      if (!tagWrap) return;
      var counts = {};
      cards.forEach(function (c) { var g = entries[c.getAttribute('href')].g; if (g) counts[g] = (counts[g] || 0) + 1; });
      // 1件しかないタグまで並べると選びにくいので、2件以上のタグだけボタンにする（1件のタグも検索では見つかる）
      var tags = Object.keys(counts)
        .filter(function (g) { return counts[g] >= 2 || g === activeTag; })
        .sort(function (a, b) { return counts[b] - counts[a]; });
      tagWrap.innerHTML = '';
      var mk = function (label, value, n) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'blog-tag-chip' + (activeTag === value ? ' active' : '');
        b.textContent = n != null ? label + ' ' + n : label;
        b.setAttribute('aria-pressed', activeTag === value ? 'true' : 'false');
        b.addEventListener('click', function () { activeTag = value; buildTags(); apply(); });
        tagWrap.appendChild(b);
      };
      mk('すべて', '', cards.length);
      tags.forEach(function (g) { mk(g, g, counts[g]); });
    }

    function score(e, terms) {
      var total = 0;
      for (var i = 0; i < terms.length; i++) {
        var q = terms[i], s = 0;
        if (e.t.indexOf(q) >= 0) s += 10;
        if (norm(e.g).indexOf(q) >= 0) s += 6;
        if (e.k.indexOf(q) >= 0) s += 5;
        if (e.d.indexOf(q) >= 0) s += 3;
        if (e.x.indexOf(q) >= 0) s += 1;
        if (s === 0) return 0;   // すべての語を含むものだけ（AND検索）
        total += s;
      }
      return total;
    }

    function apply() {
      var raw = input.value.trim();
      var terms = raw.split(/[\s　]+/).map(norm).filter(Boolean);
      var shown = [];
      cards.forEach(function (c) {
        var e = entries[c.getAttribute('href')];
        if (activeTag && e.g !== activeTag) { c.hidden = true; return; }
        var sc = terms.length ? score(e, terms) : 1;
        c.hidden = sc === 0;
        if (sc) shown.push({ c: c, sc: sc });
      });
      // 検索語があるときは関連度順、ないときは元の並び（新しい順）
      var order = terms.length ? shown.sort(function (a, b) { return b.sc - a.sc; }).map(function (o) { return o.c; }) : originalOrder;
      order.forEach(function (c) { grid.appendChild(c); });

      if (status) {
        if (!terms.length && !activeTag) status.textContent = '';
        else if (shown.length) status.textContent = (raw ? '「' + raw + '」' : '') + (activeTag ? '［' + activeTag + '］' : '') + ' の記事：' + shown.length + '件';
        else status.textContent = (raw ? '「' + raw + '」' : 'この条件') + ' に一致する記事はありませんでした。言葉を短くするか、別の言い方で試してください。';
      }
      // URLに検索条件を残す（共有・戻るで再現できるように）
      var params = new URLSearchParams();
      if (raw) params.set('q', raw);
      if (activeTag) params.set('tag', activeTag);
      var qs = params.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    }

    // URL の ?q= / ?tag= を反映
    var p = new URLSearchParams(location.search);
    if (p.get('q')) input.value = p.get('q');
    if (p.get('tag')) activeTag = p.get('tag');

    var timer = null;
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(apply, 120); });
    input.form && input.form.addEventListener('submit', function (ev) { ev.preventDefault(); apply(); });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === '/' && document.activeElement !== input && !/INPUT|TEXTAREA/.test((document.activeElement || {}).tagName)) {
        ev.preventDefault(); input.focus();
      }
    });

    buildTags();
    apply();

    // 本文まで含めた検索インデックスを読み込む（読めなければカードの文字だけで検索）
    fetch('search-index.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (idx) {
      if (!idx || !idx.articles) return;
      idx.articles.forEach(function (a) {
        var e = entries[a.url];
        if (!e) return;
        e.t = norm(a.title) + e.t;
        e.k = norm((a.keywords || []).join(' '));
        e.d = norm(a.description) + e.d;
        e.x = norm(a.text);
        if (a.tag) e.g = a.tag;
      });
      apply();
    }).catch(function () {});
  }

  function init() { initShare(); initSearch(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
