<template>
  <div class="container">
    <div class="fb-profile">
      <div class="fb-image-profile card vue-avatar-cropper-demo text-center">
        <div class="card-body">
          <img :src="avatar" class="card-img avatar" />
          <div class="card-img-overlay">
          </div>
          <h5 class="card-title mb-0">{{ author.authorName }}</h5>
        </div>          
      </div>
    </div>
    <div>
     
      <p>
        <h1 class="lead">No guilds</h1>
      </p>

    </div>
  </div> <!-- /container -->  
</template>

<script>
import sbotLibs from './../sbot'
import pull from 'pull-stream'
import GIXI from 'gixi'
pull.paraMap = require('pull-paramap')
var md = require('ssb-markdown')

export default {
  name: 'profile',
  props: [ 'id' ],
  data() {
    return {
      avatar: "https://via.placeholder.com/90x90",
      author: "...",
      
    }
  },
  methods: {
    name_loaded: function(err, name)
    {
      this.$data.author = name

      // temporary avatar based on author
      if(this.$data.avatar == "https://via.placeholder.com/90x90")
      {
        var imageData = new GIXI(300, this.$props.id).getImage();
        this.$data.avatar = imageData
      }
    },
    avatar_loaded: function(err, avatar)
    {
      if(avatar)
        this.$data.avatar = "http://ssb.guild.land/blobs/get/" + avatar
    },

  },

  mounted: function()
  {
    // Async fetch and connect ssb
    this.$ssb.then((ssb) => {
      // console.log(ssb.getAddress("public", function(err, address) { console.log(address) } ))
      // debugger
      sbotLibs.displayName(ssb, this.$props.id, this.name_loaded)
      sbotLibs.avatar(ssb, this.$props.id, this.avatar_loaded)   
    })
  },
  
}
</script>

<style scoped>
 
.vue-avatar-cropper-demo {
  max-width: 18em;
  margin: 0 auto;
}
.avatar {
  width: 160px;
  border-radius: 6px;
  display: block;
  margin: 20px auto;
}
.card-img-overlay {
  display: none;
  transition: all 0.5s;
}
.card-img-overlay button {
  margin-top: 20vh;
}
.card:hover .card-img-overlay {
  display: block;
}

.background
{
  height: 10em;
  background-color: grey;
}

.fb-profile img.fb-image-lg{
  z-index: 0;
  width: 100%;  
  margin-bottom: 10px;
}

.fb-image-profile
{
  margin: 10px 0px 50px;
  z-index: 9;
  width: 35%; 
}

@media (max-width:768px)
{

.fb-image-profile
{
    margin: -45px 10px 0px 25px;
    z-index: 9;
    width: 20%; 
}
}
</style>  