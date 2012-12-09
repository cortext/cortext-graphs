
if (Meteor.isClient) {
    Meteor.startup(function() {
        Session.set('selected_cluster', undefined);
        Session.set('selected_neighbors', undefined);
        Session.set('selected_node', undefined);
        Template.nodepanel.rendered = function() {
            $(this.findAll('.cluster')).editable({
                type: 'textarea',
                title: 'set a label for the cluster',
                pk: 1,
                enable: true
            });
        };
    });
}
