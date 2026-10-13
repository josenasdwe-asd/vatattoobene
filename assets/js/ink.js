/* VATATTOOBENE · detalle 04 — títulos que se tatúan (v4)
   La aguja traza el título de un pase rápido: cada letra aparece con
   destello dorado y se asienta. El trazo completo dura menos de medio
   segundo, así que nunca demora la lectura. Con "reducir movimiento",
   la tinta aparece en desvanecido escalonado, sin destello. */
(function(){
  "use strict";
  var calm = false;
  try { calm = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}

  var st = document.createElement('style');
  st.textContent =
    '.ink-ch{opacity:0;transition:opacity .15s ease,color .22s ease,text-shadow .4s ease}' +
    '.ink-on{opacity:1}' +
    '.ink-now{color:var(--gold,#c9a84c);text-shadow:0 0 12px rgba(201,168,76,.7)}' +
    '.inking{text-shadow:0 0 18px rgba(201,168,76,.25)}' +
    '@keyframes inksettle{0%{text-shadow:0 0 18px rgba(201,168,76,.4),0 0 8px rgba(201,168,76,.25)}100%{text-shadow:0 0 0 rgba(201,168,76,0)}}' +
    '.inked{animation:inksettle .55s ease-out both}';
  document.head.appendChild(st);

  var titles = [].slice.call(document.querySelectorAll('h1, h2'));
  var hero = document.querySelector('header.hero h1');
  if (!titles.length) return;

  function tattoo(el){
    if (el.dataset.inked || el.dataset.inking) return;
    el.dataset.inked = '1';
    el.dataset.inking = '1';

    /* reparte los caracteres en spans; los <em> conservan su estilo y los espacios quedan como texto */
    var chars = [];
    var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var targets = [];
    while (w.nextNode()){
      var n = w.currentNode;
      var tag = n.parentNode.nodeName;
      if (tag === 'SCRIPT' || tag === 'STYLE') continue;
      if (!n.nodeValue || !/\S/.test(n.nodeValue)) continue;
      targets.push(n);
    }
    targets.forEach(function(n){
      var frag = document.createDocumentFragment();
      var buf = '', txt = n.nodeValue, i, c;
      for (i = 0; i < txt.length; i++){
        c = txt.charAt(i);
        if (/\s/.test(c)){ buf += c; continue; }
        if (buf){ frag.appendChild(document.createTextNode(buf)); buf = ''; }
        var sp = document.createElement('span');
        sp.className = 'ink-ch';
        sp.textContent = c;
        frag.appendChild(sp);
        chars.push({ sp: sp, ch: c });
      }
      if (buf) frag.appendChild(document.createTextNode(buf));
      n.parentNode.replaceChild(frag, n);
    });
    if (!chars.length){ delete el.dataset.inking; return; }

    function revealAll(){
      chars.forEach(function(o){
        if (o.sp.isConnected){ o.sp.classList.add('ink-on'); o.sp.classList.remove('ink-now'); }
      });
    }
    function finish(){
      revealAll();
      el.classList.remove('inking');
      el.classList.add('inked'); /* destello de tinta fresca sobre el título completo */
      setTimeout(function(){ el.classList.remove('inked'); }, 700);
      delete el.dataset.inking;
    }

    el.classList.add('inking');

    if (calm){ /* reducir movimiento: desvanecido escalonado, sin destello */
      chars.forEach(function(o, k){
        setTimeout(function(){ if (o.sp.isConnected) o.sp.classList.add('ink-on'); }, Math.min(k * 18, 360));
      });
      setTimeout(finish, 640);
      return;
    }

    /* pase rápido de la aguja: el título completo queda tatuado en ≤ ~0.5 s */
    var step = Math.max(12, Math.min(40, 460 / chars.length));
    chars.forEach(function(o, k){
      setTimeout(function(){
        if (!o.sp.isConnected) return; /* setLang pudo reemplazar el texto */
        o.sp.classList.add('ink-on', 'ink-now'); /* aparece dorada, bajo la aguja */
        setTimeout(function(){ if (o.sp.isConnected) o.sp.classList.remove('ink-now'); }, 150);
      }, k * step);
    });
    /* red de seguridad: aunque algo falle, el título queda visible */
    setTimeout(finish, chars.length * step + 300);
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
        var d = e.target === hero ? 100 : 20;
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
      titles.forEach(function(t){ t.removeAttribute('data-inked'); t.removeAttribute('data-inking'); });
      titles.forEach(function(t){ if (inViewport(t)) tattoo(t); });
    };
  }
})();
