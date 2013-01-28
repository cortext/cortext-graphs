if (Meteor.isClient) {
    Meteor.startup(function() {

        var rightlist = document.getElementById('navbar-right');
        var navbar = document.getElementById('navbar-fluid');
        navbar.insertBefore( Meteor.render(function () {
            if (Session.get('title')) {
                return '<a onclick="javascript:void(0)" class="brand graph-title"><small class="graph-title-text">'+
                    Session.get('title')
                    +'</small></a>';
            } else {
                return "";
            }
        }), rightlist );

        if (window.CorTextGraphs.MainRouter === undefined) {
            window.CorTextGraphs.MainRouter = Backbone.Router.extend({
                routes: {
                    '': 'default',
                    'open/:path/*clusterpath?node=:nodeid': 'index'
                },
                default: function() {
                    Session.set('title', '');
                    $('#sigma').html(Template.hello(
                        {example: true, text: 'Welcome to CorText Graphs'}));
                },
                index: function(path, clusterpath, nodeid) {
                    Session.set('path', decodeURIComponent(path));
                    Session.set('clusterpath', decodeURIComponent(clusterpath));
                    window.CorTextGraphs.sigmaview.render(nodeid);
                }
            });
        }
    });
}

