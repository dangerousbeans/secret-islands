var Server = require('ssb-server')
var ssbKeys = require('ssb-keys')
var FlumeQuery = require('flumeview-query')
var Config = require('ssb-config/inject')
var host = "::"
var config = Config('ssb', {
	blobsPort: 9000,
	local: true,
	
	permissions:
	{
		allow: null,
		deny: null
	},
	logging:
	{
		level: "info"
	},
  connections: { incoming: {
      net: [{
        host: host,
        port: 8008,
        scope: ['device', 'local', 'public'],
        transform: 'shs',

      }],
      ws: [{
        host: host,
        port: 8989,
        scope: ['device', 'local', 'public'],
        transform: 'shs',
        "http": true
      }]
    }}
})

var keys = ssbKeys.loadOrCreateSync("secret")

config.keys = keys

function isString(x) {
  return Object.prototype.toString.call(x) === "[object String]"
}

const geoDB = {
  name: 'geospatial',
  manifest: {
    read: 'source'
  },
  init: (sbot, opts) => {
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
}


// add plugins
Server
  .use(require('./ssb-trusting'))
  // .use(require('./ssb-clingy'))
  .use(require('ssb-server/plugins/plugins'))
  .use(require('ssb-gossip'))
  .use(require('ssb-replicate'))
  .use(require('ssb-friends'))
  .use(require('ssb-backlinks'))
  .use(require('ssb-query'))
  .use(require('ssb-blobs'))
  .use(require('ssb-links'))
  .use(require('ssb-ws'))
  .use(require('ssb-ebt'))
  .use(require('ssb-ooo'))
  .use(require('ssb-server/plugins/local')) 
  .use(geoDB)


var server = Server(config)

// console.log(server.manifest())