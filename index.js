$(function () {
    function getQueryVariable(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
          return decodeURIComponent(pair[1])
        }
      }
    }

    function getQueryJSON(v) {
      var s = getQueryVariable(v);
      if (s) return JSON.parse(s);
    }







    function getParam (p, def) {
        var v = getQueryJSON(p);
        if (v == undefined) return def
        else                return v
    }

    cfg = getQueryJSON("cfg");
    console.log(cfg);
    if (cfg != undefined) {
        nodes = cfg.nodes;
        edges = cfg.edges;
        steps = cfg.steps;
    }

    // console.log (edges);
    // console.log (steps);
    // nodes = getParam("nodes", nodes);
    // edges = getParam("edges", edges);
    // steps = getParam("steps", steps);

    // console.log(getQueryJSON("steps"));
    // console.log(steps);

// { desc:    "initial"
// , mkNodes: [1,2,3,4]
// , mkEdges: [1,2,3,4]
// , rmNodes: []
// , rmEdges: []

	var layouts = {}

	preprocessNodes (nodes);
	preprocessEdges (edges);

	var step = 0;

	var nodeDS = new vis.DataSet(nodesByIds(steps[0].mkNodes));
	var edgeDS = new vis.DataSet(edgesByIds(steps[0].mkEdges));

	var container = document.getElementById('mynetwork');
	var highlightActive = false;
	var selectedNodes   = [];

	var data = {
		nodes: nodeDS,
		edges: edgeDS
	};


	var options = { interaction: { multiselect: true
								 }
				  , layout:  { randomSeed: 0
                             , hierarchical: { direction: "DU"
                                             , sortMethod: "directed"
                                             }
                             }
				  , nodes:   { shape: 'box'
							 , borderWidth: 0
							 , shadow: { enabled: true
									   , color  : '#211f1b'
									   , x      : 0
									   , y      : 0
									   , size   : 10
									   }
							 }
				  , edges:   { smooth: false
							 , width: 2.0
							 }
				  , physics : {}
				  , physics: { barnesHut: { gravitationalConstant: -30000
										  , centralGravity       : 0
										  , springLength         : 100
										  , springConstant       : 0.9
										  , damping              : 4.0
										  , avoidOverlap         : 0.4
										  }
							 , hierarchicalRepulsion: { centralGravity : 1
													  , springLength   : 0
													  , springConstant : 4
													  , nodeDistance   : 300
													  , damping        : 4
													  }
							 , minVelocity: 0.75
							 , maxVelocity: 5
							 , timestep:    0.5
							 , solver:      'hierarchicalRepulsion'
							 }
				   }


	var stepNum = Object.keys(steps).length - 1;

	stepSelector.max = stepNum;

	// initialize your network!
	var network = new vis.Network(container, data, options);
	network.on("click", neighbourhoodHighlightHandler);
	network.on("dragEnd", function (params) { saveLayout(); });

	init();




	var layouting = false;

	maxSteps = 100;


	function sleepFor( sleepDuration ){
		var now = new Date().getTime();
		while(new Date().getTime() < now + sleepDuration){ /* do nothing */ }
	}

	function initStep(params) {
		saveLayout ();
		if (step < stepNum){
			nextStepCore();
			network.once("stabilizationIterationsDone", initStep);
			var stepnum = Number(stabilizationSteps.value);
			if (stepnum == 0) stepnum = 1000;
			network.stabilize(stepnum);
		} else {
			selectStep(0);
		}
	}

	function initLayouts(){
		network.once("stabilizationIterationsDone", initStep);
		network.stabilize(100);
	}

	initLayouts()

	function stepx(i){ return function (timestamp) {
		var allNodes = nodeDS.get({returnType:"Object"});
		var allEdges = edgeDS.get({returnType:"Object"});
		var ready    = true;
		for (id in allNodes) {
			var node = allNodes [id];
			if (! node.layouted) {
				var spring     = 0.1;
				var maxVel     = 20;
				var minVel     = 1;
				var dragCoeff  = 0.05;
				var frictCoeff = 0.25;

				var pos  = network.getPositions([node.id])[node.id]
				var dst  = layouts[step][id];
				var vec  = {x: dst.x - pos.x, y: dst.y - pos.y};

				var drag  = { x: Math.sign(node.vel.x) * node.vel.x * node.vel.x * dragCoeff
							, y: Math.sign(node.vel.y) * node.vel.y * node.vel.y * dragCoeff
							};
				var frict = {x: node.vel.x * frictCoeff, y: node.vel.y * frictCoeff};
				var acc   = {x: vec.x * spring - drag.x - frict.x, y: vec.y * spring - drag.y - frict.y};


				node.vel.x += acc.x;
				node.vel.y += acc.y;


				if      (node.vel.x >  maxVel) node.vel.x =  maxVel;
				else if (node.vel.x < -maxVel) node.vel.x = -maxVel;
				if      (node.vel.y >  maxVel) node.vel.y =  maxVel;
				else if (node.vel.y < -maxVel) node.vel.y = -maxVel;

				network.moveNode(node.id, pos.x + node.vel.x, pos.y + node.vel.y)


				if (  ((node.vel.x < minVel) && (node.vel.x > (-minVel)))
				   && ((node.vel.y < minVel) && (node.vel.y > (-minVel)))) {
				   node.layouted = true;
			   } else {
				   ready = false;
			   }
		   }
	   }


	   bulkUpdate(allNodes, allEdges);

	   if (ready || i > maxSteps) {
		   for (id in allNodes) {
			   var node = allNodes [id];
			   var dst  = layouts[step][id];
			   network.moveNode(node.id, dst.x, dst.y)
		   }
		   enablePhysics();
		   layouting = false;
	   } else {
		   window.requestAnimationFrame(stepx(i+1));
	   }
   }}

	//

	function currentLayout(){
		return layouts[step];
	}

	function initLayout() {
		if (! currentLayout()) {
			network.stabilize();
			saveLayout ();
		}
	}

	var postStabilization = [];

	function enablePhysics() {
		options.physics.enabled = true;
		network.setOptions(options);
	}

	function disablePhysics() {
		options.physics.enabled = false;
		network.setOptions(options);
	}

	function saveLayout() {
		var allNodes = nodeDS.get({returnType:"Object"});
		for (id in allNodes) {
			var node = allNodes[id];
			var pos  = network.getPositions([node.id])[node.id]
			if(!layouts[step]) layouts[step] = {};
			layouts[step][id] = pos;
		}
	}


	function layoutNodes() {
		if (step in layouts) {
				disablePhysics ();

				var allNodes = nodeDS.get({returnType:"Object"});
				var allEdges = edgeDS.get({returnType:"Object"});
				for (id in allNodes) {
					var node = allNodes [id];
					node.layouted = false;
				}
				bulkUpdate(allNodes, allEdges);

			if (!layouting) {
				layouting = true;
				window.requestAnimationFrame(stepx(0));
			}
		}
	}


	// === Pre-processing & styling ===

	function preprocessNodes (){
		var nodeReg = {}
		for (var idx in nodes){
			var node  = nodes[idx];
			node.idx  = node.id;
			node.uidx = node.uid;
			node.id   = node.uid; // needed by visjs
			node.vel  = {x:0, y:0};
			nodeReg [node.uid] = node;
			resetNode(node);
		}
		nodes = nodeReg;
	}

	function preprocessEdges (){
		var edgeReg = {}
		for (var idx in edges){
			var edge  = edges[idx];
			edge.idx  = edge.id;
			edge.uidx = edge.uid;
			edge.id   = edge.uid; // needed by visjs
            edge.from = edge.src;
            edge.to   = edge.tgt;
			edgeReg [edge.uid] = edge;
			resetEdge (edge);
		}
		edges = edgeReg;
	}

