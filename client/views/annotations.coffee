@annotationsView = Backbone.View.extend
  initialize:()->
    if @options.node_id is undefined
      @node = undefined
    else
      @node = _(window.graph.nodes).find (node)=>
        node.id = @options.node_id

    if @options.node
      @node = @options.node

    console.log @node

    if @node
      Deps.autorun ()=>
        @annotations = window.annotations.find
          source : @node.id
        .fetch()
        
        console.log @annotations
        
        @render()
    else
      Deps.autorun ()=>
        @annotations = window.annotations.find().fetch()
        @render()

  render:()->
#    console.log "render annotations for node: "+ @node.id

    @$el.html Template.annotation_list
      annotations : @annotations

    console.log "form for node", @node

    new annotationFormAdd
      node : @node
      el: @$el.children("#annotation_add")
    .render()

@annotationFormAdd = Backbone.View.extend
  initialize:()->

  render:()->
    @$el.html Template.annotation_add()

    @$el.find("button.add").on "click", (e)=>
      params = 
        created_at: Date.now()
        created_by: undefined
        text: $(@$el.find('input')[0]).val()
        type: 'node'
        format: 'raw'
        graph: Session.get('title')
        source: @options.node.id
        target: null

      # console.log @options.node
      # console.log "insert", params

      window.annotations.insert params