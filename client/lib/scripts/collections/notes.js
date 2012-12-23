if (Meteor.isClient) {
    Meteor.startup(function() {
        if (!Session.get('title')) {
            Session.set('title', '');
        }
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
        // Publish complete set of graphs to all clients.
        //Meteor.autosubscribe(function() {
        //});

        window.CorTextGraphs.Notes = new Meteor.Collection('notes');
    });
}
