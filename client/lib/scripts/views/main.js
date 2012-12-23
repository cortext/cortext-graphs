if (Meteor.isClient) {
    Meteor.startup(function() {
        if (window.CorTextGraphs === undefined) {
            window.CorTextGraphs = {};
        }
        if (window.CorTextGraphs.sidebar === undefined) {
            var Sidebar = Backbone.View.extend({
                events: {
                    'click .neighbor-switch': 'switchSidebar',
                    'click [data-neighbor-page]': 'switchNeighborPage'
                },
                initialize: function() {
                },
                switchNeighborPage: function(e) {
                    var page = $(e.currentTarget).attr('data-neighbor-page');
                    if (page == 'Next') {
                        var num = parseInt($('[data-neighbor-page].active').attr('data-neighbor-page')) + 1;
                    } else if (page == 'Prev') {
                        var num = parseInt($('[data-neighbor-page].active').attr('data-neighbor-page')) - 1;
                    } else {
                        var num = parseInt(page, 10);
                    }
                    if (num > Math.ceil(Session.get('selected_neighbors').length / 5) ||
                        num < 1) {
                        return;
                    }
                    $('.neighbor').each(function(i) {
                        if (i + 1 <= num * 5 && i + 1 >= (num * 5) - 4) {
                            $(this).removeClass('hide');
                        } else {
                            $(this).addClass('hide');
                        }
                    });
                    $('[data-neighbor-page]').removeClass('active');
                    $('[data-neighbor-page]').parent().removeClass('active');
                    $('[data-neighbor-page=' + num + ']').addClass('active');
                    $('[data-neighbor-page=' + num + ']').parent().addClass('active');
                },
                render: function() {
                    var cluster = Session.get('selected_cluster');
                    this.$el.html(Template.nodepanel({
                        node: Session.get('selected_node'),
                        cluster: cluster,
                        neighbors: Session.get('selected_neighbors'),
                        notes: window.CorTextGraphs.Notes.find({
                            graph: Session.get('title'),
                            source: Session.get('selected_node').id
                        }).fetch()
                    }));
                    var pagesnumber = Math.ceil(
                        Session.get('selected_neighbors').length / 5);
                    if (pagesnumber > 1) {
                        for (var i = 0; i <= pagesnumber + 1; i++) {
                            var label = i;
                            if (i == 0) {
                                label = 'Prev';
                            }
                            if (i == pagesnumber + 1) {
                                label = 'Next';
                            }
                            $('.neighbor-pages').show().append(
                                '<li><a data-neighbor-page="' +
                                label + '">' +
                                label + '</a></li>');
                        }
                    } else {
                        $('.neighbor-pages').hide();
                    }
                    this.switchNeighborPage({
                        currentTarget: $('<a data-neighbor-page="1"></a>')[0]
                    });
                    var clusternote = window.CorTextGraphs.Notes.findOne({
                        source: cluster.id,
                        graph: Session.get('title')
                        /* FIXME per-user note ?
                        created_by: Session.get('user').username
                        */
                    }, {
                        sort: {
                            created_at: -1
                        },
                        limit: 1
                    });
                    if (clusternote === undefined) {
                        var newid = window.CorTextGraphs.Notes.insert({
                            created_at: Date.now(),
                            created_by: Session.get('user').username,
                            text: Session.get('selected_cluster').label,
                            type: 'cluster',
                            format: 'raw',
                            graph: Session.get('title'),
                            source: cluster.id
                        });
                        var clusternote = window.CorTextGraphs.Notes.findOne({
                            _id: newid
                        });

                    }
                    $('.cluster').editable({
                        type: 'textarea',
                        title: 'set a label for the cluster',
                        value: clusternote.text,
                        pk: clusternote._id,
                        validate: function(value) {
                            if ($.trim(value) == '') {
                                return 'field can not be empty';
                            }
                        },
                        url: function(params) {
                            window.CorTextGraphs.Notes.update(
                                params.pk,
                                {$set: { text: params.value }});
                        }
                    }).on('save', function(e, params) {
                        cluster.label = params.newValue;
                        window.CorTextGraphs.sigmaview.sigma.refresh();
                    });
                    $('.new-note').editable({
                        type: 'textarea',
                        title: 'write a note about the current node',
                        emptytext: 'new note',
                        validate: function(value) {
                            if ($.trim(value) == '') {
                                return 'field can not be empty';
                            }
                        },
                        source: Session.get('selected_node').id,
                        pk: Session.get('selected_node').id,
                        url: function(params) {
                            window.CorTextGraphs.Notes.insert({
                                created_at: Date.now(),
                                created_by: Session.get('user').username,
                                text: params.value,
                                type: $(this).data('target') ? 'edge' : 'node',
                                format: 'raw',
                                graph: Session.get('title'),
                                source: params.pk,
                                target: $(this).data('target')
                            });
                        }
                    });
                    $('.neighbor-add-note').click(function(event) {
                        event.stopPropagation();
                        $('.new-note').data('target',
                                            $(event.currentTarget).attr('data-neighbor-add-note-target'));
                        $('.new-note').editable('toggle');
                    });
                },
                switchSidebar: function(event) {
                    if (event !== null) {
                        var node_id = $(event.currentTarget)
                            .attr('data-neighbor-switch');
                        var sigma = window.CorTextGraphs.sigmaview.sigma;
                        var node = sigma.getNodes(node_id);
                    } else {
                        var sigma = arguments[2];
                        var node = arguments[1];
                    }
                    if (!node) return;
                    if (node.attr.level === 'high') {
                        return;
                    }
                    // FIXME center graph view to this node ? sigma.goTo(node.x, node.x);
                    // TODO highlight node.forceLabel = true;
                    var cluster = sigma.getNodes(
                        'node-high-' + node.attr.cluster_index);
                    var neighbors = [];
                    sigma.iterEdges(
                        function(edge) {
                            if (edge.source == node.id) {
                                neighbors.push(
                                    sigma.getNodes(edge.target));
                            }
                            if (edge.target == node.id) {
                                neighbors.push(
                                    sigma.getNodes(edge.source));
                            }
                        }
                    );
                    if (cluster) {
                        Session.set('selected_cluster', cluster);
                    }
                    Session.set('selected_neighbors',
                                _.uniq(neighbors, false, function(node) {
                                    return node.id;
                    }));
                    Session.set('selected_node', node);
                    window.CorTextGraphs.sidebar.render();
                },
                updateSidebar: function(e) {
                    var node = e.target.getNodes(e.content[0]);
                    window.CorTextGraphs.sidebar.switchSidebar(null, node, e.target);
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
                            Meteor.subscribe('notes', data.meta.title,
                                function() {
                                    that.sigma.emptyGraph();
                                    that.pushClusters(data);
                            });
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
                                    var clusternote = window.CorTextGraphs.Notes.findOne({
                                        source: node.id
                                        /* FIXME per-user note ?
                                        created_by: Session.get('user').username
                                        */
                                    }, {
                                        sort: {
                                            created_at: -1
                                        }
                                    });
                                    if (clusternote !== undefined) {
                                        node.label = clusternote.text;
                                    }
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
