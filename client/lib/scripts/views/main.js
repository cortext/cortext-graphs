'use strict';
if (!Meteor.isClient) {
    return;
}
Meteor.startup(function() {
    ////////////// window initialization /////////////////
    if (window.CorTextGraphs === undefined) {
        window.CorTextGraphs = {};
    }
    ////////////// panel noteedit /////////////////
    if (window.CorTextGraphs.noteEdit === undefined) {
        var NoteEdit = Backbone.View.extend({
            events: {
                'click [data-note-page]': 'switchPage',
                'mouseover .node-hover': 'showNode',
                'mouseout .node-hover': 'hideNode',
                'click [data-id]': 'displayCurrentNode'
            },
            initialize: function() {},
            showNode: function(e) {
                //console.log("hover node "+$(e.currentTarget).attr('data-id'));
                var ids = $(e.currentTarget).attr('data-id').split(',');
                _.each(ids, function(id) {
                    window.CorTextGraphs.sigmaview.sigma._core.plotter.drawHoverNode(
                       window.CorTextGraphs.sigmaview.sigma._core.graph.nodesIndex[id]);
                });
            },
            hideNode: function(e) {
                window.CorTextGraphs.sigmaview.sigma.refresh();
            },
            switchPage: function(e) {
                var page = $(e.currentTarget).attr('data-note-page');
                if (page == 'Next') {
                    var num = parseInt($('[data-note-page].active').attr('data-note-page')) + 1;
                } else if (page == 'Prev') {
                    var num = parseInt($('[data-note-page].active').attr('data-note-page')) - 1;
                } else {
                    var num = parseInt(page, 10);
                }
                if (num > Math.ceil(window.CorTextGraphs.NoteEdit.$el.data('notes').length / 100) ||
                    num < 1) {
                    return;
                }
                $('.note').each(function(i) {
                    if (i + 1 <= num * 100 && i + 1 >= (num * 100) - 99) {
                        $(this).removeClass('hide');
                    } else {
                        $(this).addClass('hide');
                    }
                });
                $('[data-note-page]').removeClass('active');
                $('[data-note-page]').parent().removeClass('active');
                $('[data-note-page=' + num + ']').addClass('active');
                $('[data-note-page=' + num + ']').parent().addClass('active');
            },
            render: function(nodeid, targetid) {
                //console.log('rendering noteEdit for node '+nodeid);
                if (!nodeid) {
                    var nodeid = Session.get('selected_node').id;
                    //$('.currentnode').addClass('hide');
                    //this.renderLastActivity();
                    //return;
                }
                console.log('rendering noteEdit for node '+nodeid);
                var sigma = window.CorTextGraphs.sigmaview.sigma;
                var node = sigma.getNodes(nodeid);
                console.log(node);
                var fromquery = {
                    graph: Session.get('title'),
                    source: nodeid
                };
                var fromnotes = _.map(window.CorTextGraphs.Notes.find(
                    fromquery
                ).fetch(), function(note) {
                        if (note.target) {
                            note.icon = 'icon-arrow-right';
                            var node = sigma.getNodes(note.target);
                            note.targetlabel = node.label;
                        }
                        return note;
                    });
                var tonotes = _.map(window.CorTextGraphs.Notes.find({
                        graph: Session.get('title'),
                        target: nodeid
                    }).fetch(), function(note) {
                        note.icon = 'icon-arrow-left';
                        var node = sigma.getNodes(note.source);
                        note.targetlabel = node.label;
                        return note;
                    });
                var notes = _.union(fromnotes, tonotes);
                var cluster = sigma.getNodes(
                    'node-high-' + node.attr.cluster_index);
                this.$el.data('notes', notes);
                var linkTargetLabel = null;
                console.log('targetid ',targetid);
                if(targetid != null)
                {
                    linkTargetLabel = window.CorTextGraphs.sigmaview.sigma.getNodes(targetid).label;
                }
                    
                this.$el.html(Template.noteedit({
                    notes: notes,
                    cluster : cluster,
                    node: node,
                    target: linkTargetLabel
                }));
                this.renderPagination(notes);
                
                var that = this;
                $('.new-note').editable({
                    type: 'textarea',
                    title: 'write a note about the current node',
                    emptytext: 'new note on the node',
                    validate: function(value) {
                        if ($.trim(value) == '') {
                            return 'field can not be empty';
                        }
                    },
                    source: nodeid,
                    pk: nodeid,
                    url: function(params) {
                        window.CorTextGraphs.Notes.insert({
                            created_at: Date.now(),
                            created_by: Session.get('user').username,
                            text: params.value,
                            type: $(this).data('target') ? 'edge' : 'node',
                            format: 'raw',
                            graph: Session.get('title'),
                            source: params.pk,
                            target: $(this).data('target') || null
                        });
                    }
                }).on('save', function(e, params) {
                    that.render();
                });
                window.CorTextGraphs.navbar.navigate('noteedit');
            },
            renderPagination: function(notes) {
                var pagesnumber = Math.ceil(notes.length / 100);
                if (pagesnumber > 1) {
                    for (var i = 0; i <= pagesnumber + 1; i++) {
                        var label = i;
                        if (i == 0) {
                            label = 'Prev';
                        }
                        if (i == pagesnumber + 1) {
                            label = 'Next';
                        }
                        $('.note-pages').show().append(
                            '<li><a data-note-page="' +
                            label + '">' +
                            label + '</a></li>');
                    }
                } else {
                    $('.note-pages').hide();
                }
                this.switchPage({
                    currentTarget: $('<a data-note-page="1"></a>')[0]
                });
            },
            displayCurrentNode: function(e){
                 window.CorTextGraphs.mainrouter.navigate(
                    window.location.hash.split('?node=')[0] +
                    '?node=' + $(e.currentTarget).attr('data-id'), true);
            }
        });
        window.CorTextGraphs.NoteEdit = new NoteEdit({
            el: document.getElementById('noteedit')
        });
    }
    ////////////// panel nodelist /////////////////
    if (window.CorTextGraphs.nodelist === undefined){
        var Nodelist = Backbone.View.extend({
            events: {
                'click .title-node': 'displayCurrentNode',
                'mouseover .title-node': 'showNode',
                'mouseout .title-node': 'hideNode',
            },
            initialize: function() {
              

            },            
            showNode: function(e) {
                window.CorTextGraphs.sidebar.showNode(e);
            },
            hideNode: function(e) {
                window.CorTextGraphs.sidebar.hideNode(e);
            },
            displayCurrentNode: function(e){
               // console.log(e.currentTarget);
                $('#nav-list_nodes').removeClass('navnodes-hover');
                console.log($(e.currentTarget).attr('data-id'));
                if($(e.currentTarget).attr('data-id') !==undefined)
                {
                    window.CorTextGraphs.navbar.navigate('currentnode');
                    window.CorTextGraphs.mainrouter.navigate(
                    window.location.hash.split('?node=')[0] +
                    '?node=' + $(e.currentTarget).attr('data-id'), true);    
                }
            },
            render: function(){
                console.log("rendering nodelist");
                var ids = new Array();
                var sigma =  window.CorTextGraphs.sigmaview.sigma;
                _.each(window.CorTextGraphs.sigmaview.sigma._core.graph.nodesIndex,function(node){
                    if(node.cluster===false)
                    {
                        ids.push(node.id);
                    }
                });
                var nodes = sigma.getNodes(ids);
                _.each(nodes, function(node){
                    var noteCount = window.CorTextGraphs.Notes.find({
                            graph: Session.get('title'),
                            source: node.id
                        }
                    ).count();
                    node.noteCount = noteCount;
                });

                // Sort nodes by cluster > node title
                nodes = _.sortBy(nodes, function(node){
                    return node.color + node.label;
                });


                // var notes = _.map(window.CorTextGraphs.Notes.find({
                //     graph: Session.get('title'),
                //     type: { $ne: 'cluster' }
                // }, {
                //     sort: {
                //         created_at: -1
                //     }
                // }).fetch()
                console.log("rendering nodelist");
                //console.log(nodes);
                this.$el.html(Template.nodelist({
                    nodes: nodes
                }));
                window.CorTextGraphs.navbar.navigate('nodelist');
            }
        });
        window.CorTextGraphs.nodelist = new Nodelist({
            el: document.getElementById('nodelist')
        });
    }
     ////////////// panel notelist /////////////////
    if(window.CorTextGraphs.notelist === undefined){
        var NoteList = Backbone.View.extend({
            events: {
                'click .note': 'displayCurrentNode',
                'mouseover .note': 'showNode',
                'mouseout .note': 'hideNode'
            },
            initialize: function () {
                // body...
            },
            showNode: function(e) {
                //console.log("hover node "+$(e.currentTarget).attr('data-id'));
                var ids = $(e.currentTarget).attr('data-id').split(',');
                _.each(ids, function(id) {
                    window.CorTextGraphs.sigmaview.sigma._core.plotter.drawHoverNode(
                       window.CorTextGraphs.sigmaview.sigma._core.graph.nodesIndex[id]);
                });
            },
            hideNode: function(e) {
                window.CorTextGraphs.sigmaview.sigma.refresh();
            },
            displayCurrentNode: function(e){
                console.log('diplaying currentnode from note list :', $(e.currentTarget).attr('data-id'));
                if($(e.currentTarget).attr('data-id') !==undefined)
                {
                    var ids = $(e.currentTarget).attr('data-id').split(',');
                    window.CorTextGraphs.mainrouter.navigate(
                    window.location.hash.split('?node=')[0] +
                    '?node=' + ids[0], true);
                    window.CorTextGraphs.navbar.navigate('currentnode');
                }
               
            },
            render: function() {
                console.log('rendering last activity (notelist)');
                var notes = _.map(window.CorTextGraphs.Notes.find({
                    graph: Session.get('title'),
                    type: { $ne: 'cluster' }
                    }, {
                        sort: {
                            created_at: -1
                        }
                    }).fetch(), function(note) {
                    if (note.source) {
                            var nodesource = window.CorTextGraphs.sigmaview.sigma.getNodes(note.source);
                            //console.log(nodesource);
                            note.sourcelabel = nodesource.label;
                            note.nodecolor = nodesource.color;
                    }
                    if (note.target) {
                        note.icon = 'icon-arrow-right';
                        var node = window.CorTextGraphs.sigmaview.sigma.getNodes(note.target);
                        note.targetlabel = node.label;
                    } else {
                        if (note.type == 'node')
                            note.nodeicon = 'icon-asterisk';
                    }
                    return note;
                    });
                this.$el.data('notes', notes);
                $('#notelist').html(Template.notelist({
                    notes: notes
                }));
                console.log('notes : ', notes);
            }
        });
        window.CorTextGraphs.notelist = new NoteList({
            el: document.getElementById('notelist')
        });
    }
     ////////////// panel navbar /////////////////
    if (window.CorTextGraphs.navbar === undefined) {
        var Navbar = Backbone.View.extend({
            events: {
                'click #nav-list_nodes': 'renderNodeList',
                'click #nav-list_notes': 'renderNoteList',
                'click #nav-info_nodes': 'renderCurrentNode'
            },
            //positions of the panels relative to the sidebar right border
            panels: {
                'notelist': //list of all notes
                {
                    position : -661,
                    navMenu : "nav-list_notes"
                },
                'nodelist': //list of all nodes
                {
                    position : -661,
                    navMenu : "nav-list_nodes"
                },
                'currentnode': //current node
                {
                    position : -336,
                    navMenu : "nav-info_nodes"
                },
                'noteedit': //noteedit
                {
                    position : 0,
                    navMenu : "nav-info_notes"
                }
            },
            initialize: function() {
                $('#nav-list_nodes').removeClass('navnodes-hover');
                $('#nav-info_nodes').removeClass('navnodes-hover');
            },
            navigate: function(currentPanel){
                $('#sidebar').animate({
                        "right": parseInt(this.panels[currentPanel].position)+'px'
                    },
                    {   queue:false,
                        duration:160
                    }
                );
                this.activateNavMenu(this.panels[currentPanel].navMenu);
            },
            activateNavMenu: function(name){
                $('.second-nav').removeClass('active');
                $('#'+name).addClass('active');
            },
            renderNodeList: function(){
                //console.log("click list");
                this.navigate('nodelist');
                //fixme hide and show = wrong methods !
                $('#notelist').hide();
                $('#nodelist').show();
                window.CorTextGraphs.nodelist.render();

            },
            renderNoteList: function(){
                //fixme hide and show = wrong methods !
                $('#nodelist').hide();
                $('#notelist').show();
                this.navigate('notelist');
                //console.log("click list");
                window.CorTextGraphs.notelist.render();
            },
            renderCurrentNode: function(){                
                this.navigate('currentnode');
                window.CorTextGraphs.sidebar.renderCurrentNode();
            },
            renderNoteEdit: function(){
                this.navigate('noteedit');
            }

        });
        window.CorTextGraphs.navbar = new Navbar({
            el: document.getElementById('navbar-right')
        });
    }
     ////////////// panel sidebar /////////////////
    if (window.CorTextGraphs.sidebar === undefined) {
        var Sidebar = Backbone.View.extend({
            events: {
                'click .neighbor-switch': 'switchSidebar',
                'click .link-annot a' : 'renderNoteEdit',
                'click .edit-cluster a' : 'editClusterLabel',
                'click [data-neighbor-page]': 'switchNeighborPage',
                'mouseover .node-hover': 'showNode',
                'mouseout .node-hover': 'hideNode', 
            },
            initialize: function() {
                console.log("initializing sidebar");
                $('#sidebar').css('right',-1000+'px');
                window.CorTextGraphs.navbar.initialize();
            },
            showNode: function(e) {
                //console.log('showNode : '+$(e.currentTarget).attr('data-id'))
                var ids = $(e.currentTarget).attr('data-id').split(',');
                _.each(ids, function(id) {
                    window.CorTextGraphs.sigmaview.sigma._core.plotter.drawHoverNode(
                       window.CorTextGraphs.sigmaview.sigma._core.graph.nodesIndex[id]);
                });
            },
            hideNode: function(e) {
                window.CorTextGraphs.sigmaview.sigma.refresh();
            },
            /*
             * TODO refactor with switchPage()
             */
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
            renderNoteEdit: function(e){
                e.preventDefault();
                window.CorTextGraphs.NoteEdit.render();
                window.CorTextGraphs.navbar.navigate('noteedit');

                console.log("click annot a", $(e.currentTarget));
            },
            editClusterLabel: function(e){
                e.preventDefault();
                e.stopPropagation();
                $('#currentnode .editable-click').editable('toggle');
            },
            render: function() {
                Session.set('selected_node',window.CorTextGraphs.sigmaview.sigma.getNodes(window.location.hash.split('?node=')[1]));
                console.log('rendering sidebar (current node)');
                
                var cluster = Session.get('selected_cluster');
                //console.log('cluster:');
                //console.log(cluster);
                if (_.isObject(cluster)) {
                    cluster.attr.weight = Math.round(cluster.attr.weight);
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
                        clusternote = window.CorTextGraphs.Notes.findOne({
                            _id: newid
                        });
                    }
                    var created_at = new Date(clusternote.created_at);
                    var seconds = (created_at.getSeconds() < 10) ? "0" + created_at.getSeconds() : created_at.getSeconds();
                    cluster.attr.last_update = 'last update: ' +
                        created_at.getDate() + "/" + (created_at.getMonth() + 1) + "/" +
                        created_at.getFullYear() + " " + created_at.getHours() + ":" +
                        seconds
                }
                var neighbors = Session.get('selected_neighbors');
                this.$el.html(Template.nodepanel({
                    node: Session.get('selected_node'),
                    cluster: cluster,
                    neighbors: neighbors
                }));
				$('.node-add-note').click(function(event) {
                        window.CorTextGraphs.NoteEdit.render();
                        event.stopPropagation();
                        $('.new-note').data('source',
                                            $(event.currentTarget).attr(
                                                'data-neighbor-add-note-source'));
                        $('.new-note').editable('toggle');
                    });
				
                if (_.isObject(cluster)) {
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
                                {$set: {
                                    text: params.value,
                                    created_at: Date.now()
                                }});
                        }
                    }).on('save', function(e, params) {
                        cluster.label = params.newValue;
                        //FIXME do not work
                        window.CorTextGraphs.sigmaview.render();
                        window.CorTextGraphs.navbar.navigate('currentnode');
                    });
                }
                if (_.isArray(neighbors)) {
                    var pagesnumber = Math.ceil(
                        Session.get('selected_neighbors').length / 100);
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
                    $('.neighbor-add-note').click(function(event) {
                        var targetId = $(event.currentTarget).attr('data-neighbor-add-note-target');
                        window.CorTextGraphs.NoteEdit.render(null,targetId);
                        event.stopPropagation();
                        $('.new-note').data('target',
                                            $(event.currentTarget).attr(
                                                'data-neighbor-add-note-target'));
                        $('.new-note').editable('toggle');
                    });
                }
                window.CorTextGraphs.navbar.navigate("currentnode");
            },
            /*
             * Common sidebar update function
             */
            switchSidebar: function(event) {
                if (event !== null) {
                    var node_id = $(event.currentTarget)
                        .attr('data-neighbor-switch');
                    var sigma = window.CorTextGraphs.sigmaview.sigma;
                    var node = sigma.getNodes(node_id);
                    console.log('node');
                    console.log(node);
                } else {
                    var sigma = arguments[2];
                    var node = arguments[1];
                }
                if (!node) return;
                if (node.attr.level === 'high') {
                    return;
                }

                window.CorTextGraphs.mainrouter.navigate(
                    window.location.hash.split('?node=')[0] +
                    '?node=' + node.id);

                //sigma.zoomTo(node.x, node.x, 2);
                sigma._core.plotter.drawHoverNode(node);
                var cluster = sigma.getNodes(
                    'node-high-' + node.attr.cluster_index);
                var neighbors = [];
                sigma.iterEdges(
                    function(edge) {
                        var nid = false;
                        if (edge.source == node.id) {
                            nid = edge.target;
                        }
                        else if (edge.target == node.id) {
                            nid = edge.source;
                        }
                        if (!nid) return;
                        var neighbor = sigma.getNodes(nid)
                        if (!neighbor) return;
                        var cluster = sigma.getNodes(
                            'node-high-' + neighbor.attr.cluster_index);
                        if (cluster)
                            neighbor.attr.clusterColor = cluster.color;
                        neighbors.push(neighbor);
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
                this.render();
            },
            defaultSidebar: function() {
                if(window.location.hash.split('?node=')[1] !='null')
                    Session.set('selected_node',window.CorTextGraphs.sigmaview.sigma.getNodes(nodeid));
                else
                    Session.set('selected_node',null);
                this.initialize();
                
                //this.render();
            },
            /*
             * Callback on node hover by sigma.js
             */
            updateSidebar: function(e) {
                if (e === undefined) {
                    this.defaultSidebar();
                    return;
                }
                var node = e.target.getNodes(e.content[0]);
                if (node)
                {
                    window.CorTextGraphs.sidebar.switchSidebar(null, node, e.target);
                    Session.set('selected_node',node);
                    console.log('selected node ',Session.get('selected_node',node));
                }
                    
                else
                    window.CorTextGraphs.sidebar.defaultSidebar();
            }
        });
        window.CorTextGraphs.sidebar = new Sidebar({
            el: document.getElementById('currentnode')
        });
		
    }
    if (window.CorTextGraphs.sigmaview === undefined) {
        var SigmaView = Backbone.View.extend({
            /*
             * Sigma instance
             */
            sigma: null,
            initialize: function() {
                console.log('initializing graph');
                if (this.sigma !== null) {
                    this.sigma.emptyGraph();
                }
            },
            /*
             * initialize sigma instance and draw the graph
             *  TODO add a spinner
             */
            render: function(nodeid) {
                if (nodeid === "null") {
                    nodeid = null;
                    window.CorTextGraphs.sidebar.defaultSidebar();
                }
                this.$el.empty();
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
                        Meteor.subscribe('all-notes', data.meta.title,
                            function() {
                                that.sigma.emptyGraph();
                                that.pushClusters(data, nodeid);
                        });
                    });
            },
            /*
             * low-level graph drawing
            */
            pushGraph: function(object, nodeid) {
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
                        var validID = edge['source'] && edge['source'];
                        validID && that.sigma.addEdge(
                            'edge-low-' + key,
                            'node-low-' + edge['source'],
                            'node-low-' + edge['dest'],
                            edge
                        );
                });
                this.sigma.draw();
                if (nodeid) {
                    var node = this.sigma.getNodes(nodeid);
                    if (node)
                        window.CorTextGraphs.sidebar.switchSidebar(null, node, this.sigma);
                } else {
                    window.CorTextGraphs.sidebar.defaultSidebar();
                }
            },
            /*
             * draw clusters
             */
            pushClusters: function(data, nodeid) {
                console.log("datas for "+nodeid,data);
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
                                node.hoverActive = false;
                                self.sigma.addNode(node.id, node);
                        });
                        that.pushGraph(data, nodeid);
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
