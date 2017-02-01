(function () {
  if (!window.IRVis) window.IRVis = {};

  var nodes = {
    0: { uid:0, id:0, styles: ['app'], name: 'App' },
    1: { uid:1, id:1, styles: ['star'], name: 'Star' },
    2: { uid:2, id:2, styles: ['integer'], name: 'Integer 1' },
    3: { uid:3, id:3, styles: ['star'  ], name: 'Star' },
    4: { uid:4, id:4, styles: ['var'], name: 'Var' },
    5: { uid:5, id:5, styles: ['star'], name: 'Star' },
    6: { uid:6, id:6, styles: ['string'], name: "'id'" },
    7: { uid:7, id:7, styles: ['star'], name: 'Star' }
  };

  var edges = {
    0:  { uid: 0, id: 0, src: 1, tgt: 0, styles: ['type'] },
    1:  { uid: 1, id: 1, src: 2, tgt: 0, styles: ['input1'] },
    2:  { uid: 2, id: 2, src: 3, tgt: 2, styles: ['type'] },
    3:  { uid: 3, id: 3, src: 4, tgt: 0, styles: ['input0'] },
    4:  { uid: 4, id: 4, src: 6, tgt: 4, styles: ['input0'] },
    5:  { uid: 5, id: 5, src: 7, tgt: 6, styles: ['type'] },
    6:  { uid: 6, id: 6, src: 5, tgt: 4, styles: ['type'] },
  };

  var steps = [ { name: "initial", mkNodes: [0,1,2,3,4,5,6,7], mkEdges: [0,1,2,3,4,5,6],  rmNodes: [],  rmEdges: [] }
              ];

  window.IRVis.sampleConfig = { nodes: nodes, edges: edges, steps: steps };
})();
