@App = Backbone.View.extend
  initialize : ()->
    listofnodes = new Nodelist
      el: document.getElementById 'node_list'

    window.graph.on "graph:loaded", ()->
        listofnodes.render()

    @counters = new nav_panels
      el: document.getElementById 'nav_panels'

    @graph = new GraphView
      el: document.getElementById 'sigma'

    @panels = new Panels