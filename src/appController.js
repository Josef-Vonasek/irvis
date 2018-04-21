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
    var cfgFile = parseQueryString().cfgPath;
    var req = new XMLHttpRequest();
    req.open('GET', '/' + cfgFile + '.json', false);
    req.send(null);
    var cfg = JSON.parse(req.responseText);
    return cfg
  };

  var cfg = getConfig() || IRVis.sampleConfig;
  window.cfg = cfg

  var graphContainer = $('#network').get(0);
  var stepControls   = $('#step-controls');
  var optsControls   = $('#options-controls');

  var graphCtrl   = IRVis.graphController(cfg, graphContainer);
  var stepCtrl    = IRVis.stepController(stepControls, cfg.steps, graphCtrl);
  var optionsCtrl = IRVis.optionsController(optsControls, graphCtrl);
});
