(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var main = document.getElementById('book');
  var sheets = Array.prototype.slice.call(document.querySelectorAll('.sheet'));
  var bar = document.getElementById('prog');
  var cnt = document.getElementById('cnt');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = 0;
  function setCount(el) {
    var p = el && el.getAttribute('data-pos');
    if (!cnt) return;
    if (p) { cnt.textContent = p + 'º'; cnt.hidden = false; } else { cnt.hidden = true; }
  }
  if ('IntersectionObserver' in window && !root.classList.contains('pdf')) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          if (e.intersectionRatio > 0.55) { cur = sheets.indexOf(e.target); setCount(e.target); }
        }
      });
    }, { root: main, threshold: [0.05, 0.6] });
    sheets.forEach(function (s) { io.observe(s); });
  } else {
    sheets.forEach(function (s) { s.classList.add('in'); });
  }
  function onScroll() {
    var max = main.scrollHeight - main.clientHeight;
    if (bar && max > 0) bar.style.transform = 'scaleX(' + (main.scrollTop / max).toFixed(4) + ')';
  }
  main.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  function go(i) {
    i = Math.max(0, Math.min(sheets.length - 1, i));
    sheets[i].scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }
  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || k === ' ') { e.preventDefault(); go(cur + 1); }
    else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); go(cur - 1); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(sheets.length - 1); }
  });
})();
