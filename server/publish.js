if (Meteor.isServer) {
    // Graphs -- {name: String}
    Graphs = new Meteor.Collection("graphs");
    // Publish complete set of graphs to all clients.
    Meteor.publish('graphs', function () {
        return Graphs.find();
    });

}
