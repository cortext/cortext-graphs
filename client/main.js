
if (Meteor.isClient) {
    Meteor.startup(function () {
        if (window.CorTextGraphs === undefined) {
            window.CorTextGraphs = {};
        }
        if (window.CorTextGraphs.mainrouter === undefined) {
            window.CorTextGraphs.mainrouter = new window.CorTextGraphs.MainRouter();
            Backbone.history.start(/*{pushState: true}*/);
        }
    });
}
