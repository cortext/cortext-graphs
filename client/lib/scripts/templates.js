'use strict';
if (Meteor.isClient) {
    Meteor.startup(function() {
        Session.set('selected_cluster', undefined);
        Session.set('selected_neighbors', undefined);
        Session.set('selected_node', undefined);
        Session.set('panels_state', {'listnodes': 'closed','viewnode': 'closed','listnotes': 'closed','editnotes': 'closed'});
        Session.set('user', {
            username: 'testuser'
        });
    });
}
