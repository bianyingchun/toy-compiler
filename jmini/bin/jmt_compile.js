const JMT = require('./jmt.js');
const AST = require('./ast.js');

JMT.prototype._init_compile = function() {
  this.AST = null;
}

JMT.prototype._compile_id = function(id) {//取变量值
  if(id instanceof JMT) {
    id._compile();
    id = id.AST.root.body[0];
  }
  this.AST.add_node('Identifier', id);
}

JMT.prototype._compile_var = function(name, val) {//定义变量
  let init = null;
  if(val instanceof JMT) {
    val._compile();
    init = val.AST.root.body[0];
  } else {
    init = this.AST.nodefacroy.create('Literal', val);
  }
  this.AST.add_node('VariableDeclaration', {
    name: name,
    init: init
  });
}

JMT.prototype._compile_ret = function(val) {
  if(val instanceof JMT) {
    val._compile();
    val = val.AST.root.body[0];
  } else {
    val = this.AST.nodefacroy.create('Literal', val);
  }
  this.AST.add_node('ReturnStatement', val)
}

JMT.prototype.complie_obj = function(obj) {
  this.AST.add_node('ObjectExpression',obj)
}

JMT.prototype._compile_assign = function(left, op, right) {//赋值表达式 +=, =,
  if(right instanceof JMT) {
    right._compile();
    right = right.AST.root.body[0];
  } else {
    right = this.AST.nodefacroy.create('Literal',right)
  }
  this.AST.add_node('AssignExpression', {op:op, left:left, right:right});
  
}

JMT.prototype._compile_calc = function(left, op, right) {// 二元运算
  if(left instanceof JMT) {
    left._compile();
    left = left.AST.root.body[0];
  } else {
    left = this.AST.nodefacroy.create('Literal', left)
  }
  if(right instanceof JMT) {
    right._compile();
    right = right.AST.root.body[0];
  } else {
    right = this.AST.nodefacroy.create('Literal',right)
  } 
  this.AST.add_node('BinaryExpression', {op:op, left:left, right:right});
}

JMT.prototype._compile_define = function(name, args, body) { //定义函数
  let p = this.AST.current;
  this.AST.current = this.AST.add_node('FunctionDeclaration', {name:name, args:args}).body;
  let container = [];
  this.set_temp_sentences(container);
  body();
  container.forEach(s => {
    this['_compile_' + s.name].apply(this, s.args);
  })
  this.set_temp_sentences(undefined);
  this.AST.current = p;
}


JMT.prototype._compile_call = function(name, args) { // 执行函数
  let arr = args.map(item => {
    if(item instanceof JMT) {
      item._compile();
      return item.AST.root.body[0];
    } else { 
      return this.AST.nodefacroy.create('Literal', item)
    }
  })
  this.AST.add_node('CallExpression', {
    name:name,
    args:arr
  });
}

JMT.prototype._compile_if = function(ifobj) {
  let origin = this.AST.current;
  let item = ifobj.otherif_arr.shift();
  let test = this._create_node(item.test);
  let p = this.AST.add_node('IfStatement', {test:test});
  this.AST.current = p.consequent;
  this._compile_block(item.consequent);
  for(let i = 0 ; i < ifobj.otherif_arr.length; i++) {
    let obj = ifobj.otherif_arr[i];
    let node = this._create_node(obj.test)
    p = p.alternate = this.AST.nodefacroy.create('IfStatement',{test:node});
    this.AST.current = p.consequent;
    console.log(this.AST.current)
    this._compile_block(obj.consequent);
  }
  if(ifobj.other_obj) {
    p.alternate = this.AST.nodefacroy.create('BlockStatement',[]);
    this.AST.current = p.alternate;
    this._compile_block(ifobj.other_obj);
  }
  this.AST.current = origin;
}

JMT.prototype._compile_block = function(block) {
  let container = [];
  this.set_temp_sentences(container);
  block();
  container.forEach(s => {
    this['_compile_' + s.name].apply(this, s.args);
  })
  this.set_temp_sentences(undefined);
}

JMT.prototype._create_node = function(traverse) {
  if(traverse instanceof JMT) {
    traverse._compile();
    return traverse.AST.root.body[0];
  } 
  return this.AST.nodefacroy.create('Literal', traverse);
}

JMT.prototype._compile_while = function(a, body) {
  let p = this.AST.current;
  let test = this._create_node(a);
  this.AST.current = this.AST.add_node('WhileStatement', test).body;
  this._compile_block(body);
  this.AST.current = p;
}

JMT.prototype._compile_continue = function() {
  this.AST.add_node('ContinueStatement');
}

JMT.prototype._compile_break = function() {
  this.AST.add_node('BreakStatement');
}

JMT.prototype._compile = function() {
  this.AST = new AST();
  this.c_index = 0;
  this.sentences.forEach(s => {
    this['_compile_' + s.name].apply(this, s.args);
  })
}


