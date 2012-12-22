if (Meteor.isClient) {
    Meteor.startup(function() {
        /* Notes = {
         *   text: String,
         *   format: String, 'Markdown' | 'Raw',
         *   created_at: Datetime,
         *   created_by: String,
         *   graph: String,
         *   type: 'cluster' | 'node' | 'edge',
         *   target: String, node id, optional,
         *   source: String, node id,
         *   _id: ObjectId
         * }
        */
        if (window.CorTextGraphs === undefined) {
            window.CorTextGraphs = {};
        }
        window.CorTextGraphs.Notes = new Meteor.Collection('notes');
        // Publish complete set of graphs to all clients.
        Meteor.subscribe('notes', function() {
            return window.CorTextGraphs.Notes.find();
        });
    });

}
