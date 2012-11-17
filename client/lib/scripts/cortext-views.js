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
                        /*
                         * on the fly adding clusters
                         */
                        if (that._categories[node.community.toString()] === undefined) {
                            that._categories[node.community.toString()] = {
                                id: 'cluster-' + node.community.toString(),
                                size: 2000,
                                x: [node.x],
                                y: [node.y],
                                label: '',
                            };
                        } else {
                            that._categories[node.community.toString()].x.push(node.x);
                            that._categories[node.community.toString()].y.push(node.y);
                        }
                        node.id = key;
                        node.size = node.weight;
                        node.inDegree = node['in-degree'];
                        node.outDegree = node['out-degree'];
                        that.sigma.addNode(node.id, node);
                    });
                    /* TODO draw clusters above nodes without hiding them all ....
                     * this._categories && _.keys(this._categories).forEach(function(key) {
                        var node = that._categories[key];
                        node.x = _.reduce(node.x, function(memo, num) {
                            return memo + num; }, 0) / node.x.length;
                        node.y = _.reduce(node.y, function(memo, num) {
                            return memo + num; }, 0) / node.y.length;
                        that.sigma.addNode(node.id, node);
                    });
                    */
                    /*
                     * draw edges
                     */
                    object.edges && _.keys(object.edges).forEach(function(key) {
                        var edge = object.edges[key];
                        validID = edge['source'] && edge['source'];
                        validID && that.sigma.addEdge(
                            key,
                            edge['source'],
                            edge['dest'],
                            edge
                        );
                    });
                    this.sigma.draw(1000, 1000, 1000, true);
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
