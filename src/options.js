(function () {
  if (!window.IRVis) window.IRVis = {};
	window.IRVis.visOptions = {
    interaction: { multiselect: true },
		layout: {
      randomSeed: 0,
      hierarchical: {
        direction: "DU",
        sortMethod: "directed"
      }
    },
		nodes: {
      shape: 'box',
      borderWidth: 0,
      shadow: {
        enabled: true,
        color: '#211f1b',
        x: 0,
        y: 0,
        size: 10
      }
    },
    edges: {
      smooth: false,
      width: 2.0
    },
    physics: {
      barnesHut: {
        gravitationalConstant: 0,
        centralGravity: 0,
        //springLength: 100,
        springConstant: 0,
        //damping: 4.0,
        //avoidOverlap: 0.4
      },
      hierarchicalRepulsion: {
        centralGravity: 1,
        springLength: 0,
        springConstant : 4,
        nodeDistance: 300,
        damping: 4
      },
      timestep: 0.5,
      solver: 'hierarchicalRepulsion'
    }
  }
})();