// function preprocessNodes (){
//     for (var id in nodes){
//         var node    = nodes[id];
//         node.id     = id;
//         node.vel    = {x: 0, y: 0};
//         resetNode(node);
//     }
// }
//
// function preprocessEdges (){
//     for (var id in edges){
//         var edge    = edges[id];
//         edge.id     = id;
//         resetEdge (edge);
//     }
// }


	function resetNode(node){
		node.label = node.idx;
		if (node.name) node.label += ': ' + node.name;
		appStyles(node, 'defNode');
	}

	function resetEdge (edge){
		edge.label  = edge.idx;
		appStyles(edge, 'defEdge');
		edge.color = { color    : edge.color
					 , highlight: edge.color
					 };
	}

	function appStyles(el, def) {
		var styles   = getStyles();
        var elStyles = [def]
        if (el.styles) elStyles = elStyles.concat(el.styles)
		for (var styleID in elStyles){
            // console.log(">>>")
            // console.log(elStyles)
			var style = elStyles[styleID].toLowerCase();
			merge(el, styles[style]);
		}
		if (el.icon) el.icon.color = el.color;
	}


	// === Physics control ===

	function changeNodeDistance(d){
		var dd = Number(d);
		options.physics.hierarchicalRepulsion.nodeDistance = dd;
		network.setOptions(options);
	}

	function nodesByIds (ids) {
		var ns = [];
		for (var i in ids){
			var id = ids[i];
			var node = nodes[id];
			resetNode(node);
			ns.push(node);
		}
		return ns;
	}

	function edgesByIds (ids) {
		var ns = []
		for (var i in ids){
			var id = ids[i];
			ns.push(edges[id]);
		}
		return ns;
	}

	function updateDescs() {
		for (var step in steps) {
			var opt = document.createElement('option');
			opt.value = step;
			opt.innerHTML = steps[step].name;
			stepDesc.appendChild(opt);
		}
	}

	function selectStep(s) {
		while(step < s) nextStep();
		while(step > s) prevStep();
	}

	function init(){
		setStep(0);
		updateDescs();
	}

	function setStep(s){
		step = s;
		stepDesc.value     = s;
		stepDisplay.value  = s;
		if (stepSelector.MaterialSlider) stepSelector.MaterialSlider.change(s);
	}

	function incStep() {
		if (step < stepNum) setStep(step + 1);
	}

	function decStep() {
		if (step > 0) setStep(step - 1);
	}

	function nextStep() {
		if (step < stepNum) {
			nextStepCore();
			neighbourhoodHighlight();
			layoutNodes();
		}
	}

	function nextStepCore() {
		if (step < stepNum) {
			incStep();
			desc = steps [step];

			var els = nodesByIds(desc.rmNodes);
			for (var i in els) {
				var el = els[i];
				nodeDS.remove({id: el.id});
			}

			var els = edgesByIds(desc.rmEdges);
			for (var i in els) {
				var el = els[i];
				edgeDS.remove({id: el.id});
			}

			var ns = nodesByIds(desc.mkNodes);
			var es = edgesByIds(desc.mkEdges);

			for (var i in ns) {
				var n = ns[i];
				var neighbors = findNeighbors (n, es);
				nodeDS.add(centered (n, neighbors));
			}

			for (var i in es) {
				var el = es[i];
				edgeDS.add(el);
			}
		}
	}

	function findNeighbors (n, es){
		var neighbors = []
		for (var eid in es){
			var e = es[eid];
			if (e.src == n.id) neighbors.push(e.tgt)
			if (e.tgt == n.id) neighbors.push(e.src)
		}
		return neighbors
	}

	function prevStep() {
		if (step > 0) {
			desc = steps [step];

			var els = nodesByIds(desc.mkNodes);
			for (var i in els) {
				var el = els[i];
				nodeDS.remove({id: el.id});
			}

			var els = edgesByIds(desc.mkEdges);
			for (var i in els) {
				var el = els[i];
				edgeDS.remove({id: el.id});
			}

			var ns = nodesByIds(desc.rmNodes);
			var es = edgesByIds(desc.rmEdges);

			for (var i in ns) {
				var n = ns[i];
				var neighbors = findNeighbors (n, es);
				nodeDS.add(centered (n, neighbors));
			}

			for (var i in es) {
				var el = es[i];
				edgeDS.add(el);
			}

			decStep();
			neighbourhoodHighlight();
			layoutNodes();

		}
	}

	function merge(a,b) {
		for (var attr in b) { a[attr] = b[attr]; }
		return a;
	}

	function centered(obj, ids){
		return merge (obj, middle(ids));
	}

	function middle(ids){
		var ps  = network.getPositions(ids);
		var num = 0;
		var x   = 0;
		var y   = 0;
		for (var id in ps) {
			num += 1;
			var node = ps[id];
			x += node.x;
			y += node.y;
		}
		if (num > 0){
			x /= num;
			y /= num;
		}
		return {x: x, y: y};
	}

	function neighbourhoodHighlightHandler (params) {
		selectedNodes = params.nodes;
		neighbourhoodHighlight();
	}

	function neighbourhoodHighlight() {
		var allNodes = nodeDS.get({returnType:"Object"});
		var allEdges = edgeDS.get({returnType:"Object"});

		var allNodeIds     = [];
		for (var id in allNodes) allNodeIds.push(allNodes[id].id);

		var visibleSelectedNodes = [];
		for (var id in selectedNodes) if (allNodeIds.indexOf(selectedNodes[id]) != -1) visibleSelectedNodes.push(selectedNodes[id]);

		if (highlightActive === true) {
		  for (var id in allNodes) resetNode(allNodes[id]);
		  for (var id in allEdges) resetEdge(allEdges[id]);

		  highlightActive = false;
		  bulkUpdate(allNodes, allEdges);
		}

    var highlightEnabled = $("#toggle-highlight").is(":checked");
		if (selectedNodes.length > 0 && highlightEnabled) {
		  highlightActive = true;
		  var i,j;
		  var selectedNode = visibleSelectedNodes[0];

		  // mark everything hard to read
		  for (var id in allNodes) {
			  var el = allNodes[id];
			  el.color = '#666';
			  if (el.icon){
				  el.icon.color = '#666';
			  }

		  }
		  for (var id in allEdges) {
			  var el = allEdges[id];
			  el.color = {color: '#444'};
			  el.font.color = '#444';
		  }

		  var connectedNodes = {};
		  var connectedEdges = {};

		  for (var id in visibleSelectedNodes) {
			  connectedNodes[visibleSelectedNodes[id]] = 0;
		  }
		  for (var i = 1; i <= neighborRange.value; i++) {
			  for (var id in connectedNodes) {
				  var nns = network.getConnectedNodes(id);
				  var nes = network.getConnectedEdges(id);
				  for (var nid in nns) {
					  var nn = nns[nid];
					  if (!(nn in connectedNodes)) {
						  connectedNodes[nn] = i;
					  }
				  }
				  for (var nid in nes) {
					  var ne = nes[nid];
					  if (!(ne in connectedEdges)) {
						  connectedEdges[ne] = i;
					  }
				  }
			  }
		  }

		  for (var id in connectedNodes) resetNode(allNodes[id]);
		  for (var id in connectedEdges) resetEdge(allEdges[id]);

		  bulkUpdate(allNodes, allEdges);
	}



  }

  function bulkUpdate(nodes, edges){
	  var nodeUpdates = [];
	  for (nodeId in nodes) {
		if (nodes.hasOwnProperty(nodeId)) {
			// we clean the x and y components in order to prevent nodes jitter when updating the args
			nodes[nodeId].x = undefined;
			nodes[nodeId].y = undefined;
			nodeUpdates.push(nodes[nodeId]);
		}
	  }
	  nodeDS.update(nodeUpdates);

	   var edgeUpdates = [];
	   for (edgeId in edges) {
		 if (edges.hasOwnProperty(edgeId)) {
		   edgeUpdates.push(edges[edgeId]);
		 }
	   }
	   edgeDS.update(edgeUpdates);
  }

  $("#prev-step-btn").click(prevStep);
  $("#next-step-btn").click(nextStep);
  $("#toggle-highlighting").click(neighbourhoodHighlight);
  $("#neighborRange").on("input", neighbourhoodHighlight);
});
