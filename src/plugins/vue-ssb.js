/* eslint-disable */

// plugin.js
const ssbClient = require('ssb-client')
const ssbKeys = require('ssb-keys')
var keys = ssbKeys.loadOrCreateSync('mykeys')

export default {

  // The install method will be called with the Vue constructor as         
  // the first argument, along with possible options
  install (Vue) {
    
    // replace this with the output of `sbot ws.getAddress`
    ssbClient(keys, {
      remote: "ws://localhost:8989~shs:TXKFQehlyoSn8UJAIVP/k2BjFINC591MlBC2e2d24mA=",
      manifest: require('./../../manifest.json'),
      caps: {
        shs: '1KHLiKZvAvjbY1ziZEHMXawbCEIM6qwjCDm3VYRan/s=',
      },
    }, function (err, ssb) {
      if (err) throw err

      console.log(ssb)
      console.log('SUCCESS!')

      Vue.prototype.$ssb_client = ssb
    })        
  }
}