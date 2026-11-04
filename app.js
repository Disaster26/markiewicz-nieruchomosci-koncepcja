(function () {
  'use strict';
  var O = window.OFERTY || [];
  var KAT = { dom: 'Domy', mieszkanie: 'Mieszkania', dzialka: 'Działki', komercyjne: 'Komercyjne' };
  var KAT1 = { dom: 'Dom', mieszkanie: 'Mieszkanie', dzialka: 'Działka', komercyjne: 'Nieruchomość komercyjna' };
  var IC = {
    pin: '<svg class="ic" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    area: '<svg class="ic" viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    plot: '<svg class="ic" viewBox="0 0 24 24"><path d="M3 18l5-12 8 3 5 9z"/><path d="M8 6l1 12M16 9l-4 9"/></svg>',
    room: '<svg class="ic" viewBox="0 0 24 24"><path d="M5 21V4h11v17M3 21h18"/><circle cx="12.5" cy="12.5" r=".6"/></svg>'
  };
  var nf = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
  var m2 = function (v) { return (Number.isInteger(v) ? nf(v) : String(v).replace('.', ',')) + ' m²'; };
  var dzf = function (v) { return v >= 10000 ? (v / 10000).toFixed(2).replace('.', ',') + ' ha' : m2(v); };
  var pok = function (n) { return n + (n === 1 ? ' pokój' : (n < 5 ? ' pokoje' : ' pokoi')); };
  var cena = function (o) { return nf(o.cena) + ' zł' + (o.dop ? '<small>' + o.dop + '</small>' : ''); };
  function params(o) {
    var p = [];
    if (o.pow) p.push('<span>' + IC.area + m2(o.pow) + '</span>');
    if (o.dz) p.push('<span>' + IC.plot + (o.pow ? 'działka ' : '') + dzf(o.dz) + '</span>');
    if (o.pok && o.kat !== 'komercyjne') p.push('<span>' + IC.room + pok(o.pok) + '</span>');
    return p.join('');
  }
  var ARR = function (d) { return '<svg class="ic" viewBox="0 0 24 24"><path d="' + (d < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7') + '"/></svg>'; };
  function card(o, eager) {
    var href = 'oferta.html?id=' + o.id, n = o.foto.length;
    var slides = o.foto.map(function (f, i) {
      return '<img src="img/o/' + f + 'k.webp" alt="' + (i ? '' : o.t + ' - ' + o.lok) + '" width="960" height="640" draggable="false"' + (eager && i === 0 ? '' : ' loading="lazy"') + (i ? ' decoding="async"' : '') + '>';
    }).join('');
    var dots = n > 1 ? '<div class="car-dots" aria-hidden="true">' + o.foto.map(function (f, i) { return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('') + '</div>' : '';
    var nav = n > 1 ? '<button type="button" class="car-b car-p" aria-label="Poprzednie zdjęcie" tabindex="-1">' + ARR(-1) + '</button><button type="button" class="car-b car-n" aria-label="Następne zdjęcie" tabindex="-1">' + ARR(1) + '</button>' : '';
    return '<article class="card">' +
      '<div class="car" data-n="' + n + '"><a class="car-t" href="' + href + '" aria-label="' + o.t + ', ' + o.lok + '">' + slides + '</a>' + nav + dots +
      (o.st ? '<span class="badge">' + o.st + '</span>' : '') + (n > 1 ? '<span class="car-c" aria-hidden="true">1 / ' + n + '</span>' : '') + '</div>' +
      '<a class="card-b" href="' + href + '"><p class="card-loc">' + IC.pin + o.lok + '</p><h3>' + o.t + '</h3>' +
      '<p class="params">' + params(o) + '</p><p class="price">' + cena(o) + '</p></a></article>';
  }

  /* karuzele zdjęć na kartach: swipe, przeciąganie myszą, strzałki, kropki, powolny autoplay */
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cars = [], io = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
    en.forEach(function (e) { e.target._vis = e.isIntersecting; });
  }, { threshold: .6 }) : null;
  function initCars(root) {
    (root || document).querySelectorAll('.car:not([data-on])').forEach(function (c, ci) {
      c.setAttribute('data-on', '1');
      var t = c.querySelector('.car-t'), n = +c.getAttribute('data-n');
      if (n < 2) return;
      var dots = c.querySelectorAll('.car-dots i'), cnt = c.querySelector('.car-c'), cur = 0, raf = 0;
      var w = function () { return t.clientWidth || 1; };
      var go = function (i, smooth) { cur = (i + n) % n; t.scrollTo({ left: cur * w(), behavior: smooth === false ? 'auto' : 'smooth' }); };
      var sync = function () {
        raf = 0; var i = Math.round(t.scrollLeft / w());
        if (i !== c._i) { c._i = i; cur = i; dots.forEach(function (d, k) { d.className = k === i ? 'on' : ''; }); if (cnt) cnt.textContent = (i + 1) + ' / ' + n; }
      };
      t.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(sync); }, { passive: true });
      c.querySelector('.car-p').addEventListener('click', function () { c._hold = Date.now(); go(cur - 1); });
      c.querySelector('.car-n').addEventListener('click', function () { c._hold = Date.now(); go(cur + 1); });
      c.addEventListener('mouseenter', function () { c._hover = true; });
      c.addEventListener('mouseleave', function () { c._hover = false; });
      t.addEventListener('touchstart', function () { c._hold = Date.now() + 6000; }, { passive: true });
      /* przeciąganie myszą; kliknięcie bez ruchu otwiera ofertę */
      var sx = 0, sl = 0, drag = false, moved = false;
      t.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        drag = true; moved = false; sx = e.clientX; sl = t.scrollLeft; t.classList.add('drag');
      });
      window.addEventListener('pointermove', function (e) {
        if (!drag) return; var dx = e.clientX - sx;
        if (Math.abs(dx) > 5) moved = true;
        if (moved) t.scrollLeft = sl - dx;
      });
      window.addEventListener('pointerup', function (e) {
        if (!drag) return; drag = false;
        if (moved) { c._hold = Date.now(); var dx = e.clientX - sx; var base = Math.round(sl / w()); go(Math.abs(dx) > w() * .15 ? base + (dx < 0 ? 1 : -1) : base); setTimeout(function () { t.classList.remove('drag'); }, 500); }
        else t.classList.remove('drag');
      });
      t.addEventListener('dragstart', function (e) { e.preventDefault(); });
      t.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } });
      c._step = function () { go(cur + 1 >= n ? 0 : cur + 1); };
      c._t0 = ci * 700;
      if (io) io.observe(c); else c._vis = true;
      cars.push(c);
    });
  }
  if (!RM) setInterval(function () {
    if (document.hidden) return;
    var now = Date.now();
    cars.forEach(function (c) {
      if (!c.isConnected || !c._vis || c._hover || (c._hold && now - c._hold < 6000)) return;
      if (!c._next) c._next = now + 2500 + c._t0;
      if (now >= c._next) { c._step(); c._next = now + 4200; }
    });
  }, 250);
  window.SMN = { card: card, initCars: initCars, params: params, cena: cena, m2: m2, dzf: dzf, pok: pok, KAT: KAT, KAT1: KAT1, IC: IC, nf: nf };

  /* nagłówek, menu */
  var top = document.querySelector('.top');
  var onScroll = function () { if (top) top.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var burger = document.getElementById('burger'), mnav = document.getElementById('mnav');
  if (burger && mnav) {
    var setMenu = function (open) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      mnav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  }

  /* dolny pasek: dopiero po przewinięciu za przyciski z pierwszego ekranu */
  var bar = document.querySelector('.mob'), anchor = document.querySelector('[data-bar-anchor]');
  if (bar && anchor && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      var e = en[0];
      bar.classList.toggle('widac', !e.isIntersecting && e.boundingClientRect.top < 0);
    }).observe(anchor);
  }

  /* cel w formularzu kontaktowym z linków (#kontakt + data-cel) */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-cel]');
    if (!a) return;
    var r = document.querySelector('.goals input[value="' + a.getAttribute('data-cel') + '"]');
    if (r) r.checked = true;
  });
  var hc = location.hash.match(/^#kontakt-(\w+)/);
  if (hc) {
    var r0 = document.querySelector('.goals input[value="' + hc[1] + '"]');
    if (r0) r0.checked = true;
    var k = document.getElementById('kontakt'); if (k) setTimeout(function () { k.scrollIntoView(); }, 50);
  }

  /* formularze: podgląd, bez wysyłki */
  document.querySelectorAll('form[data-preview]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = f.querySelector('.ok');
      if (ok) { ok.classList.add('show'); ok.focus && ok.focus(); }
    });
  });

  /* lista ofert (strona główna i podstrona) */
  var box = document.getElementById('lista');
  if (box) {
    var limit = parseInt(box.getAttribute('data-limit') || '0', 10);
    var q = new URLSearchParams(location.search);
    var st = { typ: q.get('typ') === 'wynajem' ? 'wynajem' : 'sprzedaz', kat: KAT[q.get('kat')] ? q.get('kat') : '', m: q.get('m') || '', sort: q.get('sort') || 'nowe' };
    var tabs = document.querySelectorAll('[data-typ]'), cats = document.getElementById('cats');
    var selM = document.getElementById('f-m'), selS = document.getElementById('f-sort');
    var empty = document.getElementById('pusto'), cnt = document.getElementById('licznik'), more = document.getElementById('wiecej');
    var ofTyp = function () { return O.filter(function (o) { return o.typ === st.typ; }); };
    tabs.forEach(function (b) {
      var n = O.filter(function (o) { return o.typ === b.getAttribute('data-typ'); }).length;
      b.querySelector('.n').textContent = n ? String(n) : '';
      if (!n) b.classList.add('zero');
      b.addEventListener('click', function () { st.typ = b.getAttribute('data-typ'); st.kat = ''; st.m = ''; render(true); });
    });
    if (selM) {
      var towns = {};
      O.forEach(function (o) { towns[o.m] = (towns[o.m] || 0) + 1; });
      Object.keys(towns).sort(function (a, b) { return a.localeCompare(b, 'pl'); }).forEach(function (t) {
        var op = document.createElement('option'); op.value = t; op.textContent = t + ' (' + towns[t] + ')'; selM.appendChild(op);
      });
      selM.addEventListener('change', function () { st.m = selM.value; render(true); });
    }
    if (selS) selS.addEventListener('change', function () { st.sort = selS.value; render(true); });
    function drawCats() {
      if (!cats) return;
      var base = ofTyp().filter(function (o) { return !st.m || o.m === st.m; });
      var h = '<button type="button" data-k="" aria-pressed="' + (!st.kat) + '">Wszystkie<span class="n">' + base.length + '</span></button>';
      Object.keys(KAT).forEach(function (k) {
        var n = base.filter(function (o) { return o.kat === k; }).length;
        h += '<button type="button" data-k="' + k + '" aria-pressed="' + (st.kat === k) + '">' + KAT[k] + '<span class="n">' + n + '</span></button>';
      });
      cats.innerHTML = h;
    }
    if (cats) cats.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; st.kat = b.getAttribute('data-k'); render(true);
    });
    function render(push) {
      tabs.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-typ') === st.typ)); });
      if (selM) selM.value = st.m; if (selS) selS.value = st.sort;
      drawCats();
      var list = ofTyp().filter(function (o) { return (!st.kat || o.kat === st.kat) && (!st.m || o.m === st.m); });
      if (st.sort === 'tanio') list.sort(function (a, b) { return a.cena - b.cena; });
      if (st.sort === 'drogo') list.sort(function (a, b) { return b.cena - a.cena; });
      var total = list.length;
      if (limit) {
        var pick = box.getAttribute('data-pick');
        if (pick && !st.kat && !st.m && st.typ === 'sprzedaz') {
          var ids = pick.split(','); list = ids.map(function (id) { return O.find(function (o) { return o.id === id; }); }).filter(Boolean);
        }
        list = list.slice(0, limit);
      }
      box.innerHTML = list.map(function (o, i) { return card(o, i < 3); }).join('');
      initCars(box);
      var none = ofTyp().length === 0;
      if (empty) empty.hidden = !none;
      box.hidden = none;
      if (cats) cats.hidden = none;
      var fl = document.getElementById('filtry'); if (fl) fl.hidden = none;
      if (cnt) cnt.textContent = none ? '' : (total === 1 ? '1 oferta' : total + (total % 10 >= 2 && total % 10 <= 4 && (total % 100 < 10 || total % 100 >= 20) ? ' oferty' : ' ofert'));
      if (more) {
        more.hidden = none;
        var a = more.querySelector('a'); var p = new URLSearchParams();
        if (st.kat) p.set('kat', st.kat);
        a.href = 'oferty.html' + (p.toString() ? '?' + p : '');
        a.textContent = st.kat ? 'Wszystkie: ' + KAT[st.kat].toLowerCase() + ' (' + total + ')' : 'Wszystkie oferty (' + total + ')';
      }
      if (push && !limit && history.replaceState) {
        var u = new URLSearchParams();
        if (st.typ !== 'sprzedaz') u.set('typ', st.typ); if (st.kat) u.set('kat', st.kat); if (st.m) u.set('m', st.m); if (st.sort !== 'nowe') u.set('sort', st.sort);
        history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : ''));
      }
    }
    render(false);
  }
})();
