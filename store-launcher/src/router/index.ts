import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import ConnectStore from '../views/ConnectStore.vue'
import Dashboard from '../views/Dashboard.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/connect'
  },
  {
    path: '/connect',
    name: 'Connect',
    component: ConnectStore
  },
  {
    path: '/dashboard',
    component: Dashboard,
    children: [
      {
        path: '',
        redirect: '/dashboard/config'
      },
      {
        path: 'locations',
        name: 'Locations',
        component: () => import('../views/LocationsSetup.vue')
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('../views/ProductsSetup.vue')
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('../views/InventorySetup.vue')
      },
      {
        path: 'config',
        name: 'Configuration',
        component: () => import('../views/ConfigurationSetup.vue')
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/OrdersSetup.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
