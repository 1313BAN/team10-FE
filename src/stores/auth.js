import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  const setUser = (userInfo) => {
    user.value = userInfo
  }

  const clearUser = () => {
    user.value = null
  }

  return {
    user,
    setUser,
    clearUser,
    isLoggedIn: computed(() => !!user.value),
  }
}, {
  persist: {
    storage: sessionStorage,
  }
})