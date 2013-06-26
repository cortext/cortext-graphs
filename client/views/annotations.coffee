@annotationsView = Backbone.View.extend
  events:
    'click .annotation' : 'open_source'

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
      new annotationFormAdd
        node : @node
        el: $("#annotation_add")
      .render()

      Deps.autorun ()=>
        @annotations = window.annotations.find
          source : @node.id
        .fetch()

        _(@annotations).each (annotation)=>
          annotation.node = @node

        @render()
    else
      Deps.autorun ()=>
        @annotations = window.annotations.find().fetch()

        # not optimal dude !
        _(@annotations).each (annotation)->
          annotation.node = _(window.graph.nodes).find (node)->
            annotation.source is node.id

        @render()

  render:()->
    @$el.html Template.annotation_list
      annotations : @annotations

  open_source:(e)->
    window.CorTextGraphs.mainrouter.navigate(window.location.hash.split('?node=')[0] +
    '?node=' + $(e.currentTarget).attr('data-source-id'), true);    

@annotationFormAdd = Backbone.View.extend
  initialize:()->

  render:()->
    @$el.html Template.annotation_add()

    @$el.find("button.add").on "click", (e)=>
      params = 
        created_at: Date.now()
        created_by: undefined
        text: $(@$el.find('textarea')[0]).val()
        type: 'node'
        format: 'raw'
        graph: Session.get('title')
        source: @options.node.id
        target: null

      # console.log @options.node
      # console.log "insert", params

      window.annotations.insert params, (error, id)=>
        $(@$el.find('textarea')[0]).val('')