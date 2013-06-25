@NodeInfo = Backbone.View.extend
  initialize:()->
  render:()->
    nodes = window.graph.nodes
    edges = window.graph.edges
    
    node = _(nodes).find (node)=>
      return node.id == @options.node_id

    neighbors = {}

    _(edges).each (edge)->
#      console.log edge
      if edge["source"] == parseInt node.index
        n = nodes[edge["dest"]]
        n.is_destination = true

        neighbors[n.id] = n

      if edge["dest"] == parseInt node.index
        n = nodes[edge["source"]]
  
        if neighbors[n.id]
          neighbors[n.id].is_source = true
        else
          n.is_source = true
          neighbors[n.id] = n

    neighbors = _(neighbors).toArray()

    cluster = _(window.graph.clusters).find (cluster)=>
      return cluster.index == node.cluster_index

    console.log node
    console.log cluster

    @$el.html Template.nodepanel
      node: node
      neighbors : neighbors

    @$el.find(".cluster").on "click", (e)->
      window.app.panels.open_node_list()

    @$el.find(".cluster").css("background", cluster.color)