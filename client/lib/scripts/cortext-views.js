if (Meteor.isClient) {
    Meteor.startup(function() {
        if (window.CorTextGraphs === undefined) {
            window.CorTextGraphs = {};
        }
        if (window.CorTextGraphs.sigmaview === undefined) {
            var SigmaView = Backbone.View.extend({
                sigma: null,
                initialize: function() {
                    if (this.sigma !== null) {
                        this.sigma.emptyGraph();
                    }
                },
                pushGraph: function(object) {
                    var that = this;
                    object.nodes && _.keys(object.nodes).forEach(function(key) {
                        var node = object.nodes[key];
                        node.id = key;
                        node.size = node.weight;
                        node.color = '#D37';
                        node.inDegree = node['in-degree'];
                        node.outDegree = node['out-degree'];
                        that.sigma.addNode(node.id, node);
                    });

                    object.edges && _.keys(object.edges).forEach(function(key) {
                        var edge = object.edges[key];
                        //validID = edge['source'] && edge['target'] && edge['id'];
                        /*validID && that.sigma.addEdge(
                            edge['id'],
                            edge['source'],
                            edge['target'],
                             edge
                        );*/
                    });
                    this.sigma.draw(1000, 1000, 1000, true);
                },
                render: function() {
                    this.$el.empty();
                    // TODO add a spinner
                    this.sigma = window.sigma.init(
                        document.getElementById('sigma'));
                    this.sigma.drawingProperties({
                        defaultLabelColor: '#ccc',
                        font: 'Arial',
                        edgeColor: 'source',
                        defaultEdgeType: 'curve'
                    }).graphProperties({
                        minNodeSize: 1,
                        maxNodeSize: 10
                    });
                    var that = this;
                    $.get(Session.get('path'),
                        function(data, textStatus) {
                            that.sigma.emptyGraph();
                            that.pushGraph(data);
                        });
                }
            });
            window.CorTextGraphs.sigmaview = new SigmaView({
                el: $('#sigma').get(0)
            });

            /* TODO use backbone layout for nested views
             * new Backbone.Layout({
                template: 'body',
                views: {
                    '#sigma': new SigmaView()
                }
            })*/
        }
    });
}
