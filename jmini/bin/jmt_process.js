const JMT = require('./jmt.js');
function IfElement(a, body) {
  this.otherif_arr = [{test:a, consequent:body}];
  this.other_obj = null;
}

IfElement.prototype.otherif = function(a, body) {
  this.otherif_arr.push({
    test:a,
    consequent:body
  })
  return this;
}

IfElement.prototype.other = function(body) {
  this.other_obj = body;

}

JMT.prototype.if = function(a, cb) {
  let obj = new IfElement(a, cb)
  this._collect('if', [obj]);
  return obj;
}


