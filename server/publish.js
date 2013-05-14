if (Meteor.isServer) {
    // Notes -- {name: String}
    Notes = new Meteor.Collection('notes');
    // Publish complete set of a graph's notes
    Meteor.publish('all-notes', function(graph) {
        return Notes.find({
            graph: graph
        });
    });

}
