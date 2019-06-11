<template><!-- v-bind:class="distant" -->
  <div class="media mt-3 col-sm-12 message" >
    <img class="pr-3 rounded " style="max-width: 60px;" v-bind:src="avatar">
    <div class="media-body">
      <h5 class="mt-0">
        {{ author.authorName }}
        <span class="text-muted">
          <template v-if="message.value.content.tags">
            {{ message.value.content.tags.join(", ") }}
          </template>
          <span class="text-dark" v-if="message.value.content.channel">#{{ message.value.content.channel }}</span>
        </span>
      </h5>

      <p v-html="textmd"></p>

      <div class="float-right text-muted small">
        <timeago v-if="message.value.timestamp" :datetime="message.value.timestamp" :auto-update="60"></timeago>

        
      </div>
      <!-- {{ relatedMessages }} -->
      <!-- <message v-for="mess in relatedMessages" :message="mess">
      </message> -->

    </div>
  </div>
</template>

<script>
import sbotLibs from './../sbot'
import pull from 'pull-stream'
import GIXI from 'gixi'
pull.paraMap = require('pull-paramap')
var md = require('ssb-markdown')

export default {
  name: 'message',
  props: ['message'],

  data() {
    return {
      avatar: "https://via.placeholder.com/90x90",
      author: "...",
      textmd: "..."
    }
  },
  // computed: {
  //   distant: function () {
  //     return {
  //       distant: (parseInt(this.$props.message.x) != parseInt(this.$route.params.x)) && 
  //       (parseInt(this.$props.message.y) != parseInt(this.$route.params.y)),
  //     }
  //   }
  // },
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
    }
  },

  mounted: function()
  {
    this.$data.textmd = md.block(this.message.value.content.text, { toUrl: function( blob ){ return "http://ssb.guild.land/blobs/get/" + blob } })

    // Async fetch and connect ssb
    this.$ssb.then((ssb) => {
      sbotLibs.displayName(ssb, this.message.value.author, this.name_loaded)
      sbotLibs.avatar(ssb, this.message.value.author, this.avatar_loaded)      
    })
  },
  
}
</script>

<style scoped>

.distant
{
  color: grey;
}

img {
}
</style>  