// Clingy Plugin
//
// Will follow any connecting id unless already following
module.exports = function (api, opts) {
  api.auth.hook(function (fn, args) {
  	var connecting_id = args[0]
    var our_id = api.whoami().id
    var cb = args[1]

    api.friends.isFollowing({source: our_id, dest: connecting_id}, function(err, following)
    {
    	if(following)
    	{
    		cb(null, {allow: null, deny: null})
    	}
    	else
    	{
    		// Yay more friendssss
    		api.publish({
    			type: "contact",
    			contact: connecting_id,
    			following: true
    		}, function(){
    			cb(null, {allow: null, deny: null})
    		})
    	}
    })    
  })
}
