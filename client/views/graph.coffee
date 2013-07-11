@GraphView = Backbone.View.extend
  sigma: null
  
  initialize: ()->
    console.log('initializing graph view')

    $("#sigma").height(($(window).height() - 53) + "px");
    $("#sigma").width(($(window).width()) + "px");

    if (this.sigma is not null)
      this.sigma.emptyGraph()

  add_events: ()->
    # highlight neighbors when hovering a node
    # @sigma.bind 'overnodes', (e)=>
    #   node_id = e.target.getNodes(e.content[0]).id

    #   if node_id.match(/node-low/)
    #     @sigma.iterEdges (e)=>
          

    # Open node panel on click
    @sigma.bind 'downnodes', (e)=>
      node_id = e.target.getNodes(e.content[0]).id

      if node_id.match(/node-low/)
        node = window.graph.find_node node_id
        window.app.panels.open_node node.id
        @sigma.draw()

    # highlight cluster and child on hover in a cluster
    # @sigma.bind 'downnodes', (e)=>
    #   node_id = e.target.getNodes(e.content[0]).id

    #   if node_id.match(/node-high/)
    #     console.log "cluster"
    # .bind 'outnode', (e)=>

    # Open cluster panel on click
    # TODO

  render: ()->
    @$el.empty()

    @sigma = window.sigma.init document.getElementById('sigma')

    @sigma.drawingProperties
      font: 'Arial'
      labelSize: 'fixed'
      defaultLabelSize: 18
      edgeColor: 'source'
      defaultEdgeType: 'curve'
    .graphProperties
      minNodeSize: 1,
      maxNodeSize: 80

    @add_events()

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

    @sigma.draw()

  show_node:(e)->
    ids = $(e.currentTarget).attr('data-id').split(',')

    _.each ids, (id)=>
        @sigma._core.plotter.drawHoverNode @sigma._core.graph.nodesIndex[id]

  hide_node:(e)->
    @sigma.refresh()