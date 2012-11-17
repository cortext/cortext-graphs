if (Meteor.isClient) {
    Meteor.startup(function() {
        if (!Session.get('title')) {
            Session.set('title', '');
        }
        var rightlist = document.getElementById('navbar-right');
        var navbar = document.getElementById('navbar-fluid');
        navbar.insertBefore( Meteor.render(function () {
            return '<a onclick="javascript:void(0)" class="brand"><small>'+
                Session.get('title')
                +'</small></a>';
        }), rightlist );
        if (window.CorTextGraphs === undefined) {
            window.CorTextGraphs = {};
        }
        if (window.CorTextGraphs.MainRouter === undefined) {
            window.CorTextGraphs.MainRouter = Backbone.Router.extend({
                routes: {
                    '': 'default',
                    'open/*path': 'index'
                },
                default: function() {
                    Session.set('title', '');
                    $('#sigma').html(Template.hello());
                },
                index: function(path) {
                    path = decodeURIComponent(path);
                    Session.set('path', path);
                    window.CorTextGraphs.sigmaview.render();
                }
            });
        }
    });
}

