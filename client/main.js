
if (Meteor.isClient) {
    Meteor.startup(function () {
        if (!Modernizr.canvas) {
            $('#sigma').html(Template.hello({example: false, text: 'sorry, <a href="http://browsehappy.com/">your browser is too old</a>'}));
            return;
        }
        if (window.CorTextGraphs === undefined) {
            window.CorTextGraphs = {};
        }
        if (window.CorTextGraphs.mainrouter === undefined) {
            window.CorTextGraphs.mainrouter = new window.CorTextGraphs.MainRouter();
            Backbone.history.start(/*{pushState: true}*/);
        }
    });
}
