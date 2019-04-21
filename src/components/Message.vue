<template>
  <div class="media mt-3 col-sm-12 message">
    <img class="pr-3 rounded " style="max-width: 60px;" v-bind:src="avatar">
    <div class="media-body">
      <h5 class="mt-0">
        <!-- <router-link :to="{ params: { hash: message.value.author }}"><span class="">{{ message.value.author }}</span></router-link> -->
        {{ author.authorName }}

        <span class="text-muted">
          {{ message.value.content.type }}
          <span class="text-dark" v-if="message.value.content.channel">#{{ message.value.content.channel }}</span>
        </span>
      </h5>

      <p v-html="message.value.content.text"></p>

      <div class="float-right text-muted small">
        <!-- <timeago v-if="message.value.timestamp" :since="message.value.timestamp" :auto-update="60"></timeago> -->

        <!-- <a class="" @click="raw = !raw">Raw</a> -->
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
pull.paraMap = require('pull-paramap')

export default {
  name: 'message',
  props: ['message'],

  data() {
    return {
      avatar: "http://via.placeholder.com/90x90",
      author: "..."
    }
  },
  methods: {
    name_loaded: function(err, name)
    {
      this.$data.author = name
    },
    avatar_loaded: function(err, avatar)
    {
      this.$data.avatar = "http://localhost:9000/blobs/get/" + avatar
    }
  },

  mounted: function()
  {
    // Async fetch and connect ssb
    this.$ssb.then((ssb) => {
      sbotLibs.displayName(ssb, this.message.value.author, this.name_loaded)
      sbotLibs.avatar(ssb, this.message.value.author, this.avatar_loaded)
      
    })

      

    this.$nextTick(function () {
      // Code that will run only after the
      // entire view has been rendered
    })
  },
  
}
</script>