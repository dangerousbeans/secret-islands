import Vue from 'vue'
import VueRouter from 'vue-router'

import Map from './../components/Map'
import Profile from './../components/Profile'
import ViewProfile from './../components/ViewProfile'


Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Map
    },
    {
      path: '/:x(\\d+)/:y(\\d+)',
      name: 'Map',
      component: Map,
      props: true
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile
    },
    {
      path: '/profile/:id',
      name: 'ViewProfile',
      component: ViewProfile,
      props: true
    },
  ]
})
