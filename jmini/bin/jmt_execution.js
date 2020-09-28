const JMT = require('./jmt.js');
const NodeIterator = require('./iterator.js')
const Scope = require('./scope.js');

JMT.prototype._run = function() {
  const globalScope = new Scope('function');
  this.nodeIterator = new NodeIterator(null, globalScope);
  this.nodeIterator.traverse(this.AST.root);
}