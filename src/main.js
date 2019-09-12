import Vue from 'vue'
import app from './App.vue'
import router from './router'
import VueTimeago from 'vue-timeago'
Vue.use(VueTimeago, {
	locales: {
    'en': require('date-fns/locale/en'),}
})

import ReadMore from 'vue-read-more';
Vue.use(ReadMore);

import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import EvaIcons from 'vue-eva-icons'
Vue.use(EvaIcons)

import ssbclient from 'vue-ssb'

Vue.use(ssbclient, 
	{ 
		keys: localStorage.keys,
		remote: "wss://ssb.guild.land/~shs:+COav7rGgSXqV36bsgYJK1EHtUuk9SvojPFGdIzJLlA=",
		// remote: "ws://192.168.0.109:8989~shs:5NWaVfaBIWV9fnXuI8xx+mVRf19m8XlCZkeMwxPyilk=",
		manifest: { 
			geospatial: 
			{ 
				read: 'source',
				stream: 'source',
				get: 'async'
			} 
		} // Extra functions provided by GeoSpatial FLumeVue Index
	})

Vue.config.productionTip = false

new Vue({
  router,
  template: '<app/>',
  components: { app }
}).$mount('#app')