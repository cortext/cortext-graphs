@NodeInfo = Backbone.View.extend
  initialize:()->
  render:()->
    nodes = window.graph.nodes
    edges = window.graph.edges
    
    node = _(nodes).find (node)=>
      return node.id == @options.node_id

    neighbors = []

    _(edges).each (edge)->
#      console.log edge
      if edge["source"] == parseInt node.index 
        neighbors.push nodes[edge["dest"]]

      if edge["dest"] == parseInt node.index
        neighbors.push nodes[edge["source"]]

    cluster = _(window.graph.clusters).find (cluster)=>
      return cluster.index == node.cluster_index

    console.log node
    console.log cluster

    @$el.html Template.nodepanel
      node: node
      neighbors : neighbors

    @$el.find(".cluster").css("background", cluster.color)