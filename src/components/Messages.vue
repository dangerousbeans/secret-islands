<template>
  <div class="row">
    <Composer @new_post="new_post" :active_tags="this_tile_tags" :x="$props.x" :y="$props.y"></Composer>

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
var abortable

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
    y: String,
    this_tile_tags: Array
  },
  computed: {
    position() {
      return this.x, this.y
    }
  },
  methods: {
    new_post: function()
    {
      this.$emit('new_post')
    },
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
      this.$data.messages = [] // clear
      this.$data.loading = true

      this.$ssb.then((ssb) => {
        this.$data.ssb = ssb

        sbotLibs.displayName(ssb, JSON.parse(localStorage.keys).id, this.name_loaded)

        var x = parseInt(this.$props.x)
        var y = parseInt(this.$props.y)


        var scuttlebuttCity = false
        if(x == 4 && y == 21)
          scuttlebuttCity = true
        

        var q
        if(scuttlebuttCity)
        {
          q = {
          limit: 20,
          reverse: true,
          live: true,
          query: [{
            $filter: {
              value: {
                content: { 
                  type: 'post'
                },
              }
            }}]
          }
        }
        else
        {
          q = {
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

          // filter posts from this area
          if(!isNaN(x) && !isNaN(y))
          {
            var c = q.query[0].$filter.value.content

            c.x = { ...c.x, ...{ '$gt': x-distance, '$lt': x+distance } }
            c.y = { ...c.y, ...{ '$gt': y-distance, '$lt': y+distance } }
          }
        }
        

        var index = ssb.geospatial.read
        var query = index(q)

        pull(
          query,
          abortable = Abortable(), // incase we need to bail midway through
          pull.drain(this.message_arrived)
        )
    
      })
    }
  },

  watch: {
    // if the position moves, load new messages
    position() {
      abortable.abort()
      this.fetch_messages()
    }
  },

  mounted: function()
  {
    this.fetch_messages()
  }
}
</script>


<style scoped>

.message
{
  
}
</style>  