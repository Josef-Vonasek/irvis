$(function () {
  var parseQueryString = function () {
    var res   = {};
    var query = window.location.search.substring(1);
    query.split("&").forEach(function (p) {
      var pair = p.split("=");
      res[pair[0]] = decodeURIComponent(pair[1]);
    });
    return res;
  };

  var getConfig = function () {
    var cfg = parseQueryString().cfg;
    if (cfg) return JSON.parse(cfg);
  };

  var cfg  = getConfig();

  var graphContainer = $('#network').get(0);

  var ctrl = IRVis.graphController(cfg, graphContainer);
  ctrl.setStep(0, false);
});
