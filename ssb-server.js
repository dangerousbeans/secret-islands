var Server = require('ssb-server')
var ssbKeys = require('ssb-keys')
var Config = require('ssb-config/inject')
var host = "localhost"
var config = Config('ssb', {
	host: host,
	blobsPort: 8989,
	connections: { 
	  "incoming": {
	    "ws": [{
	   		"host": host,
	   	  "scope": ["public", "local"],
	      "port": 8989,
	      "transform": "shs",
	      "http": true
	    }],
	    "net": [{ "port": 8008, "host": "localhost", "scope": "local", "transform": "noauth" }],
            "unix": [{ "scope":"local", "transform":"noauth", "server": true }],
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

var keys = ssbKeys.loadOrCreateSync("secret")

config.keys = keys


// add plugins
Server
  .use(require('./ssb-trusting'))
  // .use(require('./ssb-clingy'))
  // .use(require('ssb-server/plugins/logging'))
  .use(require('ssb-server/plugins/plugins'))
  .use(require('ssb-gossip'))
  .use(require('ssb-replicate'))
  .use(require('ssb-backlinks'))
  .use(require('ssb-query'))
  .use(require('ssb-blobs'))
  .use(require('ssb-ws'))
  .use(require('ssb-ebt'))
  .use(require('ssb-ooo'))
  .use(require('ssb-server/plugins/local')) 


var server = Server(config)

