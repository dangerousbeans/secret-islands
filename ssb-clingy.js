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
        console.log("already following:", connecting_id)
    		cb(null, {allow: null, deny: null})
    	}
    	else
    	{
    		// Yay more friendssss
        console.log("stranger! New friend :3", connecting_id)
        
    		api.publish({
    			type: "contact",
    			contact: connecting_id,
    			following: true
    		}, function(){
          console.log("Followed", connecting_id)
        
    			cb(null, {allow: null, deny: null})
    		})
    	}
    })    
  })
}
