/* VATATTOOBENE · detalle 04 — títulos que se tatúan (v2)
   Al entrar en vista, los glifos de h1/h2 vibran como aguja de máquina
   y se asientan de izquierda a derecha hasta el texto final, con destello
   dorado de tinta fresca al terminar. Con "reducir movimiento" activo,
   se tatúan en un solo latido (sin parpadeo). Al cambiar de idioma ES/EN,
   los títulos en pantalla se tatúan de nuevo con el texto nuevo. */
(function(){
  "use strict";
  var calm = false;
  try { calm = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}

  var st = document.createElement('style');
  st.textContent =
    '.inking{text-shadow:0 0 26px rgba(201,168,76,.38),0 0 9px rgba(201,168,76,.22)}' +
    '@keyframes inksettle{0%{text-shadow:0 0 26px rgba(201,168,76,.55),0 0 10px rgba(201,168,76,.35)}100%{text-shadow:0 0 0 rgba(201,168,76,0)}}' +
    '.inked{animation:inksettle 1.2s ease-out both}';
  document.head.appendChild(st);

  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·:×—/\\|';
  var titles = [].slice.call(document.querySelectorAll('h1, h2'));
  var hero = document.querySelector('header.hero h1');
  if (!titles.length) return;

  function tattoo(el){
    if (el.dataset.inked) return;
    el.dataset.inked = '1';
    /* nodos de texto solamente: los <em> conservan su cursiva y color */
    var nodes = [], total = 0;
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    while (w.nextNode()){
      var n = w.currentNode;
      var tag = n.parentNode.nodeName;
      if (tag === 'SCRIPT' || tag === 'STYLE') continue;
      if (!n.nodeValue || !/\S/.test(n.nodeValue)) continue;
      nodes.push({ n: n, txt: n.nodeValue, at: total });
      total += n.nodeValue.length;
    }
    if (!total) return;

    function settle(){
      nodes.forEach(function(o){ if (o.n.parentNode) o.n.nodeValue = o.txt; });
      el.classList.remove('inking');
      el.classList.add('inked'); /* destello de tinta fresca */
      setTimeout(function(){ el.classList.remove('inked'); }, 1400);
    }
    function scramble(pos){
      nodes.forEach(function(o){
        if (!o.n.parentNode) return; /* setLang pudo reemplazar el texto */
        var out = '', k, ch;
        for (k = 0; k < o.txt.length; k++){
          ch = o.txt.charAt(k);
          if (o.at + k < pos || !/\S/.test(ch)) out += ch;
          else out += GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
        }
        o.n.nodeValue = out;
      });
    }

    if (calm){ /* movimiento reducido: un latido de tinta, sin parpadeo */
      scramble(0);
      el.classList.add('inking');
      setTimeout(settle, 320);
      return;
    }

    var dur = Math.min(1600, Math.max(650, total * 34));
    var t0 = performance.now();
    el.classList.add('inking');
    (function frame(now){
      var pos = Math.floor(((now - t0) / dur) * total);
      if (pos >= total){ settle(); return; }
      scramble(pos);
      requestAnimationFrame(frame);
    })(t0);
  }

  function inViewport(el){
    var r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < innerHeight;
  }

  function init(){
    if (!('IntersectionObserver' in window)){ titles.forEach(tattoo); return; }
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        /* el hero arranca con una pausa dramática; el resto, al vuelo */
        var d = e.target === hero ? 250 : 60;
        setTimeout(function(){ tattoo(e.target); }, d);
      });
    }, { threshold: .4 });
    titles.forEach(function(t){ io.observe(t); });
  }
  init();

  /* cambiar idioma re-tatúa los títulos en pantalla con el texto nuevo */
  if (typeof window.setLang === 'function'){
    var origLang = window.setLang;
    window.setLang = function(l){
      origLang(l);
      titles.forEach(function(t){ t.removeAttribute('data-inked'); });
      titles.forEach(function(t){ if (inViewport(t)) tattoo(t); });
    };
  }
})();
