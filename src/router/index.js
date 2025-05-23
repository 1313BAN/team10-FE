import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PlanCreateView from '../views/PlanCreateView.vue'
import LoginView from '@/views/user/LoginView.vue'
import RegisterView from '@/views/user/RegisterView.vue'
import MyPageView from '@/views/user/MyPageView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component : LoginView,
    },
    {
      path: '/plan/create',
      name: 'plan-create',
      component: PlanCreateView,
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterView,
    },
    {
      path: '/mypage',
      name: 'MyPage',
      component: MyPageView
    }
  ],
})

export default router
