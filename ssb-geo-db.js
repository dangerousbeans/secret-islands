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
    FlumeQuery(3, {indexes:[
      {key: 'pos', value: [['value', 'content', 'x'], ['value', 'content', 'y'], ['value', 'sequence']]}
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