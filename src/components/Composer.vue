
<template>
  <div class="form-group media mt-2 col-sm-12 message">
    <img class="pr-3 rounded " style="max-width: 60px;" v-bind:src="avatar">
    
    <form @submit.prevent="post">
      <textarea class="form-control" placeholder="New message at this location" v-model="message" v-on:click='writing = true'></textarea>
    
       <vue-tags-input
          v-if= 'writing'
          v-model="tag"
          :tags="tags"
          @tags-changed="newTags => tags = newTags"
        />
      <button type="submit" v-if= 'writing' class="btn btn-outline-primary">Post</button>
    </form>

  </div>
</template>

<script>

import sbotLibs from './../sbot'
import GIXI from 'gixi'
import VueTagsInput from '@johmun/vue-tags-input';

export default {
  name: 'composer',
  props: {
    x: String,
    y: String
  },
  components: {
    VueTagsInput,
  },
  data() {
    return {
      avatar: "https://via.placeholder.com/90x90",
      message: '',
      writing: false,
      tag: '', 
      tags: [],
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
      // temporary avatar based on author
      if(this.$data.avatar == "https://via.placeholder.com/90x90")
      {
        var imageData = new GIXI(300, name.authorName).getImage();
        this.$data.avatar = imageData
      }
      if(avatar)
        this.$data.avatar = "http://ssb.guild.land/blobs/get/" + avatar
    },
    post: function(event)
    {
      if(this.$data.message)
      {
        var x = parseInt(this.$props.x)
        var y = parseInt(this.$props.y)

        console.log(this.$data.tags)

        this.$ssb.then((ssb) => {
          var content = {
            type: 'post',
            text: this.$data.message,
            x: x,
            y: y
          }

          // If there are tags, map their names onto the new post
          if(this.$data.tags.length > 0)
            content.tags = this.$data.tags.map(x => x.text)

          sbotLibs.post_as(ssb, JSON.parse(localStorage.keys), content)
          this.$data.message = ""
        })
      }
    },
  },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
