(function () {
  var getStylesFor = window.IRVis.getStylesFor;
  var visOptions   = window.IRVis.visOptions;

  var formatEdge = function (e, i) {
    var styles = getStylesFor(e, "defEdge");
    styles.color = { color: styles.color, highlight: styles.color };
    return Object.assign({
      id:     i,
      from:   e.src,
      to:     e.dst,
      styles: e.styles
    }, styles);
  };

  var formatNode = function (n) {
    var styles = getStylesFor(n, "defNode");
    var res = Object.assign({
      id: n.id,
      label: (n.label ? n.id + ': ' + n.label : n.id)
    }, styles);
    return res;
  };

  var formatWith = function (col, formatter) {
    return col.map(formatter);
  };

  var showStarsPredicate = function (show) {
    return function (n) {
      return (n.shape != "star") || show;
    }
  }

  var showTypesPredicate = function () {
    return function (e) {
      //return e.styles.indexOf("type") == -1;
      return true;
    }
  }

  var visData = function (data, opts) {
    var npred = showStarsPredicate(opts.showStars);
    var epred = showTypesPredicate();
    var res = { nodes: new vis.DataSet([]), edges: new vis.DataSet([]) };
    data.edges.forEach(function (e) { if (epred(e)) res.edges.add(e); });
    data.nodes.forEach(function (n) { if (npred(n)) res.nodes.add(n); });
    return res;
  };

  var init = function (cfg, container) {
    var data = { nodes: formatWith(cfg.nodes, formatNode), edges: formatWith(cfg.edges, formatEdge) };
    console.log(cfg);
    console.log(data);
    var emptyVisdata = { nodes: new vis.DataSet([]), edges: new vis.DataSet([]) };
    var network = new vis.Network(container, emptyVisdata, visOptions);
    var opts = {
      showStars: false
    }
    var redraw = function () {
      var vis = visData(data, opts);
      network.setData(vis);
      network.on("selectNode", console.log);
    }
    var self = {
      setOptions: function (o) {
        opts = o;
        console.log(opts);
        redraw();
      }
    };
    redraw();
    return self;
  }

  if (!window.IRVis) window.IRVis = {};
  window.IRVis.graphController = init;
})();
