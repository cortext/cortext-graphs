if (Meteor.isServer) {
    // Notes -- {name: String}
    Notes = new Meteor.Collection('notes');
    // Publish complete set of graphs to all clients.
    Meteor.publish('notes', function() {
        return Notes.find();
    });

}
