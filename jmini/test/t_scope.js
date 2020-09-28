const ScopeChain = require('../bin/scope_chain.js')

let s = new ScopeChain();
// var a = 1;
// var b = 2;
// let f = function() {
//   var a = 3;
//   console.log(a);
//   console.log(b);
//   b = 4;
//   console.log(b)
// }
// f();
// c = 2 //报错

s.declare('a');
s.declare('b');
s.assign('a', 1);
s.assign('b', 2);

s.add_scope();
s.declare('a');
s.assign('a',3);
let a = s.get('a'); console.log(a);
let b = s.get('b'); console.log(b);
s.assign('b', 4);
 b = s.get('b'); console.log(b);

s.assign('c',2); //报错
