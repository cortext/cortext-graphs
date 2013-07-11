'use strict';

Meteor.startup(function() {

    var rightlist = document.getElementById('navbar-right');
    var navbar = document.getElementById('navbar-fluid');
    navbar.insertBefore( Meteor.render(function () {
        if (Session.get('title')) {
            return '<a onclick="javascript:void(0)" class="brand graph-title"><small class="graph-title-text">'+
                Session.get('title')
                +'</small></a>';
        } else {
            return "";
        }
    }), rightlist );

    if (window.CorTextGraphs.MainRouter === undefined) {
        window.CorTextGraphs.MainRouter = Router;
    }
});