<template>
  <div class="row">
    <Composer :x="$route.params.x" :y="$route.params.y"></Composer>

    <div v-if="loading" class="spinner-border" label="Spinning"></div>

    <Message v-for="message in messages" :message="message" v-bind:key="message.key"></Message>
  </div>
</template>

<script>
import Message from "./Message.vue"
import Composer from "./Composer.vue"
const pull = require('pull-stream')
const drain = require('pull-stream/sinks/drain')
var Abortable = require('pull-abortable')
var abortable = Abortable()

import sbotLibs from './../sbot'

const distance = 2

function sort_on_sequence(a, b){
    var keyA = a.value.timestamp,
        keyB = b.value.timestamp;
    // Compare the 2 dates
    if(keyA < keyB) return 1;
    if(keyA > keyB) return -1;
    return 0;
};

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
        this.$data.messages.sort(sort_on_sequence)
      }
    },
    name_loaded: function(err, name)
    {
      this.$data.identity = name.authorName
    },

    fetch_messages: function()
    {
      this.$data.messages = []
      this.$data.loading = true

      if(this.$data.loading)
        abortable.abort() // incase we were already loading stuff

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
                  type: 'post',
                  x: {
                    $gt: 0
                  }, 
                  y: {
                    $gt: 0
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
          // abortable,
          pull.drain(this.message_arrived)
        )
    
      } )
    }
  },

  watch: {
      x: function(val, oldVal) {
        this.fetch_messages()
      },
      y: function(val, oldVal) {
        this.fetch_messages()
      }
  },

  mounted: function()
  {
    this.fetch_messages()
  }
}
</script>