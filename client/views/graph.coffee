@GraphView = Backbone.View.extend
  sigma: null
  
  initialize: ()->
    console.log('initializing graph')

    if (this.sigma is not null)
      this.sigma.emptyGraph()

  render: ()->
    @$el.empty()

    @sigma = window.sigma.init document.getElementById('sigma')

    @sigma.bind('overnodes', window.CorTextGraphs.sidebar.updateSidebar).draw()

    @sigma.drawingProperties
      font: 'Arial'
      labelSize: 'fixed'
      defaultLabelSize: 18
      edgeColor: 'source'
      defaultEdgeType: 'curve'
    .graphProperties
      minNodeSize: 1,
      maxNodeSize: 80

    @sigma.emptyGraph()

    nodes = window.graph.nodes
    clusters = window.graph.clusters
    edges = window.graph.edges

    _(clusters).each (cluster)=>
      @sigma.addNode(cluster.id, cluster)

    _(nodes).each (node)=>
      @sigma.addNode(node.id, node)

    _(edges).each (edge, key)=>
      validID = edge['source'] and edge['dest'];
      validID and @sigma.addEdge(
        'edge-low-' + key,
        'node-low-' + edge['source'],
        'node-low-' + edge['dest'],
        edge)

    $("#nav_panels .nodes .count").html(_(nodes).size())
    $("#nav_panels .annotations .count").html( CorTextGraphs.Notes.find().count() )

    @sigma.draw()