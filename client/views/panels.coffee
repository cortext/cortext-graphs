@nav_panels = Backbone.View.extend
  events:
    "click .nodes": "open_node_list"

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