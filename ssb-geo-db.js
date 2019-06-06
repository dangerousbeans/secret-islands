var FlumeQuery = require('flumeview-query')

function isString(x) {
  return Object.prototype.toString.call(x) === "[object String]"
}

exports.name = 'geospatial',
exports.manifest = {
    read: 'source'
  }
  
exports.init = (sbot, opts) => {
  console.log("initalizing geoDB")
  var s = sbot._flumeUse(
    'geoDB', 
    FlumeQuery(2, {indexes:[
      {key: 'poz', value: [['value', 'content', 'x'], ['value', 'content', 'y']]}
    ]})
  )

  var read = s.read
  s.read = function (opts) {
    if(!opts) opts = {}
    if(isString(opts))
      opts = {query: JSON.parse(opts)}
    else if(isString(opts.query))
      opts.query = JSON.parse(opts.query)
    return read(opts)
  }
  return s
}