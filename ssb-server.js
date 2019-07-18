var Server = require('ssb-server')
var ssbKeys = require('ssb-keys')
var Config = require('ssb-config/inject')
var host = "ssb.guild.land"
var config = Config('ssb', {
	host: host,
	blobsPort: 8989,
	connections: { 
	  "incoming": {
	    "ws": [{
	   		"host": "localhost",
	   	  "scope": ["public", "local"],
	      "port": 8989,
	      "transform": "shs",
	      "http": true
	    }],
	    "net": [
				{ 
					"scope": "device", 
					"port": 8009, 
					"host": "134.209.101.27", 
					"transform": "noauth" 
				},
				{ 
					"scope": "public", 
					"external": [ host ],
					"host": "0.0.0.0",
					"transform": "shs", 
					"port": 8008 
				},
	    ],
      "unix": [
      	{ 
      		"scope":"device", 
      		"transform":"noauth", 
      		"server": true 
      	}
      ],
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
  .use(require('./ssb-geo-db'))
  .use(require('ssb-clingy'))
  .use(require('ssb-server/plugins/unix-socket'))
  .use(require('ssb-server/plugins/plugins'))
  .use(require('ssb-gossip'))
  .use(require('ssb-replicate'))
  .use(require('ssb-friends'))
  .use(require('ssb-backlinks'))
  .use(require('ssb-invite'))
  .use(require('ssb-query'))
  .use(require('ssb-blobs'))
  .use(require('ssb-links'))
  .use(require('ssb-ws'))
  .use(require('ssb-ebt'))
  .use(require('ssb-ooo'))
  .use(require('ssb-server/plugins/local')) 


var server = Server(config)

