if (Meteor.isClient) {
    Meteor.startup(function() {
        if (window.CorTextGraphs === undefined) {
            window.CorTextGraphs = {};
        }
        if (window.CorTextGraphs.sidebar === undefined) {
            var Sidebar = Backbone.View.extend({
                events: {
                    "click .neighborswitch": "switchSidebar"
                },
                initialize: function() {
                    var livesidebar = Meteor.render(function() {
                        return Template.nodepanel({
                            node: Session.get('selected_node'),
                            cluster: Session.get('selected_cluster'),
                            neighbors: Session.get('selected_neighbors')
                        });
                    });
                    this.$el.html(livesidebar);
                },
                switchSidebar: function(event) {
                    var node_id = $(event.currentTarget).attr('data-neighbor-switch');
                    var node = window.CorTextGraphs.sigmaview.sigma.getNodes(node_id);
                    if (!node) return;
                    if (node.attr.level === 'high') {
                        return;
                    }
                    // TODO highlight node.forceLabel = true;
                    var cluster = window.CorTextGraphs.sigmaview.sigma.getNodes(
                        'node-high-' + node.attr.cluster_index);
                    var neighbors = [];
                    window.CorTextGraphs.sigmaview.sigma.iterEdges(
                        function(edge) {
                            if (edge.source == node.id || edge.target == node.id) {
                                neighbors.push(
                                    window.CorTextGraphs.sigmaview.sigma.getNodes(edge.target));
                            }
                        }
                    );
                    if (cluster) {
                        Session.set('selected_cluster', cluster);
                    }
                    Session.set('selected_neighbors', neighbors);
                    Session.set('selected_node', node);
                },
                updateSidebar: function(e) {
                    var node = e.target.getNodes(e.content[0]);
                    if (!node) return;
                    if (node.attr.level === 'high') {
                        return;
                    }
                    var cluster = e.target.getNodes(
                        'node-high-' + node.attr.cluster_index);
                    var neighbors = [];
                    e.target.iterEdges(
                        function(edge) {
                            if (edge.source == node.id) {
                                neighbors.push(
                                    e.target.getNodes(edge.target));
                            }
                        }
                    );
                    if (cluster) {
                        Session.set('selected_cluster', cluster);
                    }
                    Session.set('selected_neighbors', neighbors);
                    Session.set('selected_node', node);
                }
            });
            window.CorTextGraphs.sidebar = new Sidebar({
                el: document.getElementById('sidebar')
            });
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
                    this.sigma.bind('overnodes',
                                    window.CorTextGraphs.sidebar.updateSidebar
                                   ).draw();
                    this.sigma.drawingProperties({
                        font: 'Arial',
                        labelSize: 'fixed',
                        defaultLabelSize: 18,
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
                    this.sigma.draw();
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
                                    node.id = 'node-high-' + node.index;
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
                el: document.getElementById('sigma')
            });
        }
    });
}
