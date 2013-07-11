@Router =  Backbone.Router.extend
  routes:
    '': 'default'
    'open/:path': 'open_graph' #http://localhost:3000/open/http%3A%2F%2Flocalhost%3A3000%2Fdemo%2Fgraph.json
    'graph/:graph_id' : 'graph'
    'graph/:graph_id/list/nodes' : 'graph_node_list'
    'graph/:graph_id/list/annotations' : 'graph_annotation_list'
    'graph/:graph_id/list/annotations' : 'graph_annotation_list'
    'graph/:graph_id/node/:node_id' : 'graph_node_info'

  default: ()->

  open_graph: (path)=>
    url = decodeURIComponent path

    console.log 'trying to open', url

    graphs = new Meteor.Collection 'graphs'

    Meteor.subscribe 'graphs', ()->
      current_graph = graphs.findOne { url : url }

      if(current_graph)
        console.log "graph already exists. redirecting", current_graph
        @navigate 'graph/'+current_graph.short_id
      else
        console.log "creating graph entry"
        
        short_id = (+new Date()).toString(36)

        new_graph =
          short_id : short_id,
          url : url

        graphs.insert new_graph,(error, result)->
          this.navigate('graph/'+ current_graph.short_id);

  graph: (graph_short_id, cb)=>
    graphs = new Meteor.Collection 'graphs'

    Meteor.subscribe 'graph', graph_short_id, ()->
      graph = graphs.findOne { short_id : graph_short_id}

      if (graph)
        window.graph = new Graph()
        window.graph.open_url graph.url

        window.app = new App()
        window.app.root_url = "graph/"+graph_short_id

        window.graph.on "graph:loaded",()->
            window.app.graph.render()

        cb()
      else
        console.log "graph not found", graph_short_id

  graph_node_list: (graph_short_id)->
    @graph graph_short_id, ()->
      window.app.panels.open_node_list()

  graph_node_info: (graph_short_id, node_id)->
    @graph graph_short_id, ()->
      window.graph.on "graph:loaded", ()->
        window.app.panels.open_node(node_id)

  graph_annotation_list: (graph_short_id)->
    @graph graph_short_id, ()->
      window.app.panels.open_annotation_list()
