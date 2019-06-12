<template>
  <nav class="navbar navbar-expand-sm navbar-dark bg-dark">
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
    

    <router-link class="navbar-brand" to="/">◎</router-link>
    <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
      <li class="nav-item">
        <a class="nav-link" href="#"></a>
      </li>
    </ul>

   
    <ul class="navbar-nav ml-auto mt-2 mt-lg-0">
      <li class="nav-item">
        <router-link class="" to="/profile">
          <img class="" :src="avatar" alt="Profile image" style="width: 23px; margin: -10"/>
        </router-link>
      </li>
    </ul>
    
  </div>
</nav>
</template>

<script>
import sbotLibs from './../sbot'
import GIXI from 'gixi'
export default {
  name: 'site-navbar',
  data() {
    return {
      avatar: "https://via.placeholder.com/90x90",
      author: "...",
    }
  },
  mounted: function()
  {
    // Async fetch and connect ssb
    this.$ssb.then((ssb) => {
      sbotLibs.displayName(ssb, JSON.parse(localStorage.keys).id, this.name_loaded)
      sbotLibs.avatar(ssb, JSON.parse(localStorage.keys).id, this.avatar_loaded)
      
    })
  },
  methods: {
    name_loaded: function(err, name)
    {
      this.$data.author = name

      // temporary avatar based on author
      if(this.$data.avatar == "https://via.placeholder.com/90x90")
      {
        var imageData = new GIXI(300, JSON.parse(localStorage.keys).id).getImage();
        this.$data.avatar = imageData
      }
    },
    avatar_loaded: function(err, avatar)
    {
      if(avatar)
        this.$data.avatar = "http://ssb.guild.land/blobs/get/" + avatar
    }
  },
}
</script>

<style scoped>

</style>  