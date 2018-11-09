import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home.vue'
import View from '@/views/View.vue'
import Edit from '@/views/Edit.vue'
import List from '@/views/List.vue'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/view/:recipeId',
      name: 'view',
      component: View
    },
    {
      path: '/edit/:recipeId',
      name: 'edit',
      component: Edit
    },
    {
      path: '/list',
      name: 'list',
      component: List
    }
  ]
})
