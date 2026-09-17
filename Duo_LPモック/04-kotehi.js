(function () {
  'use strict';

  var form = document.getElementById('cost-form');
  if (!form) return;
  var boxes = Array.from(form.querySelectorAll('input[name="cost"]'));
  var run = document.getElementById('cost-run');
  var clear = document.getElementById('cost-clear');
  var selection = document.getElementById('cost-selection');
  var results = document.getElementById('cost-results');
  var title = document.getElementById('results-title');
  var entries = Array.from(document.querySelectorAll('[data-cost-result]'));
  var save = document.getElementById('cost-save');
  var saveStatus = document.getElementById('cost-save-status');
  var downloadUrl = null;

  function selectedKeys() {
    return boxes.filter(function (box) { return box.checked; }).map(function (box) { return box.value; });
  }

  function releaseDownload() {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    downloadUrl = null;
    save.removeAttribute('href');
    save.hidden = true;
  }

  function invalidate() {
    var keys = selectedKeys();
    var count = keys.filter(function (key) { return key !== 'unknown'; }).length;
    var unknown = keys.includes('unknown');
    run.disabled = clear.disabled = keys.length === 0;
    selection.textContent = count ? count + '費目を選択中' + (unknown ? '・契約の一覧づくりも確認' : '') :
      (unknown ? '契約の一覧づくりから確認します' : '気になる費目を選んでください');
    results.hidden = true;
    entries.forEach(function (entry) { entry.hidden = true; });
    saveStatus.textContent = '';
    releaseDownload();
  }

  function memoText(visible) {
    var lines = ['NXTERA 固定費見直し・確認メモ', '', '削減額や削減の可否を判定するものではありません。', '相談料・支援条件は確認中です。', ''];
    visible.forEach(function (entry) {
      lines.push(entry.querySelector('h4').textContent.trim());
      Array.from(entry.querySelectorAll('dl > div')).forEach(function (row) {
        lines.push(row.querySelector('dt').textContent.trim() + ': ' + row.querySelector('dd').textContent.trim());
      });
      lines.push('');
    });
    lines.push('相談時に確認すること: 契約期限、必要な機能、比較範囲、作業の担当、支援費用。');
    return lines.join('\r\n');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var keys = selectedKeys();
    if (!keys.length) return;
    var visible = entries.filter(function (entry) { return keys.includes(entry.dataset.costResult); });
    entries.forEach(function (entry) { entry.hidden = !visible.includes(entry); });
    results.hidden = false;
    title.textContent = '確認ポイント・' + visible.length + '項目';
    releaseDownload();
    try {
      // A BOM keeps Japanese text readable in Windows text editors.
      downloadUrl = URL.createObjectURL(new Blob(['\uFEFF', memoText(visible)], { type: 'text/plain;charset=utf-8' }));
      save.href = downloadUrl;
      save.hidden = false;
      saveStatus.textContent = '';
    } catch (error) {
      saveStatus.textContent = 'この環境ではメモの保存を利用できません。確認内容は上に表示しています。';
    }
    title.focus();
  });

  form.addEventListener('change', invalidate);
  form.addEventListener('reset', function (event) {
    event.preventDefault();
    boxes.forEach(function (box) { box.checked = false; });
    invalidate();
    boxes[0].focus();
  });

  function revealAnchor() {
    var target = document.getElementById(location.hash.slice(1));
    if (target && target.tagName === 'DETAILS') target.open = true;
  }

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('hashchange', revealAnchor);
  window.addEventListener('pageshow', function () {
    invalidate();
    if (!location.hash) window.scrollTo(0, 0);
    else revealAnchor();
  });
  window.addEventListener('pagehide', releaseDownload);
  invalidate();
})();
