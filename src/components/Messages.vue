<template>
  <div class="row">
    <h1>{{ identity }}</h1>
    
    <Composer :x="$route.params.x" :y="$route.params.y"></Composer>

    <div class="text-center" style="width: 100%">
      <div v-if="loading" class="spinner-border" label="Spinning"></div>
    </div>
    <Message v-for="message in messages" :message="message"></Message>
  </div>
</template>

<script>
import Message from "./Message.vue"
import Composer from "./Composer.vue"
const pull = require('pull-stream')
const drain = require('pull-stream/sinks/drain')

import sbotLibs from './../sbot'

const distance = 2

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
      identity: "...",
      loading: true
    }
  },
  props: {
    msg: String,
    x: String,
    y: String
  },
  methods: {
    message_arrived: function(message)
    {
      console.log("message_arrived", message)

      // Ignore sync notification
      if(message.sync)
      {
        this.$data.loading = false
      }  
      else
      {
        this.$data.messages.push(message)
      }
    
      console.log(this.$data.messages)
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

      var x = parseInt(this.$props.x)
      var y = parseInt(this.$props.y)

      var q = {
        limit: 100,
        reverse: true,
        live: true,
        query: [{
          $filter: {
            value: {
              content: { 
                type: 'post',
                x: {
                  $is: "number"
                }, 
                y: {
                  $is: "number"
                } 
              },
            }
          }}]
      }

      // Load 100 posts from this area
      if(!isNaN(x) && !isNaN(y))
      {
      
        var c = q.query[0].$filter.value.content

        c.x = { ...c.x, ...{ '$gte': x-distance, '$lte': x+distance } }
        c.y = { ...c.y, ...{ '$gte': y-distance, '$lte': y+distance } }
      }
      var query = ssb.query.read(q)

      console.log(JSON.stringify(q))

      pull(
        query,
        pull.drain(this.message_arrived)
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
