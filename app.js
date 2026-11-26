/* Студия: кейсы с переключением кадров, календарь декабря, письмо */
(function () {
  'use strict';
  var d = document, $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); }, K = window.KIT;

  /* ---- кейсы ---- */
  $$('.case').forEach(function (c) {
    var im = $$('.win img', c), b = $$('.feat button', c), cur = 0, tm = 0, vis = false, user = false;
    function go(i) { if (i === cur) return; im.forEach(function (x) { x.classList.remove('prev'); }); im[cur].classList.add('prev'); im[cur].classList.remove('on'); im[i].classList.add('on'); b.forEach(function (x, j) { x.setAttribute('aria-pressed', j === i); }); cur = i; }
    function play() { clearTimeout(tm); c.classList.remove('run'); if (!vis || user || K.REDUCED || K.still) return; void c.offsetWidth; c.classList.add('run'); tm = setTimeout(function () { go((cur + 1) % im.length); play(); }, 5200); }
    b.forEach(function (x, i) { x.addEventListener('click', function () { user = true; go(i); play(); }); x.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { user = true; go(i); play(); } }); });
    K.onView(c, function (v) { vis = v; if (v) { im.forEach(function (x) { x.loading = 'eager'; }); if (cur === 0 || !user) play(); } else clearTimeout(tm); }, { threshold: .35 });
  });

  /* ---- календарь ---- */
  var cal = $('.cal'), days = $$('.day[data-p]'); days.forEach(function (x, i) { x.style.setProperty('--k', i); });
  K.onView(cal, function (v) { if (v) { cal.classList.add('in'); setTimeout(function () { cal.classList.add('done'); }, 2800); } }, { threshold: .35 });
  $$('.ph button').forEach(function (b) { function on() { $$('.ph button').forEach(function (q) { q.classList.toggle('on', q === b); }); cal.classList.add('dim'); days.forEach(function (x) { x.classList.toggle('hi', x.dataset.p === b.dataset.ph); }); } b.addEventListener('pointerenter', on); b.addEventListener('focus', on); b.addEventListener('click', on); });
  $('.ph').addEventListener('pointerleave', function () { cal.classList.remove('dim'); days.forEach(function (x) { x.classList.remove('hi'); }); $$('.ph button').forEach(function (q) { q.classList.remove('on'); }); });

  /* ---- что входит в цену ---- */
  var info = $('.info'); if (info) { $$('li', info).forEach(function (x, i) { x.style.setProperty('--n', i); }); K.onView(info, function (v) { if (v) info.classList.add('in'); }, { threshold: .2 }); }

  /* ---- письмо ---- */
  $('#f').addEventListener('submit', function (e) { e.preventDefault(); var t = [], n = ''; new FormData(e.target).forEach(function (v, k) { if (String(v).trim()) t.push(k + ': ' + v); if (k === 'Компания') n = v; }); $('.hint').textContent = 'Открываем почту. Если не открылась, напишите на artsevershop@gmail.com'; location.href = 'mailto:artsevershop@gmail.com?subject=' + encodeURIComponent('Сайт для ' + n) + '&body=' + encodeURIComponent(t.join('\n')); });
})();
