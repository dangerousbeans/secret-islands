var Server = require('ssb-server')
var ssbKeys = require('ssb-keys')
var Config = require('ssb-config/inject')
var config = Config('ssb', {
	connections: { 
	  "incoming": {
	   "ws": [{
	      "scope": ["device"],
	      "port": 9000,
	      "transform": "shs",
	      "http": true
	    }]
	  },
	  "outgoing": {
	    "net": [{ "transform": "shs" }]
	  }
	},
	logging:
	{
		level: "info"
	}
})

var keys = ssbKeys.loadOrCreateSync("/Users/joran/.ssb/secret")
config.keys = keys

// add plugins
Server
  .use(require('ssb-server/plugins/master'))
  .use(require('ssb-gossip')) // this causes same error
  .use(require('ssb-replicate'))
  .use(require('ssb-backlinks'))
  .use(require('ssb-query'))
  .use(require('ssb-blobs'))
  .use(require('ssb-ws'))


var server = Server(config)

var manifest = server.getManifest()

console.log("manifest", manifest)