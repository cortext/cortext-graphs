if (Meteor.isClient) {
    Meteor.startup(function() {
        if (window.CorTextGraphs === undefined) {
            window.CorTextGraphs = {};
        }
        if (window.CorTextGraphs.sigmaview === undefined) {
            var SigmaView = Backbone.View.extend({
                /*
                 * Sigma instance
                 */
                sigma: null,
                initialize: function() {
                    if (this.sigma !== null) {
                        this.sigma.emptyGraph();
                    }
                },
                /*
                 * Graph drawing function
                 */
                pushGraph: function(object) {
                    this._categories = {};
                    var that = this;
                    /*
                     * draw nodes
                     */
                    object.nodes && _.keys(object.nodes).forEach(function(key) {
                        var node = object.nodes[key];
                        node.id = "node-low-" + key;
                        node.community = node.community.toString();
                        node.size = node.weight;
                        node.inDegree = node['in-degree'];
                        node.outDegree = node['out-degree'];
                        that.sigma.addNode(node.id, node);
                    });
                    /*
                     * draw edges
                     */
                    object.edges && _.keys(object.edges).forEach(function(key) {
                        var edge = object.edges[key];
                        validID = edge['source'] && edge['source'];
                        validID && that.sigma.addEdge(
                            "edge-low-" + key,
                            "node-low-" + edge['source'],
                            "node-low-" + edge['dest'],
                            edge
                        );
                    });
                    // TODO this.sigma.parseGexf(Session.get('clusterpath'));
                    this.sigma.draw(1000,1000,1000,true);
                },
                render: function() {
                    this.$el.empty();
                    // TODO add a spinner
                    this.sigma = window.sigma.init(
                        document.getElementById('sigma'));
                    this.sigma.drawingProperties({
                        //defaultLabelColor: '#ccc',
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
                            Session.set('title', data.meta.title);
                            that.sigma.emptyGraph();
                            that.pushGraph(data);
                        });
                }
            });
            /*
             * init view
             */
            window.CorTextGraphs.sigmaview = new SigmaView({
                el: $('#sigma').get(0)
            });
        }
    });
}
