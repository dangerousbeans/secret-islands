<template>
  <div id="app" class="container">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <Messages msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import Messages from './components/Messages.vue'

export default {
  name: 'app',
  components: {
    Messages
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
