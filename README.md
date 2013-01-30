cortext-graphs
==============

Système de visualisation pour l’annotation web de cartographie de réseau

## License

* [CorText Graphs](https://github.com/cortext/cortext-graphs/)" is a [Free Software under GNU AGPL](http://www.gnu.org/licenses/agpl-3.0.html) made by 
[the Cortext research team at IFRIS Universit&eacute; Paris-Est](http://www.cortext.net/)

## Building blocks

* It's a single page application build upon [Backbone.js](http://backbonejs.org/)
* It's driven by the [Meteor framework](http://meteor.com), including (but not only) [MongoDB](http://www.mongodb.org) and [Handlebars templates](http://handlebarsjs.com/)
* Graph visualization is handled by [Sigma.js](http://sigmajs.org/) leveraging [HTML5's CANVAS](https://developer.mozilla.org/fr/docs/HTML/Canvas)
  * note that a slightly modified version of sigma.js has been developed to support the cluster's layer need for this application
* Layout and style is made using [Twitter Bootstrap](http://twitter.github.com/bootstrap/)

## Quick Start

* install and configure [Meteor](http://docs.meteor.com/) version >= 0.5.0

```
    curl https://install.meteor.com | /bin/sh
```

* [supported platforms](https://github.com/meteor/meteor/wiki/Supported-Platforms)
* clone this repository
* start on http://localhost:3000

```
    meteor
```

## Deploy

* on meteor.com servers, eg. on http://cortext.meteor.com

    meteor deploy cortext

* on your own server with node >= 0.8 and MongoDB:

    meteor bundle myapp.tgz
    > log into your server
    PORT=3000 MONGO_URL=mongodb://localhost:27017/cortextgraphs node bundle/main.js

## Structure

* `public` directory contains public static files served a the server's root path
* `client` contains all the client-side HTML, Javascript and CSS of this application
* `server` contains files containing server-side data collections: for now its only a `notes` collection
