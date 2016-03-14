### What

- MutationObserver abstraction using Kefir streams for added, removed and 
  attribute modified elements
- Useful for writing browser extensions
- It's not meant to be a general purpose tool for any environment. This is
  useful for existing Kefir projects, otherwise it's like using 10kb of js
  to just watch for dom mutations. 

### Why

- Single page apps are everywhere, one can't just listen to `DOMContentLoaded` to
  to start working with document contents.
- Because MutationObservers are pretty uncomfortable to work with.
- Handling async data is suitible for streams
- To play with latest es6 syntax I guess.. idno..

### How
Exposes the `obsAdded`, `obsRemoved` and `obsAttributes` for creating streams

#### `obsAdded(root: Node, selector: String, subtree: Boolean)`
Creates a stream emitting nodes already added and newly added nodes which 
matches `selector` for aslong as the stream has subscribers. 
If `subtree` is set, nodes matching `selector` added to anywhere in the subtree
of `root` will be emitter.

#### `obsRemoved(root: Node, selector: String, subtree: Boolean)`
Creates a stream emitting nodes removed from `root` which matches `selector` 
for aslong as the stream has subscribers. If `subtree` is set, nodes matching 
`selector` removed from anywhere in the subtree of `root` will be emitter.

#### `obsAttributes(root: Node, attributeFilter: [String])`
Creates a stream emitting `root` when an attribute matching `attributeFilter` 
(optional) is changed for as long as the stream has subscribers.

