var getStylesFor = window.IRVis.getStylesFor;
var visOptions   = window.IRVis.visOptions;

var formatEdge = e => {
  var styles = getStylesFor(e, "defEdge");
  styles.color = { color: styles.color, highlight: styles.color };
  return {
    id:     e.uid,
    from:   e.src,
    to:     e.tgt,
    label:  e.id + (e.label ? " " + e.label : ""),
    styles: e.styles,
    ...styles};
};

var formatNode = n => {
  var styles = getStylesFor(n, "defNode");
  var res = Object.assign({
    id: n.uid,
    label: (n.name ? n.id + ': ' + n.name : n.id) + (n.label ? " " + n.label : "")
  }, styles);
  return res;
};

var formatWith =(col, formatter) => {
  var res = {};
  for (prop in col) {
    if (col.hasOwnProperty(prop)) {
      res[prop] = formatter(col[prop]);
    }
  }
  return res;
};

var showStarsPredicate = show => n => {
    return (n.shape != "star") || show;
}

var showTypesPredicate = () => e => {
    //return e.styles.indexOf("type") == -1;
    return true;
}

var visDataForStep = (data, steps, stepNumber, opts) => {
  var npred = showStarsPredicate(opts.showStars);
  var epred = showTypesPredicate();
  var res = { nodes: new vis.DataSet([]), edges: new vis.DataSet([]) };
  steps.slice(0, stepNumber + 1).forEach(function (step) {
      step.mkEdges.forEach(e => { if (epred(data.edges[e])) res.edges.add(data.edges[e]); });
      step.rmEdges.forEach(e => { res.edges.remove(e); });
      step.mkNodes.forEach(n => { if (npred(data.nodes[n])) res.nodes.add(data.nodes[n]); });
      step.rmNodes.forEach(n => { res.nodes.remove(n); });
  });
  return res;
};

var init = (cfg, container) => {
  var data = { nodes: formatWith(cfg.nodes, formatNode), edges: formatWith(cfg.edges, formatEdge) };
  console.log(cfg);
  console.log(data);
  var emptyVisdata = { nodes: new vis.DataSet([]), edges: new vis.DataSet([]) };
  var network = new vis.Network(container, emptyVisdata, visOptions);
  var step = 0;
  var opts = {
    showStars: false
  }
  var redraw = () => {
    var visData = visDataForStep(data, cfg.steps, step, opts);
    network.setData(visData);
    network.on("selectNode", console.log);
  }
  var self = {
    setStep: (s) => {
      step = s;
      redraw();
    },
    setOptions: (o) => {
      opts = o;
      console.log(opts);
      redraw();
    }
  };
  return self;
}

if (!window.IRVis) window.IRVis = {};
window.IRVis.graphController = init;

