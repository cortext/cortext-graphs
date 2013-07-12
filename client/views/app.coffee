@App = Backbone.View.extend
  initialize : ()->

    window.annotations = window.CorTextGraphs.Notes;

    @router = window.CorTextGraphs.mainrouter

    @graph_list = new GraphListView
      el: document.getElementById 'graph_list'

    @counters = new nav_panels
      el: document.getElementById 'nav_panels'

    @graph = new GraphView
      el: document.getElementById 'sigma'

    @panels = new Panels

    $('#graph_list').hide()
    $('#nav_panels').hide()
    $('#panels').hide()

  show_graph_list: ()->
    $('#graph_list').show()

  show_panels: ()->
    $('#nav_panels').show()
    $('#panels').show()    