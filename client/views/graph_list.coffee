@GraphListView = Backbone.View.extend
  initialize: ()->
    Deps.autorun ()=>
      @graphs = window.graphs.find().fetch()

      @render()

  render: ()->
    console.log("coincoin")
    $('#list-active_graphs').html Template["graph_list-active"]
      graphs : @graphs