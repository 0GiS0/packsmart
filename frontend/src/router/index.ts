import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/trip',
      name: 'trip',
      component: () => import('../views/TripView.vue'),
    },
    {
      path: '/packing-list',
      name: 'packing-list',
      component: () => import('../views/PackingListView.vue'),
    },
  ],
})

export default router
