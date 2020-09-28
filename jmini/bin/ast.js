
let NodeFactory = {
  create:function(type, args){
    return new this[type](args);
  },
  Program : function(args) {
    this.type = 'program';
    this.body = [];
  },

  Identifier : function(name) {//标识符
    this.type = 'identifier'; 
    this.name = name
  },

  Literal : function(value) {
    this.type = 'literal';
    this.value = value
  },

  VariableDeclaration : function(option) {
    this.type = 'variableDeclaration';
    this.id = new NodeFactory.Identifier(option.name)
    this.init = option.init;
    this.kind = option.kind || 'var'
  },

  AssignExpression : function (option) {
    this.type = 'assignExpression';
    this.operator = option.op;
    this.left = new NodeFactory.Identifier(option.left)
    this.right = option.right
  },

  BinaryExpression :function(option) { //
    this.type = 'binaryExpression';
    this.operator = option.op;
    this.left = option.left;
    this.right = option.right
  },

  FunctionDeclaration : function(option) {
    this.type = 'functionDeclaration';
    this.id = new NodeFactory.Identifier(option.name)
    this.params = option.args.map(item => {
      return new NodeFactory.Identifier(item)
    })
    this.body = new NodeFactory.BlockStatement([]);
  },

  IfStatement : function(option) {
    this.type = 'ifStatement'
    this.test = option.test;
    this.consequent = new NodeFactory.BlockStatement([]);
    this.alternate = option.alternate;
  },

  BlockStatement : function(body) {
    this.type = 'blockStatement';
    this.body = body || [];
  },

  ReturnStatement : function(val) {
    this.type = 'returnStatement';
    this.argument = val;
  },

  MemberExpression :function(option) {
    this.type = 'memberExpression';
    this.object = option.object;
    this.property = option.property;
  },

  ObjectExpression :function(obj) { //需要细化粒度
    this.type = 'objectExpression';
    this.content = obj
  },
  
  CallExpression: function(option) { //可能调用的是对象成员函数，需另外处理
    this.type = 'callExpression';
    let path_arr = option.name.split('.');
    let node = new NodeFactory.Identifier(path_arr.shift());
    for(let i = 0; i < path_arr.length; i++) {
      node = new NodeFactory.MemberExpression({
        object : node,
        property:new NodeFactory.Identifier(path_arr[i])
      })
    }
    this.callee = node;
    this.arguments = option.args;
  },

  WhileStatement: function(test) {
    this.type = 'whileStatement';
    this.test = test;
    this.body = new NodeFactory.BlockStatement([]);
  },
  BreakStatement: function() {
    this.type = 'breakStatement';
  },
  ContinueStatement : function() {
    this.type = 'continueStatement';
  },
  updateExpression:function() {

  }
}


function AST() {
  this.nodefacroy = NodeFactory;
  this.root = this.current =  NodeFactory.create('Program');
}


AST.prototype.add_node = function(type, arg) {
  let node  = NodeFactory.create(type, arg);
  this.current.body.push(node);
  return node;
}

module.exports = AST;

