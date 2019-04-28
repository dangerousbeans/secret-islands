<template>
  <div class="form-group">
    <textarea class="form-control" v-model="message"></textarea>
    <vue-tags-input
      v-model="tag"
      :tags="tags"
      @tags-changed="newTags => tags = newTags"
    />
    <button type="button" v-on:click='post' class="btn btn-outline-primary">Post</button>
  </div>
</template>

<script>

import VueTagsInput from '@johmun/vue-tags-input';


export default {
  name: 'composer',
  components: {
    VueTagsInput,
  },
  props: {
    x: String,
    y: String
  },
  data() {
    return {
      message: '',
      tag: '',
      tags: [],
    }
  },
  methods: {
    post: function(event)
    {
      if(this.$data.message)
      {
        console.log(this.$data.message)
        console.log(this.$data.tags)
        console.log(this.$props.x)
        console.log(this.$props.y)

        var x = parseInt(this.$props.x)
        var y = parseInt(this.$props.y)

        this.$ssb.then((ssb) => {
          ssb.publish({
            type: 'post',
            text: this.$data.message,
            x: x,
            y: y
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
