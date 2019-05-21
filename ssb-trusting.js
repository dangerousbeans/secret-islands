// Trusting Plugin
//
// Will trust any connecting id
module.exports = function (api, opts) {
  api.auth.hook(function (fn, args) {
    var cb = args[1]
    cb(null, { 
    	allow: opts.allow, 
    	deny: opts.deny
    })
  })
}
