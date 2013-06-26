Cortext Graphs - Tech notes
===========================

# Routes

PROPOSAL



## dashboard

```

/

```

## app mode

Where `@` denote a variable. The logic is to get a permanent url for each view and use the `#` locator only to perform visual focus actions.

Nodes can be node or cluster. Might be confusing and will change if it is the case.

```

/@graph_id/

/@graph_id/list:nodes
/@graph_id/list:nodes#node:@node_id
/@graph_id/list:nodes#orderby:@order_rule

/@graph_id/list:annotations
/@graph_id/list:annotations@#annotation:@annotation_id

/@graph_id/node:@node_id
/@graph_id/node:@node_id#annotation:@annotation_id

```

#Collection
For server-side published datasets, see `server/publish.js`.



For client-side collections, see `client/scripts/collections/`. 
- `notes.js` : define CorTextGraphs.Notes on the published collection 'notes'

##Datasets (publish)
- `all-notes` : find all notes for the current graph (subscribe part in `client/lib/scripts/views/main.js` line 451 for sigmaView )

#Views

- Main javascript file for views : `client/lib/scripts/views/main.js`
The side is organized as follows : 
- `notelist`: a view only for notes list
- `sidebar` : a view for the whole sidebar witch includes a render of notelist and current node, neighbour and cluster informations. Sidebar view takes node as argument.
- `sigmaView`: implementation of sigma library to display the graph

##Templates html/js
All templates are in client/index.html: 
- `lastnotes` : Last activity notes
- `notelist` : Sidebar annotation list
- `nodepanel` : Sidebar node informations (cluster, neighbours)

nb.  the html element #notelist is filled with either notelist or lastnotes templates, depending if their is a current node selected.

#Misc
## Js
- $el is the jQuery html element given to a view when it is created (ex : `mySidebar = new Sidebar{el: '#sidebar'}` will allow you to use `$el.html` as the jQuery element `$('#sidebar').html()`) : each view in backbone has an html element attatched.

## Meteor how to ?
- `declare a public asset (like  img or css) directly inside a html file` 
Store your asset in the /public directory, and reference it directly, for example : 
    ``` <img src='logo-cortext.png'/> ̀`` 

##Backbone how to ?
- navigate to a specific router url : 
use ```window.CorTextGraphs.mainrouter.navigate(theUrl, true)``` : the 'true' value is used to effectively navigate to the url. If not provided, only the window url is changed.