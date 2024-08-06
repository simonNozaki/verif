var cy = cytoscape({
  container: document.getElementById('cy'),
  elements: [{"data":{"id":"App.vue-Button.vue","source":"App.vue","target":"Button.vue"}},{"data":{"id":"Button.vue"}},{"data":{"id":"App.vue-LinkButton.vue","source":"App.vue","target":"LinkButton.vue"}},{"data":{"id":"LinkButton.vue"}},{"data":{"id":"App.vue-CardList.vue","source":"App.vue","target":"CardList.vue"}},{"data":{"id":"CardList.vue-Card.vue","source":"CardList.vue","target":"Card.vue"}},{"data":{"id":"Card.vue"}},{"data":{"id":"CardList.vue"}},{"data":{"id":"App.vue"}}],
  style: [
    {
      selector: 'node',
      style: {
        'background-color': '#666',
        'content': 'data(id)',
        'text-valign': 'center',
        'text-halign': 'center',
        'width': 'mapData(score, 0, 0.006769776522008331, 20, 60)',
        'height': 'mapData(score, 0, 0.006769776522008331, 20, 60)',
      }
    },
    {
      "selector": "node[?attr]",
      "style": {
        "shape": "rectangle",
        "background-color": "#aaa",
        "text-outline-color": "#aaa",
        "width": "16px",
        "height": "16px",
        "font-size": "6px",
        "z-index": "1"
      },
    },
    {
      selector: 'edge',
      style: {
        'width': 3,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier'
      }
    }
  ],
  layout: {
    name: 'breadthfirst',
    fit: true,
    padding: 16,
    directed: true
  }
})
