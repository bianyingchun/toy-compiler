function JMT(){ this._init()}

JMT.prototype._init = function() {
  this.sentences = [];
  this.set_up_op();
  this._init_compile();
}

JMT.prototype.set_up_op = function() {
  let self = this;
  ['var', 'assign', 'define','id', 'calc','call','ret','obj','while','break','continue'].forEach(name => {
    JMT.prototype[name] = function() {
      let args = Array.prototype.slice.call(arguments);
        this._collect(name, args);
        return self;
    }

    global[name] = function() {
      let g = new JMT();
      let args = Array.prototype.slice.call(arguments); 
      return g[name].apply(g, args);
    }
  })
}

function Sentence(name, args) {
  this.name = name;
  this.args = args;
}

JMT.prototype.create_sentence = function (name, args) {
  return new Sentence(name, args)
}

JMT.prototype.set_temp_sentences = function(container) {
  this.temp_sentence = container;
}

JMT.prototype._collect = function (name, args) {
  let s = this.create_sentence(name, args)
  if(this.temp_sentence) {
    this.temp_sentence.push(s)
  } else {
    this.sentences.push(s)
  }
}

module.exports = JMT;