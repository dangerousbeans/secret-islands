<template>
  <div class="form-group">
    <textarea class="form-control" v-model="message"></textarea>
    <button type="button" v-on:click='post' class="btn btn-outline-primary">Post</button>
  </div>
</template>

<script>
var create = require('ssb-validate').create

export default {
  name: 'composer',
  props: {
    x: String,
    y: String
  },
  data() {
    return {
      message: ''
    }
  },
  methods: {
    post: function(event)
    {
      if(this.$data.message)
      {
        // console.log(this.$data.message)
        // console.log(this.$props.x)
        // console.log(this.$props.y)

        var x = parseInt(this.$props.x)
        var y = parseInt(this.$props.y)

        this.$ssb.then((ssb) => {

          ssb.getLatest(localStorage.keys.id, (err, data) => {
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


          // ssb.publish({
          //   author: localStorage.keys.id,
          //   type: 'post',
          //   text: this.$data.message,
          //   x: x,
          //   y: y
          // }, (err, msg) => {
          //   console.log(err)
          //   console.log(msg)
          // })
        })
      }
    },
  },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
