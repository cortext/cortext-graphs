// Notes -- {name: String}
Notes = new Meteor.Collection('notes');
// Publish complete set of a graph's notes
Meteor.publish('all-notes', function(graph) {
    return Notes.find({
      graph: graph
    });
});

Descriptions = new Meteor.Collection('descriptions');

Meteor.publish('description', function(options){
  check(options.graph, String);
  check(options.node, String);

  return Descriptions.find({
    graph: options.graph,
    node : options.node
  });
});

Graphs = new Meteor.Collection('graphs');

Meteor.publish('graphs', function(){
  return Graphs.find({});
});

Meteor.publish('graph', function(graph_short_id){
  return Graphs.find({
    short_id : graph_short_id
  });
});