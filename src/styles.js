(function () {
  function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
      s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  function rgbToHex(c) {
    return "#" + componentToHex(c.r) + componentToHex(c.g) + componentToHex(c.b);
  }

  var offset = 0.3;
  var div    = 5;
  var spread = 0.25;
  var csat   = 0.7;
  var cval   = 0.9;

  var nodeFont = { color: '#111111', face: 'monospace', size: 15 };
  var edgeFont = { strokeWidth: 6, strokeColor : '#211f1b', color: '#888888', face: 'monospace', align: 'horizontal', size: 15 };
  var extNodeFont = { strokeWidth: 6, strokeColor : '#211f1b', color: '#888888', face: 'monospace', align: 'horizontal', size: 15 };

  var stylesheet = {
    defedge : { color: '#666666', font: edgeFont, arrows: 'to' },
    defnode : { color: '#888888', font: nodeFont },
    type    : { color: '#ce6564' },
    input1  : { color: '#0aa9b9' },
    redirect: { color: '#664444', dashes: true, physics: false },
    literal : { color: rgbToHex(HSVtoRGB(offset + (1/div)*spread,csat,cval)) },
    value   : { color: rgbToHex(HSVtoRGB(offset + (2/div)*spread,csat,cval)) },
    thunk   : { color: rgbToHex(HSVtoRGB(offset + (3/div)*spread,csat,cval)) },
    phrase  : { color: rgbToHex(HSVtoRGB(offset + (4/div)*spread,csat,cval)) },
    draft   : { color: rgbToHex(HSVtoRGB(offset + (5/div)*spread,csat,cval)) },
    star    : { color: '#ffb800', shape: 'star', size:12, font: extNodeFont }
  };

  function getStylesFor (el, def) {
    var styles = [def].concat(el.styles || []);
    var styleDesc = {};
    styles.forEach(function (style) {
      Object.assign(styleDesc, stylesheet[style.toLowerCase()]);
    });
    if (styleDesc.icon) styleDesc.icon.color = styleDesc.color;
    return styleDesc;
  };

  if (!window.IRVis) window.IRVis = {};
  window.IRVis.getStylesFor = getStylesFor;
})();
