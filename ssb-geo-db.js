var FlumeQuery = require('flumeview-query')
var Reduce = require('flumeview-reduce')

const flumeView = require('flumeview-reduce')
const pull = require('pull-stream')
const get = require('lodash/get')
const mergeWith = require('lodash/mergeWith')

module.exports = {
  name: 'geospatial',
  version: '1.0.3',
  manifest: {
    get: 'async',
    stream: 'source',
    read: 'source'
  },
  init: function (ssbServer, config) {

    var s = ssbServer._flumeUse(
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

    const view = ssbServer._flumeUse('activity', flumeView(
      1.12, // version
      reduceData,
      mapToData,
      null, //codec
      initialState()
    ))

    return {
      get: view.get,
      stream: view.stream,
      read: s.read
    }
  }
}

function reduceData (acc, newData) {

  console.log(acc)
  
  acc = {...acc, ...newData }

  return acc
}

function mapToData (msg) {
  if (msg.value.content.x && msg.value.content.y)
  {
    console.log("msg.value.content", msg.value.content)

    var keyString = msg.value.content.x + '/' + msg.value.content.y
    var return_obj = {}
    return_obj[keyString] = { 
      last_activity: msg.value.timestamp,
    }

    return_obj[keyString].tags = msg.value.content.tags ? msg.value.content.tags : []
    
    return return_obj
  } 
}


function initialState () {
  return {}
}


function isString(x) {
  return Object.prototype.toString.call(x) === "[object String]"
}

