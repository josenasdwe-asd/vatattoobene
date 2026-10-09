/* VATATTOOBENE · detalle 04 — títulos que se tatúan
   Al entrar en vista, los glifos de h1/h2 vibran como aguja de máquina
   y se asientan de izquierda a derecha hasta el texto final. */
(function(){
  "use strict";
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}
  if (reduce) return;

  /* brillo de tinta fresca mientras la aguja trabaja */
  var st = document.createElement('style');
  st.textContent = '.inking{text-shadow:0 0 24px rgba(201,168,76,.30),0 0 8px rgba(201,168,76,.18)}';
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
    var dur = Math.min(1500, Math.max(520, total * 28));
    var t0 = performance.now();
    el.classList.add('inking');
    function frame(now){
      var pos = Math.floor(((now - t0) / dur) * total);
      if (pos >= total){
        nodes.forEach(function(o){ if (o.n.parentNode) o.n.nodeValue = o.txt; });
        el.classList.remove('inking');
        return;
      }
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
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      /* el hero arranca con una pausa dramática; el resto, al vuelo */
      var d = e.target === hero ? 350 : 60;
      setTimeout(function(){ tattoo(e.target); }, d);
    });
  }, { threshold: .4 });

  titles.forEach(function(t){ io.observe(t); });
})();
