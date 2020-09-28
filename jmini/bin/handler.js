const { MemberValue } = require('./value.js')
const Signal = require('./signal')
const NodeHandler = {
  program(nodeIterator) {
    nodeIterator.node.body.forEach(node => {
      nodeIterator.traverse(node);
    })
  },
  variableDeclaration(nodeIterator) {
    let node = nodeIterator.node;
    const value = node.init ? nodeIterator.traverse(node.init) : undefined;
    if(nodeIterator.scope.type === 'block' && node.kind === 'var') {
      nodeIterator.scope.parentScope.declare(node.id.name, value, node.kind)
    } else {
      nodeIterator.scope.declare(node.id.name, value, node.kind)
    }
  },
  identifier(nodeIterator) {
    if(nodeIterator.node.name === 'undefined') return undefined;
    return nodeIterator.scope.get(nodeIterator.node.name).value;
  },  
  literal (nodeIterator) {
    return nodeIterator.node.value
  },
  functionDeclaration(nodeIterator) {
    const fn = NodeHandler.functionExpression(nodeIterator);
    nodeIterator.scope.varDeclare(nodeIterator.node.id.name, fn);
    return fn 
  },
  returnStatement(nodeIterator) {
    let value;
    if(nodeIterator.node.argument) {
      value = nodeIterator.traverse(nodeIterator.node.argument)
    }
    return Signal.Return(value);
  },
  functionExpression (nodeIterator) {
    const node = nodeIterator.node;
    const fn = function() {
      const scope = nodeIterator.createScope('function');
      scope.constDeclare('this', this);
      scope.constDeclare('arguments', arguments);
      node.params.forEach((param, index) =>{
        const name = param.name;
        scope.varDeclare(name, arguments[index])
      })
      const signal = nodeIterator.traverse(node.body, {scope:scope});
      //return 
      if (Signal.isReturn(signal)) {
        return signal.value
      }
    }
    Object.defineProperties(fn, {
      name: { value: node.id ? node.id.name : '' },
      length: { value: node.params.length }
    })
    return fn
  },
  blockStatement(nodeIterator) {
    let scope = nodeIterator.createScope('block');
    for(let node of nodeIterator.node.body) {
      let signal = nodeIterator.traverse(node, {scope});
      if (Signal.isSignal(signal)) { //'return', break, continue
        return signal
      }
    }
  },
  ifStatement(nodeIterator) {
    if(nodeIterator.traverse(nodeIterator.node.test)) {
      return nodeIterator.traverse(nodeIterator.node.consequent);
    } else if(nodeIterator.node.alternate) {
      return nodeIterator.traverse(nodeIterator.node.alternate)
    }
  },

  whileStatement(nodeIterator) {
    while(nodeIterator.traverse(nodeIterator.node.test)) {
      let signal = nodeIterator.traverse(nodeIterator.node.body);
      if(Signal.isBreak(signal)) {
        break;
      } else if(Signal.isContinue(signal)) {
        continue;
      } else if(Signal.isReturn(signal)){
        return signal;
      } 
    }
  },

  breakStatement(nodeIterator) {
    return Signal.Break()
  },
  
  continueStatement(nodeIterator) {
    return Signal.Continue();
  },

  callExpression(nodeIterator) {
    const fn = nodeIterator.traverse(nodeIterator.node.callee);
    const args = nodeIterator.node.arguments.map(arg => nodeIterator.traverse(arg))
    let value;
    if(nodeIterator.node.callee.type === 'memberExpression') {
      value = nodeIterator.traverse(nodeIterator.node.callee.object)
    }
    return fn.apply(value, args);
  },

  memberExpression(nodeIterator) {
    const obj = nodeIterator.traverse(nodeIterator.node.object)
    const name = nodeIterator.node.property.name;
    return obj[name];
  },
  binaryExpressionOperatortraverseMap: {
    '==': (a, b) => a == b,
    '!=': (a, b) => a != b,
    '===': (a, b) => a === b,
    '!==': (a, b) => a !== b,
    '<': (a, b) => a < b,
    '<=': (a, b) => a <= b,
    '>': (a, b) => a > b,
    '>=': (a, b) => a >= b,
    '<<': (a, b) => a << b,
    '>>': (a, b) => a >> b,
    '>>>': (a, b) => a >>> b,
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
    '%': (a, b) => a % b,
    '|': (a, b) => a | b,
    '^': (a, b) => a ^ b,
    '&': (a, b) => a & b,
    'in': (a, b) => a in b,
    'instanceof': (a, b) => a instanceof b
  },
  binaryExpression(nodeIterator) { //双目运算
    const a = nodeIterator.traverse(nodeIterator.node.left);
    const b = nodeIterator.traverse(nodeIterator.node.right);
    return NodeHandler.binaryExpressionOperatortraverseMap[nodeIterator.node.operator](a,b)
  },
  assignOperatortraverseMap: {
    '=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] = v : value.value = v,
    '+=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] += v : value.value += v,
    '-=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] -= v : value.value -= v,
    '*=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] *= v : value.value *= v,
    '/=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] /= v : value.value /= v,
    '%=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] %= v : value.value %= v,
    '**=': () => { throw new Error('canjs: es5 doen\'t supports operator "**=') },
    '<<=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] <<= v : value.value <<= v,
    '>>=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] >>= v : value.value >>= v,
    '>>>=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] >>>= v : value.value >>>= v,
    '|=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] |= v : value.value |= v,
    '^=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] ^= v : value.value ^= v,
    '&=': (value, v) => value instanceof MemberValue ? value.obj[value.prop] &= v : value.value &= v
  },
  assignExpression(nodeIterator) {
    const node = nodeIterator.node;
    const value = getIndentifierOrMemberValue(node.left, nodeIterator);
    return NodeHandler.assignOperatortraverseMap[node.operator](value, nodeIterator.traverse(node.right))
  },
}
function getPropertyName (node, nodeIterator) {
  if (node.computed) {
    return nodeIterator.traverse(node.property)
  } else {
    return node.property.name
  }
}

function getIndentifierOrMemberValue(node, nodeIterator) {
  if (node.type === 'identifier') {
    return nodeIterator.scope.get(node.name)
  } else if (node.type === 'memberExpression') {
    const obj = nodeIterator.traverse(node.object)
    const name = getPropertyName(node, nodeIterator)
    return new MemberValue(obj, name)
  } else {
    throw new Error(`canjs: Not support to get value of node type "${node.type}"`)
  }
}
module.exports = NodeHandler;