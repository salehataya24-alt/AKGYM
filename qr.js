/* عارض QR محلي لبطاقة المشترك — يعمل بدون إنترنت. يعتمد على مكتبة qrcode.js (window.qrcode).
   الاستدعاء: AKQR('#element', 'text', { cell, margin })  — وتمرير نص فارغ يمسح الرمز. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';

  function build(text, cell, margin) {
    var lib = window.qrcode;
    if (typeof lib !== 'function') throw new Error('qrcode library not loaded');
    var qr = lib(0, 'M');
    qr.addData(String(text));
    qr.make();
    var n = qr.getModuleCount();
    cell = cell || 4;
    margin = margin == null ? 2 : margin;
    var size = (n + margin * 2) * cell;
    return { qr: qr, n: n, cell: cell, margin: margin, size: size };
  }

  window.AKQR = function (target, text, options) {
    options = options || {};
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    var svg = el.tagName && el.tagName.toLowerCase() === 'svg' ? el : (el.querySelector && el.querySelector('svg')) || el;
    if (!svg || !svg.setAttribute) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    text = text == null ? '' : String(text);
    if (!text) {
      svg.setAttribute('viewBox', '0 0 1 1');
      svg.setAttribute('width', '1');
      svg.setAttribute('height', '1');
      return;
    }

    var info = build(text, options.cell, options.margin);
    var n = info.n, cell = info.cell, margin = info.margin, size = info.size;

    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    var bg = document.createElementNS(NS, 'rect');
    bg.setAttribute('width', size);
    bg.setAttribute('height', size);
    bg.setAttribute('fill', options.background || '#ffffff');
    svg.appendChild(bg);

    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (info.qr.isDark(r, c)) {
          var rect = document.createElementNS(NS, 'rect');
          rect.setAttribute('x', (c + margin) * cell);
          rect.setAttribute('y', (r + margin) * cell);
          rect.setAttribute('width', cell);
          rect.setAttribute('height', cell);
          rect.setAttribute('fill', options.color || '#000000');
          svg.appendChild(rect);
        }
      }
    }
  };
})();
