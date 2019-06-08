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

    var sbot = ssbServer

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

    
    console.log(' geo activity ')

    const view = ssbServer._flumeUse('activity', flumeView(
      1.9, // version
      reduceData,
      mapToData,
      null, //codec
      initialState()
    ))


    console.log('init FlumeView', view)

    console.log('VIEW get', view.get)


    return {
      get: view.get,
      stream: view.stream,
      read: s.read
    }
  }
}

function reduceData (acc, newData) {

  console.log(acc)
  // console.log(newData)

  acc = {...acc, ...newData }

  return acc
}

function mapToData (msg) {
  if (msg.value.content.x && msg.value.content.y)
  {
    var keyString = msg.value.content.x + '/' + msg.value.content.y
    var return_obj = {}
    return_obj[keyString] = msg.value.timestamp
    return return_obj
  } 
}


function initialState () {
  return {}
}


function isString(x) {
  return Object.prototype.toString.call(x) === "[object String]"
}

