<template>
  <div class="row">
    <h1>{{ identity }}</h1>
    
    <Composer :x="$route.params.x" :y="$route.params.y"></Composer>
    <Message v-for="message in messages" :message="message"></Message>
  </div>
</template>

<script>
import Message from "./Message.vue"
import Composer from "./Composer.vue"
const pull = require('pull-stream')

import sbotLibs from './../sbot'


export default {
  name: 'Messages',
  components: {
    Message,
    Composer
  },
  data() {
    return {
      ssb: '',
      messages: [],
      identity: "..."
    }
  },
  props: {
    msg: String,
    x: String,
    y: String
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
    console.log(this.$props)

    // Async fetch and connect ssb
    this.$ssb.then((ssb) => {
      this.$data.ssb = ssb

      sbotLibs.displayName(ssb, this.ssb.id, this.name_loaded)

      var x = parseInt(this.$props.x)
      var y = parseInt(this.$props.y)

      // Load 100 posts from this area
      pull(
        ssb.query.read({
          limit: 100,
          reverse: true,
          query: [{
            $filter: {
              value: {
                content: { 
                  type: 'post',
                  x: {
                    $gte: x-2,
                    $lt: x+2
                  }, 
                  y: {
                    $gte: y-2,
                    $lt: y+2
                  }, 

                },
                
              }
            }}]
        }),
        
        // pull.filter(msg => msg.value.content.x === x),
        // pull.filter(msg => msg.value.content.y === y),
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
