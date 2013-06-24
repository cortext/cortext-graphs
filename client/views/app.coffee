@App = Backbone.View.extend
  initialize : ()->
    # set container at the right height
    $("#panels").height(($(window).height()-53) + "px");
    # $("#panels").children().height(($(window).height()-53) + "px");

    listofnodes = new Nodelist
      el: document.getElementById('node_list')

    window.graph.on "graph:loaded", ()->
        listofnodes.render()

  open_node_list : ()->
    $('#node_info').hide()
    $('#node_list').show()

  close_node_list : ()->
    $('#node_list').hide()
    $('#node_info').show()

  open_node: (node_id)->
    node_info = new NodeInfo 
      node_id : node_id
      el : document.getElementById "node_info"

    @close_node_list()
    node_info.render()