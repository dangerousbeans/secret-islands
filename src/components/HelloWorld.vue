<template>
  <div class="hello">
    <h1>{{ identity }}</h1>
    
    <Message v-for="message in messages" :message="message"></Message>
  </div>
</template>

<script>
import Message from "./Message.vue"
const pull = require('pull-stream')

import sbotLibs from './../sbot'


const opts = {
  limit: 100,
  reverse: true
}

export default {
  name: 'HelloWorld',
  components: {
    Message
  },
  data() {
    return {
      ssb: '',
      messages: [],
      identity: "..."
    }
  },
  props: {
    msg: String
  },
  methods: {
    messages_loaded: function(err, messages)
    {
      this.$data.messages = messages
    },
    name_loaded: function(err, name)
    {
      this.$data.identity = name.authorName
    }
  },

  mounted: function()
  {
    // Async fetch and connect ssb
    this.$ssb.then((ssb) => {
      this.$data.ssb = ssb

      sbotLibs.displayName(ssb, this.ssb.id, this.name_loaded)

      // Load 100 posts
      pull(
        ssb.query.read(opts),
        pull.filter(msg => msg.value.content.type === 'post'),
        pull.collect(this.messages_loaded)
      )
  
    } )
    
    this.$nextTick(function () {
      // Code that will run only after the
      // entire view has been rendered
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
