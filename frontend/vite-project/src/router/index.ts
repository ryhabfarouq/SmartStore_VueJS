import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import ContactView from '../views/ContactView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('../views/ShopView.vue')
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('../views/ProductDetailView.vue')
    },
    // Authentication Routes
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { guestOnly: true }
    },
    // User portal routes
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/orders/current',
      name: 'current-orders',
      component: () => import('../views/CurrentOrdersView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/orders/history',
      name: 'order-history',
      component: () => import('../views/OrderHistoryView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('../views/FavoritesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue')
    },
    // Admin Dashboard Route
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: () => import('../views/AdminDashboardView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: "/checkout",
      name: "checkout",
      component: () => import('../views/CheckoutView.vue'),
      meta: { requiresAuth: true }
    },
    // Error Routes
    {
      path: '/forbidden',
      name: 'forbidden',
      component: () => import('../views/ForbiddenView.vue')
    },
    // Catch all fallback redirection
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Session restoration flag to run it only once
let isSessionRestored = false

// Navigation guard
router.beforeEach(async (to, _from, next) => {
  const { restoreSession, isAuthenticated, isAdmin } = useAuth()
  
  // Restore session from localStorage on first load
  if (!isSessionRestored) {
    await restoreSession()
    isSessionRestored = true
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)

  if (requiresAuth && !isAuthenticated.value) {
    // Redirect unauthenticated user to login, saving intended path
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (requiresAdmin && !isAdmin.value) {
    // Redirect unauthorized user to Forbidden page
    next({ path: '/forbidden' })
  } else if (guestOnly && isAuthenticated.value) {
    // Redirect authenticated user away from login/register
    next({ path: '/' })
  } else {
    next()
  }
})

export default router
