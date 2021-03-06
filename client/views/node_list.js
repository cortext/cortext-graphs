Meteor.startup(function () {
});

Nodelist = Backbone.View.extend({
    events: {
        'click .node': 'displayCurrentNode',
        'mouseover .node': 'showNode',
        'mouseout .node': 'hideNode',
    },

    initialize: function() {
    },

    showNode: function(e) {
        window.app.graph.show_node(e);
    },

    hideNode: function(e) {
        window.app.graph.hide_node(e);
    },

    displayCurrentNode: function(e){
        if($(e.currentTarget).attr('data-id') !==undefined){
            var node_id = $(e.currentTarget).attr('data-id');
            window.app.panels.open_node(node_id);
        }
    },

    render: function(){
//        console.log("rendering list of nodes grouped by cluster");

        var clusters = window.graph.clusters;
        var nodes = window.graph.nodes;

        _(clusters).each(function(cluster){
            cluster.nodes = [];
        });

        _.each(nodes, function(node){
            _(clusters).find(function(cluster){ return cluster.label == node.cluster_label}).nodes.push(node);

        });

        clusters = _.sortBy(clusters, function(node){
            return node.color;
        });

        // var notes = _.map(window.CorTextGraphs.Notes.find({
        //     graph: Session.get('title'),
        //     type: { $ne: 'cluster' }
        // }, {
        //     sort: {
        //         created_at: -1
        //     }
        // }).fetch()
        this.$el.html(Template.nodelist({
            clusters : clusters
        }));

        // might be a little bit ressource greedy
        _(nodes).each(function(node){
            var annotations_count = Meteor.render(function(){
                var count = window.annotations.find({
                        graph: Session.get('title'),
                        source: node.id
                    }
                ).count();

                if(count > 0){
                    return count
                } else {
                    return ""
                }
            });

            $("#"+node.id+" .annotations_count").append(annotations_count);
        });

    }
});