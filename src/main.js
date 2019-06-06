import Vue from 'vue'
import app from './App.vue'
import router from './router'
import VueTimeago from 'vue-timeago'
Vue.use(VueTimeago, {
	locales: {
    'en': require('date-fns/locale/en'),}
})

import ssbclient from 'vue-ssb'

Vue.use(ssbclient, 
	{ 
		keys: localStorage.keys,
		remote: "wss://ssb.guild.land/~shs:+COav7rGgSXqV36bsgYJK1EHtUuk9SvojPFGdIzJLlA=",
		manifest: { geospatial: { read: 'source' } } // Extra functions provided by GeoSpatial FLumeVue Index
	})

Vue.config.productionTip = false

new Vue({
  router,
  template: '<app/>',
  components: { app }
}).$mount('#app')