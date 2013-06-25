@App = Backbone.View.extend
  initialize : ()->

    window.annotations = window.CorTextGraphs.Notes;

    @counters = new nav_panels
      el: document.getElementById 'nav_panels'

    @graph = new GraphView
      el: document.getElementById 'sigma'

    @panels = new Panels