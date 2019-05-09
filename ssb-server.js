var Server = require('ssb-server')
var ssbKeys = require('ssb-keys')
var Config = require('ssb-config/inject')
var host = "localhost"
var config = Config('ssb', {
	host: "localhost",
	blobsPort: 8989,
	connections: { 
	  "incoming": {
	  	"ws": [{
	   		"host": host,
	   	  "scope": ["public", "local"],
	      "port": 8989,
	      "transform": "shs",
	      "http": true
	    }]
	  },
	  "outgoing": {
	    "net": [{ "transform": "shs" }]
	  }
	},
	permissions:
	{
		allow: null,
		deny: null
	},
	logging:
	{
		level: "info"
	}
})

// var keys = ssbKeys.loadOrCreateSync("/Users/joran/.ssb/secret")
var keys = ssbKeys.loadOrCreateSync("secret")

config.keys = keys


// add plugins
Server
  // .use(require('./ssb-trusting'))
  // .use(require('./ssb-clingy'))
  // .use(require('ssb-server/plugins/logging'))
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
  


var server = Server(config)

var manifest = server.getManifest()

console.log("manifest", manifest)