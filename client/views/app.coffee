@App = Backbone.View.extend
  initialize : ()->
    # set container at the right height
    $("#panels").height(($(window).height()-53) + "px");
    $("#panels").children().height(($(window).height()-53) + "px");

    listofnodes = new Nodelist
      el: document.getElementById('node_list')

    window.graph.on "graph:loaded", ()->
        listofnodes.render()

    @panels = new Panels