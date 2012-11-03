if (Meteor.isClient) {
    Meteor.startup(function() {
        if (window.CorTextGraphs === undefined) {
            window.CorTextGraphs = {};
        }
        if (window.CorTextGraphs.sigmaview === undefined) {
            var SigmaView = Backbone.View.extend({
                initialize: function() {
                    this.$el.data('sigma', sigma.init(this.el));
                },
                render: function() {
                    $.get(Session.get('path'),
                                function(data, textStatus) {
                                    console.log(data);
                                });
                }
            });
            window.CorTextGraphs.sigmaview = new SigmaView({
                el: $('#sigma').get(0)
            });

            /*new Backbone.Layout({
                template: 'body',
                views: {
                    '#sigma': new SigmaView()
                }
            })*/
        }
    });
}
