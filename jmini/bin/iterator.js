const nodeHandler = require('./handler.js')
const Scope = require('./scope')

class NodeIterator {
  constructor (node, scope) {
    this.node = node
    this.scope = scope
    this.nodeHandler = nodeHandler
  }

  traverse (node, options = {}) {
    const scope = options.scope || this.scope
    const nodeIterator = new NodeIterator(node, scope)
    const _eval = this.nodeHandler[node.type]
    if (!_eval) {
      throw new Error(`canjs: Unknown node type "${node.type}".`)
    }
    return _eval(nodeIterator)
  }

  createScope (blockType = 'block') {
    return new Scope(blockType, this.scope)
  }
}

module.exports = NodeIterator