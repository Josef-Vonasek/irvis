$(function () {
  var formatEdge = function (e) {
    var styles = getStylesFor(e, "defEdge");
    styles.color = { color: styles.color, highlight: styles.color };
    return Object.assign({
      id:    e.uid,
      from:  e.src,
      to:    e.tgt,
      label: e.id
    }, styles);
  };

  var formatNode = function (n) {
    var styles = getStylesFor(n, "defNode");
    return Object.assign({
      id: n.uid,
      label: n.name ? n.id + ': ' + n.name : n.id
    }, styles);
  }

  var parseQueryString = function () {
    var res   = {};
    var query = window.location.search.substring(1);
    query.split("&").forEach(function (p) {
      var pair = p.split("=");
      res[pair[0]] = decodeURIComponent(pair[1]);
    });
    return res;
  }

  var getConfig = function () {
    var cfg = parseQueryString().cfg;
    if (cfg) return JSON.parse(cfg);
  }

  var formatWith = function (col, formatter) {
    var res = {};
    for (prop in col) {
      if (col.hasOwnProperty(prop)) {
        res[prop] = formatter(col[prop]);
      }
    }
    return res;
  }

  var cfg  = getConfig();
  var data = { nodes: formatWith(cfg.nodes, formatNode), edges: formatWith(cfg.edges, formatEdge) };
  var relevantNodes = (function () {
    return cfg.steps[0].mkNodes.map(function (el) {
      return data.nodes[el];
    });
  }());
  var relevantEdges = (function () {
    return cfg.steps[0].mkEdges.map(function (el) {
      return data.edges[el];
    });
  }());

  var visdata = { nodes: new vis.DataSet(relevantNodes), edges: new vis.DataSet(relevantEdges) };
  console.log(visdata);

  var container = $("#network").get(0);
  var network = new vis.Network(container, visdata, visOptions);


  console.log(cfg);
});
