@nav_panels = Backbone.View.extend
  events:
    "click .nodes":       "open_node_list"
    "click .annotations": "open_annotation_list"

  initialize:()->
    # set container at the right height
    $("#panels").height(($(window).height()-53) + "px");
    $("#panels").children().height(($(window).height()-53) + "px");

    # initialize node list panel and counter
    window.graph.on "graph:loaded", ()->
      listofnodes = new Nodelist
        el: document.getElementById 'node_list'

      listofnodes.render()

      $("#nav_panels .nodes .count").html(_(window.graph.nodes).size())

    # initialize annotation list panel and counter
    annotations_count = Meteor.render ()->
      window.annotations.find().count()

    @annotations_list = new annotationsView
      el: document.getElementById 'annotation_list'

#    @annotations_list.render()

    $("#nav_panels .annotations .count").html annotations_count 

  open_node_list:()->
    window.app.panels.open_node_list()
  
  open_annotation_list:()->
    window.app.panels.open_annotation_list()

@Panels = Backbone.View.extend
  initialize: ()->
    $('#node_list').hide()
    $('#node_info').hide()
    $('#annotation_list').hide()

  open_node_list : ()->
    window.app.router.navigate(window.app.root_url+"/list/nodes")

    $('#panels').show()    

    @close_annotation_list()
    @close_node()

    $('#node_list').slideDown(600)

  close_node_list : ()->
    $('#node_list').slideUp(600)

  open_node: (node_id)->
    window.app.router.navigate(window.app.root_url+"/node/"+node_id)

    node_info = new NodeInfo 
      node_id : node_id
      el : document.getElementById "node_info"

    $('#panels').show()    

    @close_node_list()
    @close_annotation_list()

    $('#node_info').slideDown(600)
    node_info.render()

  close_node:()->
    $('#node_info').slideDown(600)

  open_annotation_list: ()->
    window.app.router.navigate(window.app.root_url+"/list/annotations")

    $('#panels').show()    
    
    @close_node_list()
    @close_node()

    $('#annotation_list').slideDown(600)

  close_annotation_list: ()->
    $('#annotation_list').slideUp(600)