import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import TLDashboard from '../views/TLDashboard.vue'
import EmployeeDetails from '../views/EmployeeDetails.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/tl',
    name: 'TLDashboard',
    component: TLDashboard,
    meta: { requiresAuth: true, role: 'tl' }
  },
  {
    path: '/employee/:id',
    name: 'EmployeeDetails',
    component: EmployeeDetails,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  if (to.meta.requiresAuth) {
    if (!user.id) {
      next('/')
      return
    }
    
    if (to.meta.role && user.role !== to.meta.role) {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'admin') {
        next('/admin')
      } else if (user.role === 'tl') {
        next('/tl')
      } else {
        next('/')
      }
      return
    }
  }
  
  next()
})

export default router
