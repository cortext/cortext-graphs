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
                 * initialize sigma instance and draw the graph
                 */
                render: function() {
                    this.$el.empty();
                    // TODO add a spinner
                    this.sigma = window.sigma.init(
                        document.getElementById('sigma'));
                    //this.sigma.bind('overnodes',showNodeInfo).bind('outnodes',hideNodeInfo).draw();
                    this.sigma.drawingProperties({
                        font: 'Arial',
                        edgeColor: 'source',
                        defaultEdgeType: 'curve'
                    }).graphProperties({
                        minNodeSize: 1,
                        maxNodeSize: 80
                    });
                    var that = this;
                    $.get(Session.get('path'),
                        function(data, textStatus) {
                            Session.set('title', data.meta.title);
                            that.sigma.emptyGraph();
                            that.pushClusters(data);
                            that.sigma.draw();
                        });
                },
                /*
                 * low-level graph drawing
                */
                pushGraph: function(object) {
                    var that = this;
                    /*
                     * draw nodes
                     */
                    var maxweight = _.max(object.nodes,
                        function(node) { return node.weight; }).weight;
                    object.nodes && _.keys(object.nodes).forEach(
                        function(key) {
                            var node = object.nodes[key];
                            node.id = 'node-low-' + key;
                            node.size = 2 * (node.weight / maxweight);
                            node.inDegree = node['in-degree'];
                            node.outDegree = node['out-degree'];
                            node.color = '#' + sigma.tools.rgbToHex(
                                        parseFloat(node.r),
                                        parseFloat(node.g),
                                        parseFloat(node.b));
                            that.sigma.addNode(node.id, node);
                    });
                    /*
                     * draw edges
                     */
                    object.edges && _.keys(object.edges).forEach(
                        function(key) {
                            var edge = object.edges[key];
                            validID = edge['source'] && edge['source'];
                            validID && that.sigma.addEdge(
                                'edge-low-' + key,
                                'node-low-' + edge['source'],
                                'node-low-' + edge['dest'],
                                edge
                            );
                    });
                },
                /*
                 * draw clusters
                 */
                pushClusters: function(data) {
                    var that = this;
                    $.get(Session.get('clusterpath'),
                        function(object, textStatus) {
                            var self = that;
                            object.nodes && _.keys(object.nodes).forEach(
                                function(key) {
                                    var node = object.nodes[key];
                                    node.id = 'node-high-' + key;
                                    node.size = node.width;
                                    node.cluster = true;
                                    node.color = 'rgba(' +
                                        parseFloat(node.r).toString() + ',' +
                                        parseFloat(node.g).toString() + ',' +
                                        parseFloat(node.b).toString() + ',' +
                                        '0.3' + ')';
                                    self.sigma.addNode(node.id, node);
                            });
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
