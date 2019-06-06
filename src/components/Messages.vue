<template>
  <div class="row">
    
    <Composer :x="$route.params.x" :y="$route.params.y"></Composer>

    <div class="text-center" >      
    </div>

    <div v-if="loading" class="spinner-border" label="Spinning"></div>

    <Message v-for="message in messages" :message="message" v-bind:key="message.key"></Message>
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
      // Ignore sync notification
      if(message.sync)
      {
        this.$data.loading = false
      }  
      else
      {
        this.$data.messages.push(message)
      }
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

      sbotLibs.displayName(ssb, localStorage.keys.id, this.name_loaded)

      var x = parseInt(this.$props.x)
      var y = parseInt(this.$props.y)

      var q = {
        limit: 50,
        reverse: true,
        live: true,
        query: [{
          $filter: {
            value: {
              content: { 
                // type: 'post',
                x: {
                  // $is: "number"
                }, 
                y: {
                  // $is: "number"
                } 
              },
            }
          }}]
      }

      // Load posts from this area
      if(!isNaN(x) && !isNaN(y))
      {
        var c = q.query[0].$filter.value.content

        c.x = { ...c.x, ...{ '$gt': x-distance, '$lt': x+distance } }
        c.y = { ...c.y, ...{ '$gt': y-distance, '$lt': y+distance } }
      }

      // console.log("query:", q.query[0])
        
      var index = ssb.geospatial.read

      var query = index(q)

      pull(
        query,
        pull.drain(this.message_arrived)
      )
  
    } )
  }
}
</script>