if (Meteor.isClient) {
    Meteor.startup(function() {
        if (window.CorTextGraphs === undefined) {
            window.CorTextGraphs = {};
        }
        window.CorTextGraphs.GraphCollection = new Meteor.Collection('graphs');
    });

}
