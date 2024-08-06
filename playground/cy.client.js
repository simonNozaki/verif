var cy = cytoscape({
  container: document.getElementById('cy'),
  elements: [{"data":{"id":"a"}},{"data":{"id":"b"}},{"data":{"id":"c"}},{"data":{"id":"d"}},{"data":{"id":"e","source":"a","target":"b"}},{"data":{"id":"f","source":"b","target":"c"}},{"data":{"id":"g","source":"a","target":"c"}},{"data":{"id":"h","source":"a","target":"d"}},{"data":{"id":"i","source":"c","target":"d"}}],
  style: [
    {
      selector: 'node',
      style: {
        'background-color': '#666',
        'label': 'data(id)'
      }
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
    name: 'grid',
    rows: 1
  }
})
