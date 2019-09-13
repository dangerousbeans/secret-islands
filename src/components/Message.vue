<template><!-- v-bind:class="distant" -->
  <div class="media mt-3 col-sm-12 message" >
    <router-link class="" :to="{ name: 'ViewProfile', params: { id: message.value.author } }" >
      <img class="pr-3 rounded " style="max-width: 60px;" v-bind:src="avatar">
    </router-link>
    <div class="media-body">
      <h5 class="mt-0 text-truncate">
        <router-link class="text-dark font-weight-bold" :to="{ name: 'ViewProfile', params: { id: message.value.author } }" >
          {{ author.authorName }}  
        </router-link>
    
        <span class="text-muted">
          <span v-for="tag in message.value.content.tags">
            {{ tag }}
          </span>

          <span v-if="message.value.content.x && message.value.content.y">
            {{ message.value.content.x }}/{{ message.value.content.y }}
          </span>
          
          <span class="text-dark" v-if="message.value.content.channel">#{{ message.value.content.channel }}</span>
        </span>
      </h5>

      <div class="tweet-text">
        <read-more :max-chars="400" :text="textmd"></read-more>
      </div>
      <div class="tweet-footer">
        <!-- <a class="tweet-footer-btn">
          <eva-icon name="message-square-outline"></eva-icon><span>{{replies}}</span>
        </a> -->
        <a class="tweet-footer-btn" v-on:click="likeClick">
          <eva-icon name="heart-outline" animation="pulse"></eva-icon><span>{{likes}}</span>
        </a>
      </div>

      <div class="float-right text-muted small">
        <router-link class="text-muted font-weight-bold" :to="{ name: 'View Post', params: { id: message.key, x: message.value.x, y: message.value.y } }" >
          <timeago v-if="message.value.timestamp" :datetime="message.value.timestamp" :auto-update="60"></timeago>
        </router-link>
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
  props: { 
    'message': {},
    'x': String,
    'y': String,
    'active_tags': Array
   },

  data() {
    return {
      avatar: "https://via.placeholder.com/90x90",
      author: "...",
      textmd: "...",
      likes: 0,
      replies: 0
    }
  },
  
  methods: {
    name_loaded: function(err, name)
    {
      this.$data.author = name

      // temporary avatar based on author
      if(this.$data.avatar == "https://via.placeholder.com/90x90")
      {
        var imageData = new GIXI(300, this.message.value.author).getImage();
        this.$data.avatar = imageData
      }
    },
    avatar_loaded: function(err, avatar)
    {
      if(avatar)
        this.$data.avatar = "http://ssb.guild.land/blobs/get/" + avatar
    },
    likes_loaded: function(err, likes)
    {
      console.log("likes_loaded", likes)
      this.$data.likes = likes
    },
    likeClick: function()
    {
      console.log("like click")

      this.$ssb.then((ssb) => {
        var x = parseInt(this.$props.x)
        var y = parseInt(this.$props.y)

        var content = {
            type: 'vote',
            x: x,
            y: y,
            channel: this.message.value.content.channel,
            tags: this.message.value.content.tags,
            vote: { 
              value: 1, 
              link: this.message.key
            }
          }

          console.log("posting:", content)

          sbotLibs.post_as(ssb, JSON.parse(localStorage.keys), content)
          console.log("posted?")
        })
    }
  },

  mounted: function()
  {
    this.$data.textmd = md.block(this.message.value.content.text, { toUrl: function( blob ){ return "http://ssb.guild.land/blobs/get/" + blob } })

    // Async fetch and connect ssb
    this.$ssb.then((ssb) => {
      sbotLibs.displayName(ssb, this.message.value.author, this.name_loaded)
      sbotLibs.avatar(ssb, this.message.value.author, this.avatar_loaded)    
      sbotLibs.countStream(ssb, this.message.key, this.likes_loaded)  
    })
  },
  
}
</script>

<style scoped>

.tweet-footer-btn {
  margin-right: 30px;
}
.tweet-footer-btn i, .tweet-footer-btn span {
  color: #657786;
  font-size: 16px;
}
.tweet-footer-btn span {
  margin-left: 8px;
}
.tweet-footer-btn svg
{
  cursor: pointer !important; 
}
.distant
{
  color: grey;
}

</style>  