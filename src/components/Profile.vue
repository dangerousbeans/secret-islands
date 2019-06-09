<template>
  <div class="container">
    <div class="fb-profile">
        <div align="left" class="background" alt="bg Profile image"/>
        <img align="left" class="fb-image-profile img-thumbnail" :src="avatar" alt="Profile image"/>
        <div class="fb-profile-text">
            <h1>{{author.authorName}}</h1>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <input type="name" v-model="new_name" class="form-control" id="name" placeholder="Enter name">
          </div>
          <button type="submit"class="btn btn-primary">Update</button>
        </form>

        <!-- <div class="form-group purple-border">
        <label for="key">secret key</label>
  
        <textarea id="key" class="form-control" rows=10>
          {{key}}
        </textarea>
        </div> -->
    </div>

    <div>

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

  data() {
    return {
      avatar: "https://via.placeholder.com/90x90",
      author: "...",
      new_name: "",
      new_key: "",
      key: JSON.parse(localStorage.keys)
    }
  },
  methods: {
    name_loaded: function(err, name)
    {
      this.$data.author = name

      // temporary avatar based on author
      if(this.$data.avatar == "https://via.placeholder.com/90x90")
      {
        var imageData = new GIXI(300, name.authorName).getImage();
        this.$data.avatar = imageData
      }
    },
    avatar_loaded: function(err, avatar)
    {
      if(avatar)
        this.$data.avatar = "http://ssb.guild.land/blobs/get/" + avatar
    },

    handleSubmit() {
      console.log("submit")
      if(this.$data.new_name != "" && this.$data.new_name != this.$data.author.authorName)
      {
        console.log("valid changes, post to ssb")
        this.$ssb.then((ssb) => {
          var content = {
            type: 'about',
            about: this.$data.key.id,
            name: this.$data.new_name
          }

          console.log("posting", content)

          sbotLibs.post_as(ssb, JSON.parse(localStorage.keys), content)

          this.$data.new_name = ""
        })
      }
    }
  },

  mounted: function()
  {
    // Async fetch and connect ssb
    this.$ssb.then((ssb) => {
      // console.log(ssb.getAddress("public", function(err, address) { console.log(address) } ))
      // debugger
      sbotLibs.displayName(ssb, JSON.parse(localStorage.keys).id, this.name_loaded)
      sbotLibs.avatar(ssb, JSON.parse(localStorage.keys).id, this.avatar_loaded)   
    })
  },
  
}
</script>

<style scoped>
 

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
    margin: -90px 10px 0px 50px;
    z-index: 9;
    width: 20%; 
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