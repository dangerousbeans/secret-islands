
<template>
  <div class="form-group media mt-2 col-sm-12 message">
    <img class="pr-3 rounded " style="max-width: 60px;" v-bind:src="avatar">
    <textarea class="form-control" placeholder="New message at this location" v-model="message" v-on:click='writing = true'></textarea>
    
    <button type="button" v-if= 'writing' v-on:click='post' class="btn btn-outline-primary">Post</button>
  </div>
</template>

<script>

import sbotLibs from './../sbot'
import GIXI from 'gixi'


export default {
  name: 'composer',
  props: {
    x: String,
    y: String
  },
  data() {
    return {
      avatar: "https://via.placeholder.com/90x90",
      message: '',
      writing: false
    }
  },
  mounted: function()
  {
    // Async fetch and connect ssb
    this.$ssb.then((ssb) => {
      sbotLibs.avatar(ssb, JSON.parse(localStorage.keys).id, this.avatar_loaded)
      
    })
  },
  methods: {
    avatar_loaded: function(err, avatar)
    {
      // temporary avatar based on author
      if(this.$data.avatar == "https://via.placeholder.com/90x90")
      {
        var imageData = new GIXI(300, name.authorName).getImage();
        this.$data.avatar = imageData
      }
      if(avatar)
        this.$data.avatar = "http://ssb.guild.land/blobs/get/" + avatar
    },
    post: function(event)
    {
      if(this.$data.message)
      {
        var x = parseInt(this.$props.x)
        var y = parseInt(this.$props.y)

        this.$ssb.then((ssb) => {
          var content = {
            type: 'post',
            text: this.$data.message,
            x: x,
            y: y
          }

          sbotLibs.post_as(ssb, JSON.parse(localStorage.keys), content)
        })
      }
    },
  },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
