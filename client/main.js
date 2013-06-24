'use strict';

Meteor.startup(function () {
    if (!Modernizr.canvas) {
        $('#sigma').html(Template.hello(
            {example: false, text: 'sorry, <a href="http://browsehappy.com/">your browser is too old</a>'}));
        return;
    }
    if (window.CorTextGraphs === undefined) {
        window.CorTextGraphs = {};
    }

    window.CorTextGraphs.nav_panels = new nav_panels({
        el: document.getElementById('nav_panels')
    });

    $("#sigma").height(($(window).height() - 53) + "px");
    $("#sigma").width(($(window).width()) + "px");

    window.CorTextGraphs.sigmaview = new GraphView({
        el: document.getElementById('sigma')
    });

    window.CorTextGraphs.mainrouter = new window.CorTextGraphs.MainRouter();

    Backbone.history.start(/*{pushState: true}*/);
});