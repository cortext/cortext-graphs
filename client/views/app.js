App = Backbone.View.extend({
  initialize : function(){
    // set container at the right height
    $("#panels").height(($(window).height()-53) + "px");
    $("#panels").children().height(($(window).height()-53) + "px");

    var listofnodes = new Nodelist({ el: document.getElementById('node_list')});

    window.graph.on("graph:loaded",function(){
        listofnodes.render();
    });
  },

  open_node: function(node_id){
    var node_info = new NodeInfo({ node_id : node_id, el : document.getElementById("node_info") })
    node_info.render()
  }
});