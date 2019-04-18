import Vue from 'vue'
import App from './App.vue'

import ssbclient from './plugins/vue-ssb'
Vue.use(ssbclient)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
