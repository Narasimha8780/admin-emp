import { createRouter, createWebHistory } from 'vue-router'
import EmployeeLogin from '../views/EmployeeLogin.vue'
import EmployeeDashboard from '../views/EmployeeDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'EmployeeLogin',
    component: EmployeeLogin
  },
  {
    path: '/dashboard',
    name: 'EmployeeDashboard',
    component: EmployeeDashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
