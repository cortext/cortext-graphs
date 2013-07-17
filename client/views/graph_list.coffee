@GraphListView = Backbone.View.extend
  initialize: ()->
    $("#graph_list").height(($(window).height()-53) + "px");
    $("#graph_list").children().height(($(window).height()-53) + "px");

    Deps.autorun ()=>
      @graphs = window.graphs.find().fetch()

      @render()

  render: ()->
    console.log("coincoin")
    $('#list-active_graphs').html Template["graph_list-active"]
      graphs : @graphs