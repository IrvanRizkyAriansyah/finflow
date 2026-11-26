import { createRouter, createWebHistory } from 'vue-router'
import { useGoogleAuth } from '@/composables/useGoogleAuth'

const routes = [
  { path: '/onboarding', name: 'onboarding', component: () => import('@/views/OnboardingView.vue'), meta: { public: true } },
  { path: '/', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
  { path: '/transactions', name: 'transactions', component: () => import('@/views/TransactionsView.vue') },
  { path: '/wallets', name: 'wallets', component: () => import('@/views/WalletsView.vue') },
  { path: '/analytics', name: 'analytics', component: () => import('@/views/AnalyticsView.vue') },
  { path: '/profile', name: 'profile', component: () => import('@/views/ProfileView.vue') },
  { path: '/categories', name: 'categories', component: () => import('@/views/CategoriesView.vue') },
  { path: '/goals', name: 'goals', component: () => import('@/views/GoalsView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const { isAuthenticated } = useGoogleAuth()
  if (!to.meta.public && !isAuthenticated.value) return { name: 'onboarding' }
  if (to.meta.public && isAuthenticated.value) return { name: 'dashboard' }
})

export default router