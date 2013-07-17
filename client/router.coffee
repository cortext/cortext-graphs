graphs = new Meteor.Collection 'graphs'

@graphs = graphs

Meteor.subscribe 'graphs'


@Router =  Backbone.Router.extend
  routes:
    '': 'default'
    'open/:path': 'open_graph' #http://localhost:3000/open/http%3A%2F%2Flocalhost%3A3000%2Fdemo%2Fgraph.json
    'graph/:graph_id' : 'graph'
    'graph/:graph_id/list/nodes' : 'graph_node_list'
    'graph/:graph_id/list/annotations' : 'graph_annotation_list'
    'graph/:graph_id/node/:node_id' : 'graph_node_info'

  default: ()->
    window.graph = new Graph()
    window.app = new App()
    window.app.show_graph_list()

  open_graph: (path)->
    url = decodeURIComponent path

    console.log 'trying to open', url

    Meteor.subscribe 'graphs', ()=>
      current_graph = graphs.findOne { url : url }

      if(current_graph)
        console.log "graph already exists. redirecting", current_graph
        @navigate 'graph/'+current_graph.short_id, { trigger : true }
      else
        console.log "creating graph entry"
        
        short_id = (+new Date()).toString(36)

        new_graph =
          short_id : short_id,
          url : url

        graphs.insert new_graph,(error, result)=>
          @navigate 'graph/'+current_graph.short_id, { trigger : true }

  graph: (graph_short_id, cb)=>
    Meteor.subscribe 'graph', graph_short_id, ()->
      graph = graphs.findOne { short_id : graph_short_id}

      if (graph)
        window.graph = new Graph()
        window.graph.open_url graph.url

        window.app = new App()
  
        window.app.root_url = "graph/"+graph_short_id
        window.app.show_panels()

        window.graph.on "graph:loaded",()->
            window.app.graph.render()

        cb() if cb
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
