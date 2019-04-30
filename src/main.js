import Vue from 'vue'
import app from './App.vue'
import router from './router'

import ssbclient from 'vue-ssb'

Vue.use(ssbclient, 
	{ 
		keys: localStorage.keys,
		remote: "ws://ssb.guild.land:8989~shs:QdWHHh6xi1OlaaRR9GjjXDp+2IiQZElhy+GGNN4zmgY=",
		key: "QdWHHh6xi1OlaaRR9GjjXDp+2IiQZElhy+GGNN4zmgY=.ed25519" // public key of server
	})

Vue.config.productionTip = false

new Vue({
  router,
  template: '<app/>',
  components: { app }
}).$mount('#app')