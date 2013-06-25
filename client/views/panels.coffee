@nav_panels = Backbone.View.extend
  events:
    "click .nodes": "open_node_list"

  initialize:()->
    # set container at the right height
    $("#panels").height(($(window).height()-53) + "px");
    $("#panels").children().height(($(window).height()-53) + "px");

    window.graph.on "graph:loaded", ()->
      $("#nav_panels .nodes .count").html(_(window.graph.nodes).size())
      $("#nav_panels .annotations .count").html( CorTextGraphs.Notes.find().count() )

  open_node_list:()->
    window.app.panels.open_node_list

@Panels = Backbone.View.extend
  open_node_list : ()->
    $('#node_info').slideDown(600)
    $('#node_list').slideDown(600)

  close_node_list : ()->
    $('#node_list').slideUp(600)
    $('#node_info').slideDown(600)

  open_node: (node_id)->
    node_info = new NodeInfo 
      node_id : node_id
      el : document.getElementById "node_info"

    @close_node_list()
    node_info.render()