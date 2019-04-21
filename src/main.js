import Vue from 'vue'
import app from './App.vue'
import router from './router'

import ssbclient from 'vue-ssb'

Vue.use(ssbclient, { keys: localStorage.keys, remote: "ws://localhost:9000~shs:TXKFQehlyoSn8UJAIVP/k2BjFINC591MlBC2e2d24mA=" })

Vue.config.productionTip = false

new Vue({
  router,
  template: '<app/>',
  components: { app }
}).$mount('#app')