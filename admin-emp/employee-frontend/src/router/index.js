import { createRouter, createWebHistory } from 'vue-router'
import EmployeeLogin from '../views/EmployeeLogin.vue'
import EmployeeDashboard from '../views/EmployeeDashboard.vue'
import EmployeeSignup from '../views/EmployeeSignup.vue'

const routes = [
  {
    path: '/',
    name: 'EmployeeLogin',
    component: EmployeeLogin
  },
  {
    path: '/signup',
    name: 'EmployeeSignup',
    component: EmployeeSignup
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
