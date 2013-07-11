@Graph = Backbone.Model.extend
  initialize:()->
    console.log "loading graph into DOM"

    # @clusters = Backbone.Collection.extend
    # @nodes = Backbone.Collection.extend

    @clusters = []
    @nodes = []
    @edges = []

    @import_from_json()

    console.log this

  import_from_json:()->

    done = _.after 2, ()=>
      @trigger "graph:loaded"

    $.get Session.get('path'), (data)=>

      # set title according to the json node file
      Session.set('title', data.meta.title)

      Meteor.subscribe('all-notes', data.meta.title)

      console.log "loading nodes from json", data

      @nodes = @process_nodes data.nodes
      @edges = data.edges
      done()

    $.get Session.get('clusterpath'), (data)=>
      console.log "loading clusters from json", data

      @clusters = @process_clusters data.nodes
      done()

  process_nodes:(nodes)->
    max_weight = _(nodes).max((node)-> node.weight).weight

    _(nodes).each (node, key)->
      node.id = 'node-low-' + key
      node.index = key

      node.size = 2 * (node.weight / max_weight)

      node.color = '#' + sigma.tools.rgbToHex(
        parseFloat(node.r),
        parseFloat(node.g),
        parseFloat(node.b))

#      node.annotations_count = 0

    nodes

  process_clusters:(clusters)->

    _(clusters).each (node)->
      node.id = "node-high-" + node.index
      node.cluster = true

      node.size = node.width

      node.color = 'rgba(' +
        parseFloat(node.r).toString() + ',' +
        parseFloat(node.g).toString() + ',' +
        parseFloat(node.b).toString() + ',' +
        '0.3' + ')'

      node.color_plain = '#' + sigma.tools.rgbToHex(
        parseFloat(node.r),
        parseFloat(node.g),
        parseFloat(node.b))

      node.hoverActive = false

    clusters

  find_node:(node_id)->
    node = _(@nodes).find (node)=>
      return node.id == node_id

    node

  find_cluster:(cluster_id)->
    cluster = _(@clusters).find (cluster)=>
      return cluster.id == cluster_id

    cluster