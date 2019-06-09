import Vue from 'vue'
import VueRouter from 'vue-router'

import Map from './../components/Map'
import Profile from './../components/Profile'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Map
    },
    {
      path: '/:x/:y',
      name: 'Map',
      component: Map
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile
    },
  ]
})
