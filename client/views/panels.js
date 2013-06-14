var nav_panels = Backbone.View.extend({

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


Meteor.startup(function(){

  window.CorTextGraphs.nav_panels = new nav_panels({
    el: document.getElementById('nav_panels')
  });

});

