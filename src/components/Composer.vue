
<template>
  <div class="form-group media mt-2 col-sm-12 message">
    <img class="pr-3 rounded " style="max-width: 60px;" v-bind:src="avatar">
    <textarea class="form-control" placeholder="New message at this location" v-model="message" v-on:click='writing = true'></textarea>
    
    <button type="button" v-if= 'writing' v-on:click='post' class="btn btn-outline-primary">Post</button>
  </div>
</template>

<script>
var create = require('ssb-validate').create
import sbotLibs from './../sbot'

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

          ssb.getLatest(JSON.parse(localStorage.keys).id, (err, data) => {
            console.log(err)
            console.log(data)
            var state = data ? {
              id: data.key,
              sequence: data.value.sequence,
              timestamp: data.value.timestamp,
              queue: []
            } : {id: null, sequence: null, timestamp: null, queue: []}
            ssb.add(create(state, JSON.parse(localStorage.keys), null,           
              {
                
                type: 'post',
                text: this.$data.message,
                x: x,
                y: y
              }
              , Date.now()), function (err, a, b) {
              console.log("added!", err, a, b)
            })
          })
        })
      }
    },
  },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
