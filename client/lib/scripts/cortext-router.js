if (Meteor.isClient) {
    Meteor.startup(function() {
        if (window.CorTextGraphs === undefined) {
            window.CorTextGraphs = {};
        }
        if (window.CorTextGraphs.MainRouter === undefined) {
            window.CorTextGraphs.MainRouter = Backbone.Router.extend({
                routes: {
                    'open/*path': 'index'
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

