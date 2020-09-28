let JMT = require('../index.js');
let j = new JMT();


j.var('a', 1);
j.var('b', calc(id('a'),'+', 2));
// j.assign('b', '*=', 2);
// j.call('console.log',[id('b')]);
j.define('func', ['b'], function(){
  j.assign('b', '*=', 2);
  j.ret(id('b'))
  // j.define('func2',[], function(){
  //   j.var('c',2)
  //   j.return(id('c'))
  // })
  // j.call('console.log',[call('func2',[])])
})

// // j.assign('b', '+=', 3);

// j.call('console.log', [call('func',[2])]);
//---------------if----------------------------
// j.var('a',1);
// j.var('b',1);
// j.if(calc(id('a'),'>',id('b')),
//   function(){
//     j.call('console.log',[1])
//     j.call('console.log',[2])
//   }
// ).other(
//   function(){
//     j.call('console.log',[2])
//   }
//   )
//---------------while----------------------------
j.var('a',3)
j.while(id('a'),function(){
  j.assign('a', '-=', 1);
  j.if(calc(id('a'), '==', 2), function(){
    j.call('console.log',['------------------'])
    j.continue()
  })
  j.call('console.log',[id('a')]);
})

j._compile();
j._run();

console.log(j.AST.root.body[1])
