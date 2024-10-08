fetch('http://localhost:38081/data.json')
  .then((response) => {
    response.json().then((value) => {
      var elements = value && Array.isArray(value) ? value : []
      cytoscape({
        container: document.getElementById('cy'),
        elements,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#11479e',
              color: '#ffffff',
              content: 'data(id)',
              shape: 'round-rectangle',
              'text-valign': 'center',
              'text-halign': 'center',
              width: getCharacterWidthInCanvas,
            }
          },
          {
            selector: 'edge',
            style: {
              width: 4,
              'target-arrow-shape': 'triangle',
              'line-color': '#9dbaea',
              'target-arrow-color': '#9dbaea',
              'curve-style': 'bezier'
            }
          },
          {
            selector: ':parent',
            css: {
              padding: getCharacterHeightInCanvas,
              'text-valign': 'bottom',
              'text-halign': 'center',
              'text-margin-y': function (node) { -getCharacterHeightInCanvas(node) }
            },
          },
        ],
        layout: {
          name: 'breadthfirst',
          fit: true,
          padding: 16,
          directed: true,
          avoidOverlap: true,
          grid: true,
        }
      })
    })
  })
  .catch((reason) => {
    console.error(reason)
  })

var getMeasureText = function (target) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext( '2d' );
  const fontStyle = target.style('font-style');
  const fontSize = target.style('font-size');
  const fontFamily = target.style('font-family');
  const fontWeight = target.style('font-weight');

  ctx.font = fontStyle + ' ' + fontWeight + ' ' + fontSize + ' ' + fontFamily;

  return ctx.measureText(target.data('id'));
}

var getCharacterWidthInCanvas = function (target) {
  const labelWidthMargin = 16;

  const measure = getMeasureText(target);

  return measure.width + labelWidthMargin;
}

var getCharacterHeightInCanvas = function (target) {
  const labelHeightMargin = 16;

  const measure = getMeasureText(target);

  return measure.actualBoundingBoxAscent + measure.actualBoundingBoxDescent + labelHeightMargin;
}
