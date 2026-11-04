(function () {
  'use strict';
  var O = window.OFERTY || [], S = window.SMN;
  var id = new URLSearchParams(location.search).get('id');
  var o = O.find(function (x) { return x.id === id; }) || O.find(function (x) { return x.id === '22037'; }) || O[0];
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
  document.title = o.t + ' - ' + o.lok + ' | Sylwia Markiewicz Nieruchomości';

  $('#c-kat').textContent = S.KAT[o.kat];
  $('#c-kat').href = 'oferty.html?kat=' + o.kat;
  $('#c-t').textContent = o.t;
  $('#of-h1').textContent = o.t;
  $('#of-loc').innerHTML = S.IC.pin + esc(o.lok);
  $('#of-cena').innerHTML = S.cena(o);
  var pm = o.pow ? Math.round(o.cena / o.pow) : (o.dz && o.kat !== 'dom' ? Math.round(o.cena / o.dz) : 0);
  $('#of-m2').textContent = pm ? S.nf(pm) + ' zł/m²' + (o.pow ? '' : ' działki') : '';

  /* galeria */
  var g = $('#gal'), f = o.foto;
  g.className = 'gal n' + Math.min(f.length, 3);
  g.innerHTML = f.slice(0, 3).map(function (p, i) {
    return '<button type="button" data-i="' + i + '" aria-label="Powiększ zdjęcie ' + (i + 1) + ' z ' + f.length + '"><img src="img/oferty/' + p + '" alt="' + esc(o.t) + ', zdjęcie ' + (i + 1) + '"' + (i ? ' loading="lazy"' : '') + '>' +
      (i === 0 && f.length > 1 ? '<span class="gal-all"><svg class="ic" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 15l5-4 4 3 3-2 6 4"/></svg>' + f.length + ' zdjęcia</span>' : '') + '</button>';
  }).join('');

  /* parametry */
  var spec = [['Rodzaj', S.KAT1[o.kat]]];
  if (o.pow) spec.push(['Powierzchnia', S.m2(o.pow)]);
  if (o.dz) spec.push(['Działka', S.dzf(o.dz)]);
  if (o.pok && o.kat !== 'komercyjne') spec.push(['Pokoje', String(o.pok)]);
  if (spec.length < 4 && pm) spec.push(['Cena za m²', S.nf(pm) + ' zł']);
  if (spec.length < 4) spec.push(['Nr oferty', o.id]);
  $('#spec').innerHTML = spec.slice(0, 4).map(function (s) { return '<div><dt>' + s[0] + '</dt><dd>' + s[1] + '</dd></div>'; }).join('');

  /* opis */
  var h = '<h2>Opis nieruchomości</h2>';
  o.opis.forEach(function (b) {
    if (b.h) h += '<h3>' + esc(b.h) + '</h3>';
    else if (b.p) h += '<p>' + esc(b.p) + '</p>';
    else if (b.li) h += '<ul>' + b.li.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
  });
  h += '<p class="note">Nr oferty: ' + o.id + '. W przypadku zakupu nieruchomości z oferty biura obowiązuje wynagrodzenie 3% + VAT. Ogłoszenie ma charakter informacyjny i nie stanowi oferty w rozumieniu art. 66 § 1 Kodeksu cywilnego.</p>';
  $('#opis').innerHTML = h;

  $('#q-msg').value = 'Dzień dobry, proszę o kontakt w sprawie oferty nr ' + o.id + ' (' + o.t + ', ' + o.lok + ').';

  /* podobne */
  var sim = O.filter(function (x) { return x.id !== o.id && x.kat === o.kat; });
  if (sim.length < 3) sim = sim.concat(O.filter(function (x) { return x.id !== o.id && x.kat !== o.kat; }));
  $('#podobne').innerHTML = sim.slice(0, 3).map(function (x) { return S.card(x); }).join('');
  $('#podobne-l').href = 'oferty.html?kat=' + o.kat;
  $('#podobne-l').textContent = 'Wszystkie: ' + S.KAT[o.kat].toLowerCase();

  /* lightbox */
  var lb = $('#lb'), img = lb.querySelector('img'), cnt = lb.querySelector('.lb-c'), cur = 0, last = null;
  function show(i) { cur = (i + f.length) % f.length; img.src = 'img/oferty/' + f[cur]; img.alt = o.t + ', zdjęcie ' + (cur + 1); cnt.textContent = (cur + 1) + ' / ' + f.length; }
  function open(i) { last = document.activeElement; show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; lb.querySelector('.lb-x').focus(); }
  function close() { lb.classList.remove('open'); document.body.style.overflow = ''; if (last) last.focus(); }
  g.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) open(+b.getAttribute('data-i')); });
  lb.querySelector('.lb-x').addEventListener('click', close);
  lb.querySelector('.lb-p').addEventListener('click', function () { show(cur - 1); });
  lb.querySelector('.lb-n').addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  if (f.length < 2) { lb.querySelector('.lb-p').hidden = true; lb.querySelector('.lb-n').hidden = true; }
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1);
  });
  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); sx = null; });
})();
