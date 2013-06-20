nav_panels = Backbone.View.extend({

  events: {
    "click .nodes": "renderNodeList",
    "click .annotations": "renderAnnotationList"
  },

  renderNodeList: function(){
      $('#notelist').hide();
      $('#nodelist').show();
      window.CorTextGraphs.nodelist.render();

  },
  renderAnnotationList: function(){
      $('#nodelist').hide();
      $('#notelist').show();
      window.CorTextGraphs.notelist.render();
  }
});